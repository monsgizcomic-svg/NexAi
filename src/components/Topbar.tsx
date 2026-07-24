import React, { useState, useRef, useEffect } from "react";
import { Menu, Eye, EyeOff, User as UserIcon, LogOut, Palette, Check } from "lucide-react";
import { User } from "../types";

export type ThemeMode = "orange" | "blue" | "slate" | "red" | "amber" | "emerald" | "violet";

export const THEMES: { id: ThemeMode; name: string; colorClass: string; hex: string }[] = [
  { id: "orange", name: "Oren", colorClass: "bg-orange-500", hex: "#f97316" },
  { id: "blue", name: "Biru", colorClass: "bg-blue-500", hex: "#3b82f6" },
  { id: "slate", name: "Abu-abu", colorClass: "bg-slate-400", hex: "#94a3b8" },
  { id: "red", name: "Merah", colorClass: "bg-red-500", hex: "#ef4444" },
  { id: "amber", name: "Kuning", colorClass: "bg-amber-500", hex: "#eab308" },
  { id: "emerald", name: "Hijau", colorClass: "bg-emerald-500", hex: "#10b981" },
  { id: "violet", name: "Ungu", colorClass: "bg-violet-500", hex: "#8b5cf6" },
];

interface TopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title: string;
  incognito: boolean;
  onToggleIncognito: () => void;
  user: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export default function Topbar({
  setSidebarOpen,
  title,
  incognito,
  onToggleIncognito,
  user,
  onOpenAuthModal,
  onLogout,
  theme,
  setTheme,
}: TopbarProps) {
  const [themeOpen, setThemeOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  const activeThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    }
    if (themeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [themeOpen]);

  return (
    <div className="h-14 shrink-0 flex items-center gap-2.5 px-4 md:px-6 border-b border-[#1F1F27] bg-[#0A0A0F]">
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[#2B2B35] bg-transparent text-[#EDEBF2] cursor-pointer"
        aria-label="Buka menu"
        id="hamburgerBtn"
      >
        <Menu size={18} />
      </button>
      <span
        className="font-mono text-xs text-[#8D8A99] tracking-wider truncate max-w-[120px] sm:max-w-[200px]"
        id="topbarTitle"
      >
        {incognito ? "percakapan-rahasia" : title}
      </span>
      <div className="flex-1" />

      {/* Theme Switcher Button & Dropdown */}
      <div className="relative" ref={themeDropdownRef}>
        <button
          onClick={() => setThemeOpen(!themeOpen)}
          className="flex items-center gap-1.5 border border-[#2B2B35] bg-[#131318] hover:border-[#4A4A52] text-[#EDEBF2] font-medium text-xs px-2.5 py-1.5 rounded-full cursor-pointer transition-all"
          title="Ubah Tema Warna UI"
          id="themePickerBtn"
        >
          <Palette size={14} className="theme-text-accent shrink-0" />
          <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: activeThemeObj.hex }} />
          <span className="hidden sm:inline text-[11px] font-mono text-[#B7B9C0]">{activeThemeObj.name}</span>
        </button>

        {themeOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[#181820] border border-[#2B2B35] rounded-xl shadow-xl p-2 z-50 animate-fade-in">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8D8A99] px-2.5 py-1 mb-1">
              Pilih Tema Warna
            </div>
            <div className="space-y-0.5">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setThemeOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    theme === t.id
                      ? "bg-[#252532] text-white font-medium"
                      : "text-[#B7B9C0] hover:bg-[#1E1E28] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: t.hex }}
                    />
                    <span>{t.name}</span>
                  </div>
                  {theme === t.id && <Check size={13} className="theme-text-accent" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
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
          <div
            className="w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center theme-bg-subtle theme-text-accent border theme-border"
          >
            {user.displayName.trim().charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-[11px] truncate max-w-[90px] hidden sm:inline">{user.displayName}</span>
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
          className="flex items-center gap-1.5 theme-btn-primary font-semibold text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95 shadow-sm"
          id="topbarAuthBtn"
        >
          <UserIcon size={13} />
          <span>Masuk</span>
        </button>
      )}
    </div>
  );
}
