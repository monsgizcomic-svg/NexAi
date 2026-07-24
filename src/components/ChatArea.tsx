import React, { useRef, useEffect } from "react";
import { Message } from "../types";
import { Copy, Check, Download } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  onSelectSuggestion: (text: string) => void;
}

export default function ChatArea({ messages, onSelectSuggestion }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestions = [
    { label: "Jelasin machine learning", query: "Jelasin konsep machine learning secara sederhana" },
    { label: "Caption Instagram", query: "Bantu aku bikin caption Instagram yang menarik" },
    { label: "Ide bisnis modal minim", query: "Kasih ide rencana bisnis kecil-kecilan yang modalnya minim" },
    { label: "Rencana belajar coding", query: "Buatkan aku rencana belajar coding 30 hari untuk pemula" },
    { label: "Contoh kode validasi email", query: "Buatkan fungsi JavaScript untuk validasi email" },
    { label: "Ringkas fotosintesis", query: "Ringkas cara kerja fotosintesis untuk anak SD" },
  ];

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-xl mx-auto px-6 pt-[8vh] pb-6 text-left" id="hero">
          <div className="w-14 h-14 rounded-full border theme-border flex items-center justify-center theme-bg-subtle mb-6.5">
            <svg
              className="w-6.5 h-6.5 theme-text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            >
              <line x1="12" y1="12" x2="12" y2="4" />
              <line x1="12" y1="12" x2="6" y2="17" />
              <line x1="12" y1="12" x2="18" y2="15" />
              <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="6" cy="17" r="1.3" fill="currentColor" stroke="none" />
              <circle cx="18" cy="15" r="1.3" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h1 className="font-serif font-medium text-3xl md:text-4.5xl text-[#EDEBF2] leading-snug mb-3">
            Tanya apa saja ke <span className="theme-text-accent italic">NexAi</span>.
          </h1>
          <p className="text-[#8D8A99] text-sm md:text-base leading-relaxed max-w-lg">
            Asisten AI yang siap bantu mikir, nulis, ngoding, sampai bikin gambar — langsung dari browser kamu.
          </p>
        </div>

        {/* Suggestions Strip */}
        <div className="max-w-2xl mx-auto px-6 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" id="suggestStrip">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestion(item.query)}
                className="shrink-0 bg-[#131318] border border-[#2B2B35] hover:theme-border hover:theme-bg-subtle text-[#EDEBF2] text-xs px-3.5 py-2.5 rounded-full cursor-pointer transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" ref={scrollRef} id="chatScroll">
      <div className="max-w-2xl mx-auto px-6 py-4 space-y-0" id="chatInner">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className="flex gap-4 py-5.5 border-b border-[#1F1F27] last:border-none"
          >
            {/* Avatar */}
            <div
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-medium border ${
                m.role === "user"
                  ? "bg-[#1B1B22] border-[#2B2B35] text-[#8D8A99]"
                  : "theme-bg-subtle theme-border theme-text-accent"
              }`}
            >
              {m.role === "user" ? (
                "KM"
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="12" x2="12" y2="4" />
                  <line x1="12" y1="12" x2="6" y2="17" />
                  <line x1="12" y1="12" x2="18" y2="15" />
                  <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none" />
                  <circle cx="6" cy="17" r="1.3" fill="currentColor" stroke="none" />
                  <circle cx="18" cy="15" r="1.3" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
                </svg>
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="font-mono text-[10.5px] text-[#8D8A99] mb-1.5 tracking-wider">
                {m.role === "user" ? "Kamu" : "NexAi"}
              </div>

              {/* Attachments within message */}
              {m.attachNames && m.attachNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {m.attachNames.map((name, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-[#1B1B22] border border-[#2B2B35] rounded-lg px-2.5 py-1 font-mono text-[11px] text-[#8D8A99]"
                    >
                      📎 {name}
                    </span>
                  ))}
                </div>
              )}

              {m.pending ? (
                <div className="flex items-center gap-2.5 pt-1" id="thinkingRow">
                  <div className="relative w-5.5 h-5.5 shrink-0">
                    <div className="absolute inset-[-4px] border-1.5 border-transparent border-t-[var(--theme-accent)] rounded-full animate-spin" />
                    <svg
                      className="w-full h-full theme-text-accent animate-node-thinking"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <line x1="12" y1="12" x2="12" y2="4" />
                      <line x1="12" y1="12" x2="6" y2="17" />
                      <line x1="12" y1="12" x2="18" y2="15" />
                      <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none" className="animate-node-dot-1" />
                      <circle cx="6" cy="17" r="1.3" fill="currentColor" stroke="none" className="animate-node-dot-2" />
                      <circle cx="18" cy="15" r="1.3" fill="currentColor" stroke="none" className="animate-node-dot-3" />
                      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" className="animate-node-center" />
                    </svg>
                  </div>
                  <div className="font-mono text-[12px] text-[#8D8A99]">
                    NexAi sedang berpikir<span className="animate-pulse">...</span>
                  </div>
                </div>
              ) : m.imageUrl ? (
                <div>
                  {m.content && formatMessageContent(m.content)}
                  <ImageMedia
                    src={m.imageUrl}
                    fallbackUrls={m.fallbackUrls}
                    title={m.mediaTitle}
                  />
                </div>
              ) : m.videoUrl ? (
                <div>
                  {m.content && formatMessageContent(m.content)}
                  <VideoMedia
                    src={m.videoUrl}
                    fallbackUrls={m.fallbackUrls}
                    title={m.mediaTitle}
                  />
                </div>
              ) : (
                formatMessageContent(m.content)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatMessageContent(content: string) {
  const parts = content.split(/```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g);
  return parts.map((part, index) => {
    if (index % 3 === 0) {
      if (!part) return null;
      let formatted = part;
      // Escape HTML characters to prevent XSS but allow bold and code markup safely
      formatted = formatted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Blockquotes (> text)
      formatted = formatted.replace(
        /^&gt;\s?(.*)$/gm,
        "<blockquote class='border-l-2 theme-border pl-3.5 my-2.5 py-1 text-[#E2E8F0] theme-bg-subtle/50 rounded-r-lg text-sm leading-relaxed'>$1</blockquote>"
      );
      
      // Headings (H1 - H6) - Crisp, distinct, high-contrast titles with left accent borders
      formatted = formatted.replace(/^###### (.*)$/gm, "<h6 class='text-xs font-semibold text-[#CBD5E1] mt-2.5 mb-1'>$1</h6>");
      formatted = formatted.replace(/^##### (.*)$/gm, "<h5 class='text-sm font-semibold text-[#E2E8F0] mt-3 mb-1'>$1</h5>");
      formatted = formatted.replace(/^#### (.*)$/gm, "<h4 class='text-[15px] font-bold text-white mt-3.5 mb-1 pl-2 border-l-2 border-[#3B3B4C]'>$1</h4>");
      formatted = formatted.replace(/^### (.*)$/gm, "<h3 class='text-base font-bold text-white mt-4 mb-1.5 pl-2.5 border-l-2 theme-border flex items-center gap-1.5'>$1</h3>");
      formatted = formatted.replace(/^## (.*)$/gm, "<h2 class='text-lg font-extrabold text-white mt-4.5 mb-2 pb-1 border-b border-[#2B2B38]'>$1</h2>");
      formatted = formatted.replace(/^# (.*)$/gm, "<h1 class='text-xl font-extrabold text-white tracking-wide mt-5 mb-2.5 pb-1 border-b border-[#383848]'>$1</h1>");

      // Markdown links [label](url)
      formatted = formatted.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g,
        (match, label, url) => {
          let displayLabel = label.trim();
          if (displayLabel.startsWith("http") || displayLabel.length > 50) {
            try {
              displayLabel = new URL(url).hostname.replace(/^www\./, "");
            } catch (e) {
              displayLabel = "Kunjungi Tautan";
            }
          }
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 theme-text-accent theme-bg-subtle theme-border border px-2.5 py-0.5 rounded-lg transition-all text-[13px] my-0.5 shrink-0 align-middle hover:opacity-90"><span class="underline">${displayLabel}</span></a>`;
        }
      );

      // Standalone URLs (not inside markdown link tag or href attribute)
      formatted = formatted.replace(
        /(?<!href="|">)(https?:\/\/[^\s<"']+)/g,
        (url) => {
          let domain = "Link Web";
          try {
            domain = new URL(url).hostname.replace(/^www\./, "");
          } catch (e) {}
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 theme-text-accent theme-bg-subtle theme-border border px-2.5 py-0.5 rounded-lg transition-all text-[13px] my-0.5 shrink-0 align-middle hover:opacity-90"><span class="underline">${domain}</span></a>`;
        }
      );

      // Horizontal dividers (compact, centered, subtle)
      formatted = formatted.replace(/^---$/gm, "<hr class='my-3 w-20 mx-auto border-[#333342] border-t' />");

      // Unordered lists (bullet points starting with - or *)
      formatted = formatted.replace(/^[*-] (.*)$/gm, "<li class='list-disc ml-5 my-0.5 text-[#EDEBF2] leading-relaxed'>$1</li>");
      
      // Ordered lists (numbered points)
      formatted = formatted.replace(/^(\d+)\. (.*)$/gm, "<li class='list-decimal ml-5 my-0.5 text-[#EDEBF2] leading-relaxed'>$2</li>");

      // Highlight syntax ==text== (Dedicated theme accent badge)
      formatted = formatted.replace(/==([^=]+)==/g, "<mark class='bg-transparent theme-text-accent theme-bg-subtle theme-border border font-semibold px-1.5 py-0.5 rounded text-[13px]'>$1</mark>");

      // Bold **text** - Crisp high-contrast white text (does not blend with theme accent)
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong class='font-bold text-white'>$1</strong>");
      
      // Italic *text*
      formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em class='italic text-[#CBD5E1]'>$1</em>");

      // Inline code `code`
      formatted = formatted.replace(/`([^`]+)`/g, "<code class='bg-[#181822] border border-[#2B2B38] text-amber-200/90 px-1.5 py-0.5 rounded font-mono text-[12.5px]'>$1</code>");

      // Clean up excessive newlines:
      // 1. Limit consecutive newlines to maximum 1 blank line
      formatted = formatted.replace(/\n{3,}/g, "\n\n");
      // 2. Strip newlines right before and after block elements so whitespace-pre-wrap doesn't create triple spacing
      formatted = formatted.replace(/\n+(?=<h[1-6]|<blockquote|<hr|<li)/gi, "");
      formatted = formatted.replace(/(<\/h[1-6]>|<\/blockquote>|<\/li>|<hr[^>]*>)\n+/gi, "$1");
      
      return (
        <div
          key={index}
          className="text-[#EDEBF2] text-[14.5px] leading-[1.75] whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    } else if (index % 3 === 1) {
      return null;
    } else {
      const lang = parts[index - 1] || "code";
      const code = part;
      return <CodeBlock key={index} lang={lang} code={code} />;
    }
  });
}

interface CodeBlockProps {
  lang: string;
  code: string;
  key?: React.Key;
}

function CodeBlock({ lang, code }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      html: "html",
      css: "css",
      json: "json",
      bash: "sh",
    };
    const ext = extMap[lang.toLowerCase()] || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexai-code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#2B2B35] bg-[#0D0D12]">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#1B1B22] border-b border-[#2B2B35] font-mono text-[11px] text-[#8D8A99]">
        <span className="capitalize">{lang}</span>
        <div className="flex gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 bg-[#131318] border border-[#2B2B35] hover:border-violet-500/30 hover:text-[#EDEBF2] text-[#8D8A99] font-mono text-[10.5px] px-2.5 py-1 rounded-md cursor-pointer transition-all active:scale-95"
            title="Salin Kode"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 bg-[#131318] border border-[#2B2B35] hover:border-violet-500/30 hover:text-[#EDEBF2] text-[#8D8A99] font-mono text-[10.5px] px-2.5 py-1 rounded-md cursor-pointer transition-all active:scale-95"
            title="Unduh file"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-3.5 m-0">
          <code className="font-mono text-xs leading-relaxed text-[#E4E1EC] whitespace-pre">
            {code.trim()}
          </code>
        </pre>
      </div>
    </div>
  );
}

interface ImageMediaProps {
  src: string;
  fallbackUrls?: string[];
  title?: string;
}

function ImageMedia({ src, fallbackUrls = [], title }: ImageMediaProps) {
  const candidateSources = [src, ...fallbackUrls].filter(Boolean);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  const activeUrl = candidateSources[currentIdx] || candidateSources[0];

  const handleError = () => {
    if (currentIdx < candidateSources.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setHasError(true);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = activeUrl;
    a.download = `nexai-generated-image-${Date.now()}.png`;
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="mt-2.5 max-w-lg rounded-xl overflow-hidden border border-[#2B2B38] bg-[#0E0E14] shadow-xl group">
      <div className="relative min-h-[220px] bg-[#14141E] flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0E0E14] text-[#8D8A99] p-4 text-center">
            <div className="w-8 h-8 border-2 border-transparent border-t-amber-400 rounded-full animate-spin mb-3" />
            <span className="font-mono text-xs">Memproses Gambar Nano/Flux Engine...</span>
          </div>
        )}

        {!hasError ? (
          <img
            src={activeUrl}
            alt={title || "Generated Image"}
            onLoad={() => setLoading(false)}
            onError={handleError}
            referrerPolicy="no-referrer"
            onClick={() => setShowModal(true)}
            className={`w-full max-h-[480px] object-cover cursor-pointer transition-opacity duration-300 ${
              loading ? "opacity-0" : "opacity-100"
            }`}
          />
        ) : (
          <div className="p-6 text-center text-[#8D8A99]">
            <p className="text-xs font-mono mb-2">Visual gambar berhasil dirender</p>
            <a
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg theme-bg-subtle theme-border border text-xs theme-text-accent"
            >
              Buka Gambar Full HD
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-3.5 py-2 bg-[#14141A] border-t border-[#23232D] text-xs text-[#8D8A99]">
        <span className="font-mono text-[11px] truncate max-w-[280px]">
          🎨 {title || "Gambar Nano Banana / Flux Engine"}
        </span>
        <div className="flex items-center gap-2">
          {!hasError && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1C1C26] border border-[#2B2B38] hover:text-white text-[11px] transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Unduh Gambar</span>
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#333342] bg-[#0E0E14]">
            <img src={activeUrl} alt="Full view" className="w-full h-full object-contain" />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 bg-black/80 text-white rounded-full px-3 py-1.5 hover:bg-black text-xs font-mono cursor-pointer border border-[#333342]"
            >
              ✕ Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface VideoMediaProps {
  src: string;
  fallbackUrls?: string[];
  title?: string;
  poster?: string;
}

function VideoMedia({ src, fallbackUrls = [], title, poster }: VideoMediaProps) {
  const candidateSources = [src, ...fallbackUrls].filter(Boolean);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [videoError, setVideoError] = React.useState(false);

  const activeUrl = candidateSources[currentIdx] || candidateSources[0];

  const handleVideoError = () => {
    if (currentIdx < candidateSources.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setVideoError(true);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = activeUrl;
    a.download = `nexai-video-${Date.now()}.mp4`;
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="mt-2.5 max-w-lg rounded-xl overflow-hidden border border-[#2B2B38] bg-[#0E0E14] shadow-xl">
      {!videoError ? (
        <video
          src={activeUrl}
          poster={poster}
          controls
          playsInline
          referrerPolicy="no-referrer"
          onError={handleVideoError}
          className="w-full max-h-[360px] object-cover bg-black"
          preload="metadata"
        />
      ) : (
        <VideoCanvasVisualizer title={title} poster={poster} />
      )}

      <div className="flex items-center justify-between px-3.5 py-2 bg-[#14141A] border-t border-[#23232D] text-xs text-[#8D8A99]">
        <span className="font-mono text-[11px] truncate max-w-[280px]">
          🎬 {title || "Video Animasi NexAi Motion Engine"}
        </span>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1C1C26] border border-[#2B2B38] hover:text-white text-[11px] transition-colors cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>Unduh Video</span>
        </button>
      </div>
    </div>
  );
}

function VideoCanvasVisualizer({ title, poster }: { title?: string; poster?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const img = new Image();
    if (poster) {
      img.crossOrigin = "anonymous";
      img.src = poster;
    }

    const render = () => {
      t += 0.04;
      ctx.fillStyle = "#0B0B10";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      // Draw subtle motion scanlines and ambient particles
      ctx.fillStyle = "rgba(11, 11, 16, 0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.strokeStyle = i % 2 === 0 ? "rgba(168, 85, 247, 0.4)" : "rgba(59, 130, 246, 0.4)";
        ctx.lineWidth = 2;
        for (let x = 0; x < canvas.width; x += 15) {
          const y = canvas.height / 2 + Math.sin(x * 0.02 + t + i) * (15 + i * 6);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, poster]);

  return (
    <div className="relative w-full h-[240px] bg-[#0A0A0F] flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} width={480} height={240} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-violet-600/90 hover:bg-violet-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer mb-2"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <span className="text-white font-semibold text-sm drop-shadow">{title || "Render Motion AI NexAi"}</span>
        <span className="text-xs text-slate-300 font-mono mt-1">Player Visual Motion NexAi Engine</span>
      </div>
    </div>
  );
}
