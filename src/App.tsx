import React, { useState, useEffect } from "react";
import { Message, Session, Attachment, User } from "./types";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ChatArea from "./components/ChatArea";
import InputZone from "./components/InputZone";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);

  // Active form state
  const [input, setInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [webSearch, setWebSearch] = useState(false);
  const [deepResearch, setDeepResearch] = useState(false);
  const [model, setModel] = useState("nexai-2.9");
  const [effort, setEffort] = useState("sedang");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Determine storage key based on active user
  const userKey = user ? user.uid : "tamu";
  const storageKey = `nexai_chats_${userKey}`;

  // 1. Initial Authentication & Verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const verifyToken = async (idToken: string) => {
      try {
        const FIREBASE_API_KEY = "AIzaSyC8wmFHE0lke_y2aH9PZd1T3_DjVD78aD8";
        const res = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          }
        );
        const data = await res.json();
        if (data.users && data.users[0]) {
          const u = data.users[0];
          const loggedInUser: User = {
            uid: u.localId,
            email: u.email || "",
            displayName: u.displayName || u.email || "Pengguna",
          };
          localStorage.setItem("nexai_session", JSON.stringify(loggedInUser));
          setUser(loggedInUser);
        }
      } catch (err) {
        console.error("Verification failed", err);
      }
      // Clean query parameters from URL safely
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    };

    if (token) {
      verifyToken(token);
    } else {
      const saved = localStorage.getItem("nexai_session");
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {
          localStorage.removeItem("nexai_session");
        }
      }
    }
  }, []);

  // 2. Load sessions from LocalStorage on user key change
  useEffect(() => {
    let loaded: Session[] = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        loaded = JSON.parse(raw);
      }
    } catch (e) {
      loaded = [];
    }

    if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
      loaded = [
        {
          id: Date.now(),
          title: "obrolan-baru",
          messages: [],
          incognito: false,
        },
      ];
    }
    setSessions(loaded);
    setCurrentId(loaded[0].id);
  }, [userKey]);

  // 3. Persist non-incognito sessions on change
  useEffect(() => {
    if (sessions.length > 0) {
      const toSave = sessions.filter((s) => !s.incognito);
      try {
        localStorage.setItem(storageKey, JSON.stringify(toSave));
      } catch (e) {
        console.error("Failed to save sessions", e);
      }
    }
  }, [sessions, storageKey]);

  const currentSession = sessions.find((s) => s.id === currentId) || null;

  // 4. SSO Sign out
  const handleLogout = () => {
    localStorage.removeItem("nexai_session");
    setUser(null);
  };

  // 5. Create a new clean chat session
  const handleNewChat = () => {
    const newSession: Session = {
      id: Date.now(),
      title: "obrolan-baru",
      messages: [],
      incognito: false,
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentId(newSession.id);
  };

  // 6. Toggle incognito session
  const handleToggleIncognito = () => {
    if (currentSession && currentSession.incognito) {
      // If currently inside incognito, switch back to the first non-incognito or new chat
      const normal = sessions.find((s) => !s.incognito);
      if (normal) {
        setCurrentId(normal.id);
      } else {
        handleNewChat();
      }
    } else {
      // Create new secret session
      const secretSession: Session = {
        id: Date.now(),
        title: "percakapan-rahasia",
        messages: [],
        incognito: true,
      };
      setSessions((prev) => [secretSession, ...prev]);
      setCurrentId(secretSession.id);
    }
  };

  // 7. Add file attachments
  const handleAddAttachments = async (files: FileList) => {
    const unpackedList: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Handle zip extraction client side
      if (file.name.toLowerCase().endsWith(".zip")) {
        const JSZip = (window as any).JSZip;
        if (JSZip) {
          try {
            const zip = await JSZip.loadAsync(file);
            const entries = Object.values(zip.files).filter((f: any) => !f.dir) as any[];
            let count = 0;

            for (const entry of entries) {
              if (count >= 15) break;
              const isTextFile = /\.(txt|md|js|jsx|ts|tsx|json|csv|py|html|css|c|cpp|java|go|rb|php)$/i.test(
                entry.name
              );
              if (isTextFile) {
                const textContent = await entry.async("string");
                unpackedList.push({
                  type: "text",
                  name: entry.name,
                  content: textContent.slice(0, 6000),
                });
                count++;
              }
            }
            unpackedList.push({
              type: "zip",
              name: `${file.name} (${count} file dibaca)`,
            });
          } catch (err) {
            unpackedList.push({
              type: "file",
              name: `${file.name} (gagal diekstrak)`,
            });
          }
        } else {
          unpackedList.push({
            type: "file",
            name: `${file.name} (JSZip tidak tersedia)`,
          });
        }
        continue;
      }

      // Handle normal image files
      if (file.type.startsWith("image/")) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        unpackedList.push({
          type: "image",
          name: file.name,
          mime: file.type,
          dataUrl,
        });
      } else {
        // Handle normal text files
        try {
          const textContent = await file.text();
          unpackedList.push({
            type: "text",
            name: file.name,
            content: textContent.slice(0, 6000),
          });
        } catch (err) {
          unpackedList.push({
            type: "file",
            name: `${file.name} (tidak dapat dibaca)`,
          });
        }
      }
    }

    setPendingAttachments((prev) => [...prev, ...unpackedList]);
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // 8. Microphone speech transcriptions
  const handleToggleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser ini tidak mendukung speech-to-text. Silakan gunakan browser modern seperti Chrome.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
    } else {
      const rec = new SpeechRecognition();
      rec.lang = "id-ID";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      rec.onerror = () => setIsRecording(false);

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      rec.start();
    }
  };

  // Helper: auto generated session slug title
  const makeSlug = (text: string) => {
    const slug = text
      .trim()
      .split(/\s+/)
      .slice(0, 4)
      .join("-")
      .toLowerCase();
    return slug.replace(/[^a-z0-9\-]/g, "") || "obrolan";
  };

  // Helper: detect image or video intent
  const detectMediaIntent = (text: string): "image" | "video" | null => {
    const t = text.toLowerCase().trim();
    
    // Skip if it is a "how-to" or explanation request
    if (/\b(cara|bagaimana|tutorial|kenapa|mengapa|apa itu|arti|maksud)\b/i.test(t)) {
      return null;
    }

    // Video check (must include 'video' or 'veo' or 'animasi')
    const hasVideoWord = /\b(video|veo|animasi|film)\b/i.test(t);
    // Image check (must include 'gambar', 'foto', 'ilustrasi', 'lukisan', 'poster', 'image', 'painting')
    const hasImageWord = /\b(gambar|foto|ilustrasi|lukisan|poster|image|painting|draw|lukis)\b/i.test(t);

    if (hasVideoWord) return "video";
    if (hasImageWord) return "image";

    return null;
  };

  // 9. Dispatch send message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() && pendingAttachments.length === 0) return;
    if (!currentId) return;

    // Detect media generation intents
    if (pendingAttachments.length === 0) {
      const mediaKind = detectMediaIntent(textToSend);
      if (mediaKind) {
        await handleGenerateMedia(mediaKind, textToSend);
        return;
      }
    }

    setIsSending(true);
    const textMsg = textToSend;
    const activeAttachments = [...pendingAttachments];

    // Clear state inputs
    setInput("");
    setPendingAttachments([]);

    // Insert user message and assistant placeholder
    const userMsg: Message = {
      role: "user",
      content: textMsg || "(kirim lampiran)",
      attachNames: activeAttachments.map((a) => a.name),
    };

    const assistantMsg: Message = {
      role: "assistant",
      content: "",
      pending: true,
    };

    let updatedSessionMessages = [...(currentSession?.messages || []), userMsg, assistantMsg];

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentId) {
          const isFresh = s.messages.length === 0 && !s.incognito;
          return {
            ...s,
            title: isFresh ? makeSlug(textMsg || "lampiran") : s.title,
            messages: updatedSessionMessages,
          };
        }
        return s;
      })
    );

    try {
      // Build API request payload
      const historyForApi = updatedSessionMessages
        .slice(0, -1) // exclude the pending assistant placeholder
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
          model,
          effort,
          attachments: activeAttachments,
          webSearch,
          deepResearch,
        }),
      });

      let replyText = "";
      if (res.ok) {
        const data = await res.json();
        replyText = data.text;
      } else {
        throw new Error("API call failed");
      }

      // Update session with received reply
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.pending ? { ...m, pending: false, content: replyText } : m
              ),
            };
          }
          return s;
        })
      );
    } catch (err) {
      console.error(err);
      // Fallback response
      const fallbackText =
        "Koneksi backend belum aktif atau server sedang menyala kembali. Hubungkan NexAi dengan mengklik tombol Masuk lewat NexonPortal atau aktifkan Serverless Function Anda.";

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.pending ? { ...m, pending: false, content: fallbackText } : m
              ),
            };
          }
          return s;
        })
      );
    } finally {
      setIsSending(false);
    }
  };

  // 10. Direct Media Generation
  const handleGenerateMedia = async (kind: "image" | "video", prompt: string) => {
    if (!currentId) return;

    setIsSending(true);
    setInput("");

    const userMsg: Message = {
      role: "user",
      content: prompt,
    };

    const assistantMsg: Message = {
      role: "assistant",
      content: "",
      pending: true,
    };

    let updatedSessionMessages = [...(currentSession?.messages || []), userMsg, assistantMsg];

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentId) {
          const isFresh = s.messages.length === 0 && !s.incognito;
          return {
            ...s,
            title: isFresh ? makeSlug(prompt) : s.title,
            messages: updatedSessionMessages,
          };
        }
        return s;
      })
    );

    try {
      const res = await fetch(`/api/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });

      if (!res.ok) throw new Error("Media generation failed");
      const data = await res.json();

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentId) {
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.pending) {
                  return {
                    ...m,
                    pending: false,
                    content: "",
                    imageUrl: kind === "image" ? data.url : undefined,
                    videoUrl: kind === "video" ? data.url : undefined,
                  };
                }
                return m;
              }),
            };
          }
          return s;
        })
      );
    } catch (err) {
      console.error(err);
      const errorText = `Fitur pembuatan ${
        kind === "image" ? "gambar" : "video"
      } sedang bersiap. Konfigurasikan API key Anda di panel Secrets untuk mengaktifkannya secara instan.`;

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.pending ? { ...m, pending: false, content: errorText } : m
              ),
            };
          }
          return s;
        })
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-[#EDEBF2] overflow-hidden">
      <Sidebar
        sessions={sessions}
        currentId={currentId}
        onSelectSession={setCurrentId}
        onNewChat={handleNewChat}
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          title={currentSession ? currentSession.title : "obrolan-baru"}
          incognito={currentSession ? currentSession.incognito : false}
          onToggleIncognito={handleToggleIncognito}
        />

        {/* Incognito mode banner indicator */}
        {currentSession && currentSession.incognito && (
          <div
            className="flex items-center gap-2 max-w-xl mx-auto mt-4 px-4 py-2.5 rounded-xl bg-[#8C8E96]/10 border border-[#8C8E96]/30 font-mono text-xs text-[#B7B9C0] animate-fade-in"
            id="incognitoBanner"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
              <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2" />
            </svg>
            <span>Mode incognito aktif — obrolan ini tidak masuk riwayat.</span>
          </div>
        )}

        <ChatArea
          messages={currentSession ? currentSession.messages : []}
          onSelectSuggestion={handleSendMessage}
        />

        <InputZone
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          pendingAttachments={pendingAttachments}
          onRemoveAttachment={handleRemoveAttachment}
          onAddAttachments={handleAddAttachments}
          webSearch={webSearch}
          setWebSearch={setWebSearch}
          deepResearch={deepResearch}
          setDeepResearch={setDeepResearch}
          model={model}
          setModel={setModel}
          effort={effort}
          setEffort={setEffort}
          isRecording={isRecording}
          onToggleMic={handleToggleMic}
          disabled={isSending}
        />
      </div>
    </div>
  );
}
