import React, { useState } from "react";
import { X, Globe, Building2, ShieldCheck, Mail, ArrowRight, Sparkles } from "lucide-react";
import { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"google" | "domain" | "nexon">("google");
  
  // Domain Auth state
  const [domainInput, setDomainInput] = useState("");
  const [domainPassword, setDomainPassword] = useState("");
  const [domainError, setDomainError] = useState("");
  
  // Nexon / Email state
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Google Auth state
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");
  const [googleMode, setGoogleMode] = useState<"quick" | "custom">("quick");

  // Google Login simulation
  const handleGoogleAuth = (customEmail?: string, customName?: string) => {
    const emailToUse = customEmail || googleEmailInput.trim() || "user.google@gmail.com";
    const nameToUse = customName || googleNameInput.trim() || emailToUse.split("@")[0] || "Pengguna Google";

    setLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        uid: "google_" + Date.now(),
        email: emailToUse,
        displayName: nameToUse,
      };
      onLoginSuccess(mockUser);
      setLoading(false);
      onClose();
    }, 600);
  };

  // Domain Auth handling
  const handleDomainAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setDomainError("");

    if (!domainInput.trim()) {
      setDomainError("Masukkan domain perusahaan atau email organisasi Anda.");
      return;
    }

    // Extract domain name
    let domainName = domainInput.trim().toLowerCase();
    let email = domainName;
    if (domainName.includes("@")) {
      email = domainName;
      domainName = domainName.split("@")[1];
    } else {
      email = `user@${domainName}`;
    }

    if (!domainName.includes(".")) {
      setDomainError("Format domain tidak valid. Contoh: perusahaan.com atau nama@perusahaan.com");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const orgName = domainName.split(".")[0].toUpperCase();
      const mockUser: User = {
        uid: "domain_" + Date.now(),
        email: email,
        displayName: `${email.split("@")[0]} (${orgName})`,
      };
      onLoginSuccess(mockUser);
      setLoading(false);
      onClose();
    }, 900);
  };

  // Nexon Portal Auth handling
  const handleNexonAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        uid: "nexon_" + Date.now(),
        email: emailInput.trim(),
        displayName: emailInput.split("@")[0] || "Anggota Nexon",
      };
      onLoginSuccess(mockUser);
      setLoading(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#131318] border border-[#2B2B35] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1F1F27] bg-[#0A0A0F]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl theme-bg-subtle border theme-border flex items-center justify-center">
              <Sparkles className="w-4 h-4 theme-text-accent" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-base text-[#EDEBF2]">Masuk ke NexAi</h3>
              <p className="text-[11px] text-[#8D8A99]">Pilih metode autentikasi Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8D8A99] hover:text-[#EDEBF2] p-1.5 rounded-lg hover:bg-[#1B1B22] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-[#0E0E14] border-b border-[#1F1F27]">
          <button
            onClick={() => setActiveTab("google")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === "google"
                ? "bg-[#1B1B22] text-[#EDEBF2] border border-[#2B2B35] shadow-sm"
                : "text-[#8D8A99] hover:text-[#EDEBF2]"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={() => setActiveTab("domain")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === "domain"
                ? "bg-[#1B1B22] text-[#EDEBF2] border border-[#2B2B35] shadow-sm"
                : "text-[#8D8A99] hover:text-[#EDEBF2]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 theme-text-accent" />
            <span>Domain SSO</span>
          </button>

          <button
            onClick={() => setActiveTab("nexon")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === "nexon"
                ? "bg-[#1B1B22] text-[#EDEBF2] border border-[#2B2B35] shadow-sm"
                : "text-[#8D8A99] hover:text-[#EDEBF2]"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nexon SSO</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* 1. GOOGLE AUTH */}
          {activeTab === "google" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-1.5 text-center pb-1">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-[#EDEBF2]">Masuk Akun Google Anda</h4>
                <p className="text-xs text-[#8D8A99] max-w-xs leading-relaxed">
                  Ketik atau pilih email Google Anda untuk terhubung secara langsung.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-[#0E0E14] p-1 rounded-xl border border-[#2B2B35] gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setGoogleMode("quick")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    googleMode === "quick"
                      ? "bg-[#1B1B22] text-[#EDEBF2] border border-[#2B2B35]"
                      : "text-[#8D8A99] hover:text-[#EDEBF2]"
                  }`}
                >
                  Pilih Akun Terdaftar
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleMode("custom")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    googleMode === "custom"
                      ? "bg-[#1B1B22] text-[#EDEBF2] border border-[#2B2B35]"
                      : "text-[#8D8A99] hover:text-[#EDEBF2]"
                  }`}
                >
                  Ketik Email Google
                </button>
              </div>

              {googleMode === "quick" ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-[#8D8A99]">Pilih salah satu akun Google Anda:</p>
                  {[
                    { name: "Akun Utama Google", email: "user.utama@gmail.com" },
                    { name: "Akun Google Kerja", email: "kerja.google@gmail.com" },
                    { name: "Akun Personal Google", email: "personal.user@gmail.com" },
                  ].map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => handleGoogleAuth(acc.email, acc.name)}
                      disabled={loading}
                      className="w-full p-2.5 bg-[#1B1B22] hover:bg-[#252530] border border-[#2B2B35] hover:theme-border rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full theme-bg-subtle theme-text-accent font-bold text-xs flex items-center justify-center border theme-border">
                          {acc.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#EDEBF2] group-hover:theme-text-accent transition-colors">
                            {acc.name}
                          </span>
                          <span className="text-[10.5px] text-[#8D8A99]">{acc.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] theme-text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Pilih &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (googleEmailInput.trim()) {
                      handleGoogleAuth();
                    }
                  }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#EDEBF2]">Email Gmail / Google</label>
                    <input
                      type="email"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="emailanda@gmail.com"
                      required
                      className="w-full bg-[#1B1B22] border border-[#2B2B35] focus:border-violet-500/60 text-[#EDEBF2] text-xs py-2.5 px-3 rounded-xl outline-none transition-colors placeholder:text-[#8D8A99]/60"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#EDEBF2]">Nama Tampilan (Opsional)</label>
                    <input
                      type="text"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full bg-[#1B1B22] border border-[#2B2B35] focus:border-violet-500/60 text-[#EDEBF2] text-xs py-2.5 px-3 rounded-xl outline-none transition-colors placeholder:text-[#8D8A99]/60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !googleEmailInput.trim()}
                    className="w-full mt-1 py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50 shadow-md"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2 text-neutral-800">
                        <span className="w-4 h-4 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
                        Menghubungkan Akun Google...
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Masuk dengan Email Google Ini</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 2. DOMAIN / ORGANIZATION AUTH */}
          {activeTab === "domain" && (
            <form onSubmit={handleDomainAuth} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#EDEBF2] flex items-center justify-between">
                  <span>Domain atau Email Perusahaan</span>
                  <span className="text-[10px] text-violet-400 font-normal">SAML / Enterprise SSO</span>
                </label>
                <div className="relative flex items-center">
                  <Building2 className="absolute left-3 w-4 h-4 text-[#8D8A99]" />
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="perusahaan.com atau email@perusahaan.com"
                    className="w-full bg-[#1B1B22] border border-[#2B2B35] focus:border-violet-500/60 text-[#EDEBF2] text-xs py-2.5 pl-9 pr-3 rounded-xl outline-none transition-colors placeholder:text-[#8D8A99]/60"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#EDEBF2]">Kata Sandi Organisasi (Opsional)</label>
                <input
                  type="password"
                  value={domainPassword}
                  onChange={(e) => setDomainPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1B1B22] border border-[#2B2B35] focus:border-violet-500/60 text-[#EDEBF2] text-xs py-2.5 px-3 rounded-xl outline-none transition-colors placeholder:text-[#8D8A99]/60"
                />
              </div>

              {domainError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px]">
                  {domainError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-2.5 px-4 theme-btn-primary font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menghubungkan ke Domain SSO...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Masuk via Single Sign-On (SSO)</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. NEXON PORTAL AUTH */}
          {activeTab === "nexon" && (
            <form onSubmit={handleNexonAuth} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#EDEBF2]">Email NexonPortal</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-[#8D8A99]" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="nama@nexon.my.id"
                    className="w-full bg-[#1B1B22] border border-[#2B2B35] focus:border-emerald-500/60 text-[#EDEBF2] text-xs py-2.5 pl-9 pr-3 rounded-xl outline-none transition-colors placeholder:text-[#8D8A99]/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50 shadow-md shadow-emerald-600/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses Nexon SSO...
                  </span>
                ) : (
                  <>
                    <span>Lanjut via NexonPortal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <a
                  href="https://nexon.my.id"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#8D8A99] hover:text-[#EDEBF2] underline transition-colors"
                >
                  Belum punya akun NexonPortal? Buat di sini
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0A0A0F] border-t border-[#1F1F27] text-center text-[10.5px] text-[#8D8A99]">
          Terlindungi dengan enkripsi SSL 256-bit. NexAi Auth Security.
        </div>
      </div>
    </div>
  );
}
