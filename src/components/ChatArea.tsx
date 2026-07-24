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
                <img
                  src={m.imageUrl}
                  alt="Generated Image"
                  className="max-w-full rounded-xl border border-[#2B2B35] mt-1.5"
                  referrerPolicy="no-referrer"
                />
              ) : m.videoUrl ? (
                <video
                  src={m.videoUrl}
                  controls
                  className="max-w-full rounded-xl border border-[#2B2B35] mt-1.5"
                />
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
