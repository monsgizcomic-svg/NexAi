import React, { useRef, useEffect, useState } from "react";
import { Plus, Globe, Search, Mic, ArrowUp, X, ChevronDown, Brain, Sparkles } from "lucide-react";
import { Attachment } from "../types";

interface InputZoneProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string) => void;
  pendingAttachments: Attachment[];
  onRemoveAttachment: (index: number) => void;
  onAddAttachments: (files: FileList) => void;
  webSearch: boolean;
  setWebSearch: (val: boolean) => void;
  deepResearch: boolean;
  setDeepResearch: (val: boolean) => void;
  model: string;
  setModel: (val: string) => void;
  effort: string;
  setEffort: (val: string) => void;
  isRecording: boolean;
  onToggleMic: () => void;
  disabled: boolean;
}

export default function InputZone({
  input,
  setInput,
  onSend,
  pendingAttachments,
  onRemoveAttachment,
  onAddAttachments,
  webSearch,
  setWebSearch,
  deepResearch,
  setDeepResearch,
  model,
  setModel,
  effort,
  setEffort,
  isRecording,
  onToggleMic,
  disabled,
}: InputZoneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [input]);

  // Click outside listener for the popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() || pendingAttachments.length > 0) {
        onSend(input);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddAttachments(e.target.files);
      // Reset input value to allow uploading the same file again if desired
      e.target.value = "";
    }
  };

  return (
    <div className="shrink-0 p-5 pt-2 md:p-6.5 md:pt-2.5">
      {/* Attachment Preview Grid */}
      {pendingAttachments.length > 0 && (
        <div className="max-w-2xl mx-auto px-1 flex flex-wrap gap-2 mb-3.5" id="attachPreview">
          {pendingAttachments.map((att, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-[#1B1B22] border border-[#2B2B35] rounded-lg px-2.5 py-1.5 text-xs text-[#EDEBF2] max-w-[180px]"
            >
              {att.type === "image" && att.dataUrl ? (
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="w-5 h-5 rounded object-cover shrink-0"
                />
              ) : (
                <span className="shrink-0">📎</span>
              )}
              <span className="truncate flex-1">{att.name}</span>
              <button
                onClick={() => onRemoveAttachment(index)}
                className="text-[#8D8A99] hover:text-[#EDEBF2] cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Chips */}
      {input.length === 0 && (
        <div className="max-w-2xl mx-auto flex items-center gap-2 px-1 mb-2.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setInput("Buat gambar tentang: ");
              textareaRef.current?.focus();
            }}
            className="flex items-center gap-1.5 bg-[#1B1B22]/60 hover:bg-violet-500/10 border border-[#2B2B35] hover:border-violet-500/30 text-[#8D8A99] hover:text-violet-400 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all shrink-0"
          >
            <span>🎨</span>
            <span>Buat Gambar</span>
          </button>
          <button
            onClick={() => {
              setInput("Buat video tentang: ");
              textareaRef.current?.focus();
            }}
            className="flex items-center gap-1.5 bg-[#1B1B22]/60 hover:bg-violet-500/10 border border-[#2B2B35] hover:border-violet-500/30 text-[#8D8A99] hover:text-violet-400 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all shrink-0"
          >
            <span>🎥</span>
            <span>Buat Video</span>
          </button>
          <div className="h-4 w-[1px] bg-[#2B2B35] mx-1 shrink-0" />
          <button
            onClick={onToggleMic}
            className={`flex items-center gap-1.5 border text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all shrink-0 ${
              isRecording
                ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse"
                : "bg-[#1B1B22]/60 border-[#2B2B35] text-[#8D8A99] hover:text-[#EDEBF2]"
            }`}
          >
            <span>🎙️</span>
            <span>{isRecording ? "Mendengarkan..." : "Bicara (Mic)"}</span>
          </button>
        </div>
      )}

      {/* Input Shell */}
      <div className="max-w-2xl mx-auto bg-[#131318] border border-[#2B2B35] focus-within:border-violet-500/50 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] rounded-2xl p-3 md:p-3.5 flex flex-col gap-2 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis pertanyaan kamu di sini..."
          rows={1}
          className="w-full bg-transparent border-none outline-none resize-none text-[#EDEBF2] text-[14.5px] leading-relaxed max-h-40 placeholder-[#8D8A99] py-0.5"
        />

        {/* Toolbar row */}
        <div className="flex items-center justify-between gap-2.5 pt-1.5 border-t border-[#1F1F27]/60">
          {/* Toolbar Left */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-7.5 h-7.5 rounded-lg bg-transparent hover:bg-[#1B1B22] text-[#8D8A99] hover:text-[#EDEBF2] flex items-center justify-center cursor-pointer transition-colors"
              title="Lampirkan foto, file, atau zip"
              id="attachBtn"
            >
              <Plus size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*,.txt,.md,.js,.ts,.tsx,.json,.csv,.py,.html,.css,.zip"
              className="hidden"
            />

            <button
              onClick={() => setWebSearch(!webSearch)}
              className={`shrink-0 w-7.5 h-7.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                webSearch
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "bg-transparent border-transparent text-[#8D8A99] hover:bg-[#1B1B22] hover:text-[#EDEBF2]"
              }`}
              title="Cari web"
              id="webSearchBtn"
            >
              <Globe size={15} />
            </button>

            <button
              onClick={() => setDeepResearch(!deepResearch)}
              className={`shrink-0 w-7.5 h-7.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                deepResearch
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "bg-transparent border-transparent text-[#8D8A99] hover:bg-[#1B1B22] hover:text-[#EDEBF2]"
              }`}
              title="Deep Research (riset mendalam multi-langkah)"
              id="deepResearchBtn"
            >
              <Search size={15} />
            </button>
          </div>

          {/* Toolbar Right */}
          <div className="flex items-center gap-1.5 shrink-0 relative" ref={popoverRef}>
            {/* Unified Model & Thinking Selector Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1B1B22] border border-[#2B2B35] hover:border-[#3B3B48] text-[#EDEBF2] font-medium text-xs rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Setelan Model & Berpikir"
              id="unifiedModelSettingsBtn"
            >
              <Brain className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="truncate max-w-[130px]">
                {model === "nexai-3.3" ? "NexAi 3.3" : model === "nexai-2.9" ? "NexAi 2.9" : "NexAi 2.4"}
                <span className="text-[#8D8A99] font-normal text-[11px]"> • {effort.charAt(0).toUpperCase() + effort.slice(1)}</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#8D8A99] transition-transform duration-200 shrink-0 ${showSettings ? 'rotate-180' : ''}`} />
            </button>

            {/* Unified Drop-up Settings Panel */}
            {showSettings && (
              <div className="absolute bottom-11 right-0 w-[280px] bg-[#141419] border border-[#2B2B35] rounded-xl p-3.5 shadow-2xl z-50 flex flex-col gap-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#2B2B35] pb-2">
                  <span className="text-xs font-semibold text-[#EDEBF2] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    Model & Berpikir
                  </span>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-[#8D8A99] hover:text-[#EDEBF2] transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Model List */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-[#8D8A99] uppercase tracking-wider">Pilih Model</span>
                  {[
                    { id: "nexai-3.3", name: "NexAi 3.3 (Cerdas)", desc: "Akurasi tinggi & reasoning kuat (NexAi Core Pro)" },
                    { id: "nexai-2.9", name: "NexAi 2.9 (Cepat)", desc: "Sangat responsif & seimbang (NexAi Core Standard)" },
                    { id: "nexai-2.4", name: "NexAi 2.4 (Ringan)", desc: "Efisien untuk chat umum (NexAi Core Lite)" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModel(m.id)}
                      className={`w-full text-left p-2 rounded-lg border flex flex-col transition-all cursor-pointer ${
                        model === m.id
                          ? "bg-violet-500/10 border-violet-500/45 text-violet-300"
                          : "bg-transparent border-transparent text-[#8D8A99] hover:bg-[#20202B]/50 hover:text-[#EDEBF2]"
                      }`}
                    >
                      <span className="text-xs font-semibold">{m.name}</span>
                      <span className="text-[10px] opacity-80 leading-normal">{m.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Effort (Thinking) Selection */}
                <div className="flex flex-col gap-1.5 border-t border-[#2B2B35] pt-2.5">
                  <span className="text-[10px] font-bold text-[#8D8A99] uppercase tracking-wider">Upaya Berpikir (Thinking)</span>
                  <div className="grid grid-cols-4 gap-1 bg-[#0E0E14] p-0.5 rounded-lg border border-[#2B2B35]">
                    {["kecil", "sedang", "besar", "max"].map((eff) => (
                      <button
                        key={eff}
                        onClick={() => setEffort(eff)}
                        className={`text-[10.5px] py-1.5 rounded-md font-medium capitalize cursor-pointer transition-all ${
                          effort === eff
                            ? "bg-violet-500 text-[#0A0A0F]"
                            : "text-[#8D8A99] hover:text-[#EDEBF2] hover:bg-[#20202B]/40"
                        }`}
                      >
                        {eff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onToggleMic}
              className={`shrink-0 w-7.5 h-7.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                isRecording
                  ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse"
                  : "bg-transparent border-transparent text-[#8D8A99] hover:bg-[#1B1B22] hover:text-[#EDEBF2]"
              }`}
              title="Bicara (speech to text)"
              id="micBtn"
            >
              <Mic size={15} />
            </button>

            <button
              disabled={disabled || (!input.trim() && pendingAttachments.length === 0)}
              onClick={() => onSend(input)}
              className="shrink-0 w-8 h-8 rounded-lg border-none bg-violet-500 hover:bg-violet-400 disabled:opacity-30 disabled:cursor-not-allowed text-[#0A0A0F] flex items-center justify-center cursor-pointer transition-all active:scale-95"
              aria-label="Kirim"
              id="sendBtn"
            >
              <ArrowUp size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
      <div className="text-center font-mono text-[10.5px] text-[#8D8A99] mt-2.5">
        NexAi bisa saja salah. Selalu cek ulang info penting.
      </div>
    </div>
  );
}
