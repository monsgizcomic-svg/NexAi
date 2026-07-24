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

// Helper: Sanitize string to remove zero-width spaces (\u200B-\u200D), non-breaking spaces (\u00A0), BOM (\uFEFF), and non-ASCII chars
function cleanKey(val?: string): string {
  if (!val) return "";
  return val
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

// Helper: Retrieve and shuffle all unique keys configured for rotation (supports KEY1..50, AQ1..50, GEMINI_API_KEY, process.env)
function getAllApiKeys(): string[] {
  const keys: string[] = [];

  // 1. Check common indexed key names (KEY1..KEY50, KEY_1..50, AQ1..AQ50, AQ_KEY_1..50, GEMINI_KEY_1..50)
  for (let i = 1; i <= 50; i++) {
    if (process.env[`KEY${i}`]) keys.push(cleanKey(process.env[`KEY${i}`]));
    if (process.env[`KEY_${i}`]) keys.push(cleanKey(process.env[`KEY_${i}`]));
    if (process.env[`AQ${i}`]) keys.push(cleanKey(process.env[`AQ${i}`]));
    if (process.env[`AQ_${i}`]) keys.push(cleanKey(process.env[`AQ_${i}`]));
    if (process.env[`AQ_KEY_${i}`]) keys.push(cleanKey(process.env[`AQ_KEY_${i}`]));
    if (process.env[`AQ_KEY${i}`]) keys.push(cleanKey(process.env[`AQ_KEY${i}`]));
    if (process.env[`GEMINI_KEY_${i}`]) keys.push(cleanKey(process.env[`GEMINI_KEY_${i}`]));
  }

  // 2. Check generic single key names
  const fallbackNames = [
    "KEY",
    "API_KEY",
    "AQ_KEY",
    "AQ",
    "NEXAI_KEY",
    "NEXAI_API_KEY",
    "GEMINI_API_KEY",
    "GEMINI_KEY",
  ];
  for (const name of fallbackNames) {
    if (process.env[name]) keys.push(cleanKey(process.env[name]));
  }

  // 3. Smart Scan: Scan all process.env for any env var matching KEY / AQ patterns OR values starting with AIza / AQ
  for (const [envKey, envVal] of Object.entries(process.env)) {
    if (!envVal) continue;
    const cleanVal = cleanKey(envVal);

    if (!cleanVal) continue;

    // If env key matches KEY, AQ, GEMINI, NEXAI patterns
    if (
      /^(KEY|AQ|GEMINI|NEXAI)_?\d*$/i.test(envKey) ||
      /^(AQ_KEY|API_KEY|GEMINI_API_KEY)_?\d*$/i.test(envKey)
    ) {
      keys.push(cleanVal);
    } else if (
      // Or if the value itself looks like a valid Gemini/Google API Key (starts with AIzaSy or AQ... and is 20-80 chars)
      /^(AIzaSy|AQ)[a-zA-Z0-9_\-\.]{20,80}$/.test(cleanVal)
    ) {
      keys.push(cleanVal);
    }
  }

  // Sanitize and filter empty
  const cleanedKeys = keys.map((k) => cleanKey(k)).filter(Boolean);
  const uniqueKeys = Array.from(new Set(cleanedKeys));
  
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

    const keys = getAllApiKeys();
    if (keys.length === 0) {
      return res.status(500).json({
        error: "Kunci API NexAi belum dikonfigurasi. Harap tambahkan KEY1, KEY2, dll. di Environment Variables Vercel Anda.",
      });
    }

    // Candidate models exclusively using Free Tier compliant Flash models (NO Pro models)
    let preferredModel = "gemini-2.5-flash";
    let fallbackModels: string[] = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

    if (model === "nexai-3.5") {
      preferredModel = "gemini-2.5-flash";
      fallbackModels = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
    } else if (model === "nexai-3.3") {
      preferredModel = "gemini-2.5-flash";
      fallbackModels = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
    } else if (model === "nexai-2.9") {
      preferredModel = "gemini-2.0-flash";
      fallbackModels = ["gemini-2.5-flash", "gemini-2.0-flash-lite"];
    } else if (model === "nexai-2.4") {
      preferredModel = "gemini-2.0-flash-lite";
      fallbackModels = ["gemini-2.0-flash", "gemini-2.5-flash"];
    }

    const allModelCandidates = Array.from(new Set([preferredModel, ...fallbackModels]));

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

          // Map reasoning effort to generous max output tokens for deep professional responses
          const effortMap: Record<string, number> = {
            kecil: 1500,
            sedang: 4000,
            besar: 8000,
            max: 16000,
          };
          const maxOutputTokens = effortMap[effort] || 4000;

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

          // System instruction to ensure identity, professional depth, expert coding capability, and structured formatting as NexAi
          const systemInstruction = `Anda adalah NexAi, asisten AI tingkat lanjut yang berfokus pada profesionalisme tinggi, kemampuan pemrograman/coding tingkat senior, dan kejelasan komunikasi.

Prinsip Utama NexAi:
1. **Identitas**: Nama Anda adalah NexAi. Jika pengguna bertanya secara langsung atau teknis tentang sistem atau model yang digunakan, jelaskan dengan ramah dan profesional bahwa NexAi ditenagai oleh mesin pemrosesan **NexAi Neural Engine** yang sangat cepat, responsif, hemat energi, dan dirancang khusus untuk analisis cerdas serta coding berakurasi tinggi. DILARANG KERAS menyebut atau membawa nama Gemini, Flash, Google, atau nama/merek pihak ketiga lainnya dalam respon Anda.
2. **Kualitas Bahasa & Profesionalisme**:
   - Gunakan Bahasa Indonesia yang sangat elegan, baku, lugas, ramah, dan profesional.
   - Jawab langsung ke inti pertanyaan dengan penjelasan yang berbobot, mudah dipahami, dan terstruktur dengan rapi.
3. **Kemampuan Pemrograman (Coding Expert)**:
   - Saat memberikan jawaban pemrograman atau kode, selalu berikan kode yang lengkap, bersih, modular, type-safe, dan sesuai dengan *best practices* industri terkini.
   - Sertakan penjelasan arsitektur atau cara kerja kode secara terstruktur dan runtut.
4. **Format Markdown Rapi & Kontras Tinggi**:
   - Gunakan sub-judul (\`###\` atau \`####\`) untuk membagi topik/bagian jawaban agar rapi.
   - Gunakan cetak tebal (\`**istilah**\`) secara hemat & wajar (hanya untuk nama variabel, istilah teknis utama, atau poin penting). DILARANG mencetak tebal terlalu banyak kata dalam satu kalimat.
   - Susun teks dengan alur paragraf yang efisien, tidak terlalu renggang, dan rapi.
5. **Dilarang Menggunakan Emoji**: DILARANG menggunakan emoji dalam respon Anda, KECUALI jika pengguna secara khusus memintanya.`;

          // Trigger generateContent call
          const response = await ai.models.generateContent({
            model: targetModel,
            contents,
            config: {
              systemInstruction,
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
      const seenTitles = new Set<string>();

      groundingChunks.forEach((chunk) => {
        if (chunk.web?.uri) {
          let cleanTitle = (chunk.web.title || "").trim();
          let uri = chunk.web.uri.trim();

          // Extract domain if title is empty or generic
          if (!cleanTitle || cleanTitle.length > 50) {
            try {
              cleanTitle = new URL(uri).hostname.replace(/^www\./, "");
            } catch (e) {
              cleanTitle = "Lihat Sumber";
            }
          }

          if (!seenTitles.has(cleanTitle)) {
            seenTitles.add(cleanTitle);
            sources.push(`- [${cleanTitle}](${uri})`);
          }
        }
      });

      if (sources.length > 0) {
        replyText += `\n\n---\n**Sumber & Referensi Terkait:**\n${sources.join("\n")}`;
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

    let imageUrl = "";

    // A. Check OpenRouter API Key if configured
    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY;
    if (openrouterKey) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${cleanKey(openrouterKey)}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ais-build.app",
            "X-Title": "NexAi App",
          },
          body: JSON.stringify({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            messages: [{ role: "user", content: `Generate an image: ${prompt}` }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices?.[0]?.message?.content) {
            const content = data.choices[0].message.content;
            // extract markdown image URL if present
            const match = content.match(/https?:\/\/[^\s\)\"]+\.(png|jpg|jpeg|webp|gif)/i) || content.match(/https?:\/\/[^\s\)\"]+/i);
            if (match) {
              imageUrl = match[0];
            }
          }
        }
      } catch (orErr) {
        console.warn("OpenRouter image generation attempt failed:", orErr);
      }
    }

    // B. Try Gemini Image Generation
    if (!imageUrl) {
      const keys = getAllApiKeys();
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

            const imageModels = ["imagen-3.0-generate-002", "imagen-3.0-fast-generate-001", "gemini-2.0-flash"];
            for (const imgModel of imageModels) {
              try {
                const response = await ai.models.generateContent({
                  model: imgModel,
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

                if (imageUrl) break;
              } catch (imgErr) {
                // ignore
              }
            }

            if (imageUrl) break;
          } catch (err: any) {
            console.warn(`Gemini image rotation failed:`, err.message || err);
          }
        }
      }
    }

    // C. Fallback directly to Pollinations AI (High reliability, fast & free)
    if (!imageUrl) {
      console.log("Using Pollinations AI image generator for prompt:", prompt);
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
    let selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-screen-with-binary-code-41864-large.mp4"; // Default tech

    if (/\b(kucing|cat|kitten)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-playful-cat-lying-on-its-back-41584-large.mp4";
    } else if (/\b(anjing|dog|puppy)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-dog-running-on-the-grass-in-a-park-41582-large.mp4";
    } else if (/\b(hutan|alam|gunung|pohon|nature|forest|mountain|tree)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4";
    } else if (/\b(laut|pantai|air|samudra|ombak|ocean|beach|sea|wave)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-underwater-view-of-ocean-waves-breaking-41561-large.mp4";
    } else if (/\b(musik|pesta|laser|disko|konser|music|party|dance|light|neon)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32115-large.mp4";
    } else if (/\b(kota|mobil|jalanan|malam|city|car|street|traffic|night)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-a-busy-city-intersection-at-night-42880-large.mp4";
    } else if (/\b(awan|langit|bintang|angkasa|sky|cloud|space|star)\b/i.test(t)) {
      selectedUrl = "https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-clouds-over-the-mountains-41559-large.mp4";
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
