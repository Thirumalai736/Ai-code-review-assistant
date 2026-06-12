import React, { useState } from "react";
import { X, Lock, Mail, ChevronRight, UserPlus, LogIn, AlertCircle } from "lucide-react";
import { User } from "../types.js";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all standard credentials.");
      return;
    }

    setError(null);
    setLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An issue occurred during identification.");
      }

      onSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to establish a workspace connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-4/5 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />

        {/* Header */}
        <div className="px-6 pt-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-sans text-slate-100">
              {isLogin ? "Welcome Back Developer" : "Deploy Your Account"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {isLogin 
                ? "Synchronize reviews across dev workstations" 
                : "Create a safe partition to persist audit sessions"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 border-b border-slate-800 mt-5 mx-6">
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer ${
              isLogin 
                ? "text-teal-400 border-teal-500 scale-102" 
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer ${
              !isLogin 
                ? "text-teal-400 border-teal-500 scale-102" 
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Forms body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-lg bg-red-950/20 border border-red-900/30 p-3.5 text-xs text-red-400">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email input field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="developer@workstation.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 py-2.5 pl-10 pr-4 text-sm font-light text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Security Key (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 py-2.5 pl-10 pr-4 text-sm font-light text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-semibold py-2.5 mt-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            ) : isLogin ? (
              <>
                <LogIn className="h-4 w-4" />
                <span>Synchronize Workspace</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Initialize Credentials</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-500 font-mono mt-4">
            Stateless JSON Web Tokens are securely persisted in local client storage.
          </p>
        </form>
      </div>
    </div>
  );
}
