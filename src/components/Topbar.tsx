import React from "react";
import { Menu, Eye, EyeOff, User as UserIcon, LogOut } from "lucide-react";
import { User } from "../types";

interface TopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title: string;
  incognito: boolean;
  onToggleIncognito: () => void;
  user: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export default function Topbar({
  setSidebarOpen,
  title,
  incognito,
  onToggleIncognito,
  user,
  onOpenAuthModal,
  onLogout,
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
      
      {/* Incognito Toggle */}
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
        <span id="incognitoLabel" className="hidden sm:inline">
          {incognito ? "Incognito aktif" : "Incognito"}
        </span>
      </button>

      {/* User profile or Auth Modal Trigger */}
      {user ? (
        <div className="flex items-center gap-2 bg-[#131318] border border-[#2B2B35] py-1 px-2.5 rounded-full text-xs text-[#EDEBF2]">
          <div className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px] flex items-center justify-center">
            {user.displayName.trim().charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-[11px] truncate max-w-[100px] hidden sm:inline">{user.displayName}</span>
          <button
            onClick={onLogout}
            title="Keluar"
            className="text-[#8D8A99] hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
          >
            <LogOut size={13} />
          </button>
        </div>
      ) : (
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95 shadow-sm shadow-violet-600/20"
          id="topbarAuthBtn"
        >
          <UserIcon size={13} />
          <span>Masuk</span>
        </button>
      )}
    </div>
  );
}
