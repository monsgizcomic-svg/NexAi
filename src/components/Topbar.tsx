import React from "react";
import { Menu, Eye, EyeOff } from "lucide-react";

interface TopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title: string;
  incognito: boolean;
  onToggleIncognito: () => void;
}

export default function Topbar({
  setSidebarOpen,
  title,
  incognito,
  onToggleIncognito,
}: TopbarProps) {
  return (
    <div className="h-14 shrink-0 flex items-center gap-3 px-6 border-b border-[#1F1F27] bg-[#0A0A0F]">
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden flex items-center justify-center w-9.5 h-9.5 rounded-lg border border-[#2B2B35] bg-transparent text-[#EDEBF2] cursor-pointer"
        aria-label="Buka menu"
        id="hamburgerBtn"
      >
        <Menu size={18} />
      </button>
      <span
        className="font-mono text-xs text-[#8D8A99] tracking-wider truncate"
        id="topbarTitle"
      >
        {incognito ? "percakapan-rahasia" : title}
      </span>
      <div className="flex-1" />
      <button
        onClick={onToggleIncognito}
        className={`flex items-center gap-2 border bg-transparent font-medium text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all ${
          incognito
            ? "bg-[#8C8E96]/14 border-[#8C8E96] text-[#D2D3D8]"
            : "border-[#2B2B35] text-[#8D8A99] hover:border-[#4A4A52] hover:text-[#EDEBF2]"
        }`}
        aria-pressed={incognito ? "true" : "false"}
        id="incognitoToggle"
      >
        {incognito ? <EyeOff size={14} /> : <Eye size={14} />}
        <span id="incognitoLabel">
          {incognito ? "Incognito aktif" : "Incognito"}
        </span>
      </button>
    </div>
  );
}
