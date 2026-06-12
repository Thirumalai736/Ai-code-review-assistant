import { Code2, Sparkles, LogOut, User as UserIcon, History, FileText } from "lucide-react";
import { User } from "../types.js";

interface HeaderProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onToggleHistory: () => void;
  showHistory: boolean;
  historyCount: number;
}

export default function Header({
  user,
  onOpenAuth,
  onLogout,
  onToggleHistory,
  showHistory,
  historyCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-teal-900/30">
            <Code2 className="h-5 w-5 text-slate-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-lg font-bold tracking-tight text-white">
                ReviewDev
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-400 border border-teal-500/20">
                <Sparkles className="h-2.5 w-2.5" /> AI Powered
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Expert Code Auditing Suite</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Toggle History Sidebars */}
          {user && (
            <button
              onClick={onToggleHistory}
              className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                showHistory
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/30"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
              title="Toggle Past Audits Log"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Audits History</span>
              {historyCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[9px] font-bold text-slate-950">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-3 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs text-slate-400 font-mono">Signed in as</span>
                <span className="text-sm font-medium text-slate-100 max-w-[150px] truncate">
                  {user.email}
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-teal-400">
                <UserIcon className="h-4 w-4" />
              </div>
              <button
                onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 transition-all"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 px-4 py-2 text-sm font-semibold transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
            >
              <UserIcon className="h-4 w-4" />
              <span>Connect Developer Workspace</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
