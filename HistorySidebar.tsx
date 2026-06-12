import { Trash2, Calendar, FileCode, CheckCircle, ChevronRight, X } from "lucide-react";
import { CodeReview } from "../types.js";

interface HistorySidebarProps {
  reviews: CodeReview[];
  onSelectReview: (review: CodeReview) => void;
  onDeleteReview: (id: string) => void;
  activeReviewId: string | null;
  onClose: () => void;
}

export default function HistorySidebar({
  reviews,
  onSelectReview,
  onDeleteReview,
  activeReviewId,
  onClose,
}: HistorySidebarProps) {
  // Helper to format date
  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Refactored";
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="flex h-full w-80 flex-col border-r border-slate-800 bg-slate-950 font-sans">
      
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 shrink-0">
        <div className="flex flex-col">
          <h4 className="text-sm font-bold tracking-wide text-slate-100 uppercase">Past Audits</h4>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">Checked Sandbox Files</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Review Logs list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 mb-3.5">
              <FileCode className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold text-slate-400 block font-sans">No Audit Log Found</span>
            <p className="text-[11px] text-slate-600 mt-1 font-sans leading-relaxed">
              When logged in, your code audits persist here across browser sessions.
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const isActive = rev.id === activeReviewId;
            const scoreStyle = scoreColor(rev.reviewResult.overallScore);

            return (
              <div
                key={rev.id}
                onClick={() => onSelectReview(rev)}
                className={`group relative flex flex-col rounded-xl border p-3 cursor-pointer transition-all ${
                  isActive
                    ? "bg-slate-900 border-teal-500/60 shadow shadow-teal-500/5 scale-102"
                    : "bg-slate-900/40 hover:bg-slate-900/80 border-slate-900 hover:border-slate-800"
                }`}
              >
                
                {/* Score Tag Upper-Right */}
                <div className={`absolute top-2.5 right-2.5 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${scoreStyle}`}>
                  {rev.reviewResult.overallScore}h
                </div>

                {/* Filename and Language */}
                <div className="pr-12">
                  <span className="text-xs font-semibold text-slate-200 select-none block truncate max-w-[170px]" title={rev.filename}>
                    {rev.filename}
                  </span>
                  <p className="text-[9px] text-teal-400 uppercase font-bold tracking-wider font-mono mt-0.5">
                    {rev.language}
                  </p>
                </div>

                {/* Footer specs */}
                <div className="flex items-center justify-between border-t border-slate-800/40 mt-3 pt-2 text-slate-400 text-[10px] font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span>{formatDate(rev.createdAt)}</span>
                  </div>

                  {/* Clean Trash Bin delete action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this review history entry?")) {
                        onDeleteReview(rev.id);
                      }
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-red-950/20 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    title="Delete record from workspace"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
