import React from "react";
import { Plus, Power, LogOut } from "lucide-react";
import { Session, User } from "../types";

interface SidebarProps {
  sessions: Session[];
  currentId: number | null;
  onSelectSession: (id: number) => void;
  onNewChat: () => void;
  user: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: () => void;
}

export default function Sidebar({
  sessions,
  currentId,
  onSelectSession,
  onNewChat,
  user,
  onLogout,
  isOpen,
  onClose,
  onOpenAuthModal,
}: SidebarProps) {
  const visibleSessions = sessions.filter((s) => !s.incognito);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          id="sidebarBackdrop"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-66 shrink-0 bg-[#131318] border-r border-[#1F1F27] flex flex-col p-5.5 z-50 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        id="sidebar"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 pb-6 px-1.5">
          <div className="relative w-7.5 h-7.5 rounded-full border theme-border flex items-center justify-center bg-gradient-to-tr theme-bg-subtle">
            <svg
              className="w-4 h-4 theme-text-accent"
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
          </div>
          <div className="font-serif font-semibold text-lg text-[#EDEBF2] tracking-wide">
            Nex<span className="font-sans font-normal text-[#8D8A99]">Ai</span>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="flex items-center justify-center gap-2 w-full theme-bg-subtle border theme-border theme-text-accent font-medium text-[13.5px] py-2.5 px-3.5 rounded-xl cursor-pointer transition-colors mb-5 hover:opacity-90"
          id="newChatBtn"
        >
          <Plus size={14} />
          <span>Obrolan baru</span>
        </button>

        {/* History Title */}
        <div className="font-mono text-[10px] tracking-widest uppercase text-[#8D8A99] px-2 mb-2.5">
          Riwayat
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1" id="historyList">
          {visibleSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelectSession(s.id);
                onClose();
              }}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs tracking-wide transition-colors truncate border ${
                s.id === currentId
                  ? "bg-[#1B1B22] theme-border theme-text-accent font-medium"
                  : "bg-transparent border-transparent text-[#8D8A99] hover:bg-[#1B1B22] hover:text-[#EDEBF2]"
              }`}
            >
              {s.title}
            </button>
          ))}
          {visibleSessions.length === 0 && (
            <div className="text-center py-4 text-[11px] text-[#8D8A99] italic">
              Belum ada riwayat
            </div>
          )}
        </div>

        {/* Status Footer */}
        <div className="pt-4 mt-2 border-t border-[#1F1F27] font-mono text-[10.5px] text-[#8D8A99] flex justify-between items-center shrink-0">
          <span className="flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_1px_rgba(110,231,183,0.6)] inline-block mr-1.5" />
            Online
          </span>
          <span>v2.0</span>
        </div>

        {/* Authentication Card */}
        <div className="mt-2.5 shrink-0">
          {user ? (
            <div
              className="p-2.5 rounded-xl bg-[#1B1B22] border border-[#2B2B35] flex items-center gap-2.5"
              id="accountCard"
            >
              <div
                className="w-7.5 h-7.5 rounded-full theme-bg-subtle border theme-border flex items-center justify-center font-serif text-xs font-semibold theme-text-accent"
                id="accountAvatar"
              >
                {user.displayName.trim().charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-width-0 overflow-hidden">
                <div
                  className="text-xs font-medium text-[#EDEBF2] truncate"
                  id="accountName"
                >
                  {user.displayName}
                </div>
                <div className="font-mono text-[9.5px] text-[#8D8A99] truncate">
                  NexonPortal SSO
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-[#8D8A99] hover:text-[#EDEBF2] p-1 rounded transition-colors"
                id="logoutBtn"
                aria-label="Keluar"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div
              className="p-3 rounded-xl bg-[#1B1B22] border border-[#2B2B35] text-center flex flex-col gap-2"
              id="loginCard"
            >
              <p className="text-[11.5px] text-[#8D8A99] leading-relaxed">
                Masuk untuk menyimpan riwayat & menggunakan fitur penuh.
              </p>
              <button
                onClick={onOpenAuthModal}
                className="w-full theme-btn-primary font-semibold text-xs py-2 rounded-lg transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                id="loginBtn"
              >
                <span>Masuk / Daftar</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
