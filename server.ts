import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper: Retrieve and shuffle all unique keys configured for rotation
function getAllGeminiApiKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const val = process.env[`GEMINI_KEY_${i}`];
    if (val) {
      keys.push(val);
    }
  }
  const defaultKey = process.env.GEMINI_API_KEY;
  if (defaultKey) {
    keys.push(defaultKey);
  }
  const uniqueKeys = Array.from(new Set(keys)).filter(Boolean);
  // Shuffle keys so they get selected uniformly
  return uniqueKeys.sort(() => Math.random() - 0.5);
}

// ---------------------------------------------------------
// 1. API Endpoint: POST /api/chat
// ---------------------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model, effort, attachments, webSearch, deepResearch } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const keys = getAllGeminiApiKeys();
    if (keys.length === 0) {
      return res.status(500).json({
        error: "Kunci API NexAi belum dikonfigurasi. Harap tambahkan API_KEY di rahasia lingkungan Anda.",
      });
    }

    // Define the candidate list of models.
    // Try the preferred model first, then try other standard models as fallbacks.
    let preferredModel = "gemini-2.0-flash"; // Default fallback
    let fallbackModels: string[] = [];
    if (model === "nexai-2.4") {
      preferredModel = "gemini-1.5-flash";
      fallbackModels = ["gemini-1.5-flash-8b", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-3.5-flash", "gemini-1.5-pro"];
    } else if (model === "nexai-2.9") {
      preferredModel = "gemini-2.0-flash";
      fallbackModels = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro"];
    } else if (model === "nexai-3.3") {
      preferredModel = "gemini-3.5-flash";
      fallbackModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro"];
    } else {
      preferredModel = "gemini-3.5-flash";
      fallbackModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro"];
    }

    const allModelCandidates = [preferredModel, ...fallbackModels];

    let lastError: any = null;
    let replyText = "";
    let groundingChunks: any[] = [];
    let success = false;

    // Loop through target models in preference order, and for each try configured keys
    for (const targetModel of allModelCandidates) {
      for (const apiKey of keys) {
        try {
          // Initialize the GoogleGenAI instance with telemetry headers
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          // Map reasoning effort to max output tokens
          const effortMap: Record<string, number> = {
            kecil: 400,
            sedang: 1000,
            besar: 2000,
            max: 4000,
          };
          const maxOutputTokens = effortMap[effort] || 1000;

          // Convert message history to Google GenAI structure (user and model roles)
          const contents = messages.map((m: any) => {
            const role = m.role === "assistant" ? "model" : "user";
            return {
              role,
              parts: [{ text: m.content || "" }] as any[],
            };
          });

          // Inject attachments to the user's latest message if applicable
          if (contents.length > 0) {
            const lastMsg = contents[contents.length - 1];
            if (lastMsg.role === "user" && attachments && Array.isArray(attachments)) {
              attachments.forEach((att: any) => {
                if (att.type === "image" && att.dataUrl) {
                  const match = att.dataUrl.match(/^data:(.+);base64,(.*)$/);
                  if (match) {
                    const mimeType = match[1];
                    const base64Data = match[2];
                    lastMsg.parts.push({
                      inlineData: {
                        mimeType,
                        data: base64Data,
                      },
                    });
                  }
                } else if (att.type === "text" && att.content) {
                  lastMsg.parts.push({
                    text: `\n\n[Isi file ${att.name || "lampiran"}]:\n${att.content}`,
                  });
                }
              });
            }
          }

          // Trigger generateContent call
          const response = await ai.models.generateContent({
            model: targetModel,
            contents,
            config: {
              maxOutputTokens,
              // If webSearch or deepResearch is toggled, inject search grounding tools
              tools: webSearch || deepResearch ? [{ googleSearch: {} }] : undefined,
            },
          });

          replyText = response.text || "Maaf, saya tidak dapat merumuskan jawaban saat ini.";
          groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          
          lastError = null; // Success! Reset error
          success = true;
          break; // Stop key rotation on success
        } catch (err: any) {
          console.warn(`NexAi API key rotation failed with model ${targetModel}:`, err.message || err);
          lastError = err;
        }
      }
      if (success) {
        break; // Stop model fallback loop on success
      }
    }

    if (lastError) {
      const errMsg = lastError.message || JSON.stringify(lastError);
      const isQuota = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED");
      
      let friendlyText = "";
      if (isQuota) {
        friendlyText = `⚠️ **Semua Kunci API Mengalami Pembatasan Kuota (429 Quota Exceeded)**\n\nMaaf sekali, kuota gratis untuk seluruh kunci API NexAi saat ini sedang habis atau terkena pembatasan rate limit.\n\n**Solusi:**\n1. Harap tunggu beberapa menit kemudian coba kirim ulang pesan Anda.\n2. Jika Anda adalah pemilik aplikasi, pastikan Anda telah memasang API Key yang valid di panel **Secrets** atau di Environment Variables Anda.\n\n*Detail Error: ${errMsg}*`;
      } else {
        friendlyText = `⚠️ **Koneksi Gagal**\n\nTerjadi kesalahan saat memanggil layanan kecerdasan buatan NexAi.\n\n*Detail Error: ${errMsg}*`;
      }
      return res.json({ text: friendlyText });
    }

    // If search grounding was used, pull in URLs/sources and append them elegantly
    if (groundingChunks && groundingChunks.length > 0) {
      const sources: string[] = [];
      groundingChunks.forEach((chunk) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push(`- [${chunk.web.title}](${chunk.web.uri})`);
        }
      });
      if (sources.length > 0) {
        replyText += `\n\n**Sumber / Referensi Terkait:**\n${sources.join("\n")}`;
      }
    }

    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "Something went wrong in /api/chat" });
  }
});

// ---------------------------------------------------------
// 2. API Endpoint: POST /api/image
// ---------------------------------------------------------
app.post("/api/image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const keys = getAllGeminiApiKeys();
    let imageUrl = "";
    let lastError: any = null;

    if (keys.length > 0) {
      for (const apiKey of keys) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image",
            contents: [{ text: prompt }],
            config: {
              imageConfig: {
                aspectRatio: "1:1",
                imageSize: "1K",
              },
            },
          });

          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (imageUrl) {
            lastError = null;
            break; // Stop rotation on success
          } else {
            throw new Error("No image data returned from GenAI model");
          }
        } catch (err: any) {
          console.warn(`Image generation key rotation failed:`, err.message || err);
          lastError = err;
        }
      }
    }

    // Fallback directly to Pollinations AI if key fails or is not pro
    if (!imageUrl) {
      console.log("Using Pollinations AI fallback for prompt:", prompt);
      const encodedPrompt = encodeURIComponent(prompt);
      imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    }

    res.json({ url: imageUrl });
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate image." });
  }
});

// ---------------------------------------------------------
// 3. API Endpoint: POST /api/video
// ---------------------------------------------------------
app.post("/api/video", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const t = prompt.toLowerCase();
    let selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-screen-with-binary-code-41864-large.mp4"; // Default abstract tech

    if (/\b(kucing|anjing|hewan|monyet|burung|cat|dog|animal|pet|monkey|bird)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-playful-cat-lying-on-its-back-41584-large.mp4";
    } else if (/\b(hutan|pemandangan|alam|gunung|sungai|pohon|nature|forest|mountain|river|green|tree)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4";
    } else if (/\b(laut|pantai|air|samudra|ombak|ocean|beach|sea|wave|water|underwater)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-underwater-view-of-ocean-waves-breaking-41561-large.mp4";
    } else if (/\b(musik|pesta|lampu|laser|disko|ajeb|konser|music|party|dance|light|neon)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32115-large.mp4";
    }

    res.json({ url: selectedUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to initiate video generation." });
  }
});

// ---------------------------------------------------------
// 4. Vite Dev Server & Static Serving Integration
// ---------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production bundle
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NexAi Server listening on port ${PORT}`);
  });
}

startServer();
