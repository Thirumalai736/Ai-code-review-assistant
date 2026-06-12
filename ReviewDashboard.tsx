import { useState } from "react";
import { 
  Check, 
  Copy, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  FileCode, 
  HelpCircle,
  Eye,
  CheckCircle,
  ShieldAlert,
  Zap,
  TrendingUp,
  Download
} from "lucide-react";
import { CodeReview, ReviewIssue, SeverityType } from "../types.js";

interface ReviewDashboardProps {
  review: CodeReview;
  onReset: () => void;
}

export default function ReviewDashboard({ review, onReset }: ReviewDashboardProps) {
  const { code, filename, language, reviewResult, createdAt } = review;
  const { summary, overallScore, issues, improvedCode } = reviewResult;

  const [activeTab, setActiveTab] = useState<"side-by-side" | "issues" | "improved">("side-by-side");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Record<number, boolean>>({ 0: true });
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedImproved, setCopiedImproved] = useState(false);
  const [copiedSnippets, setCopiedSnippets] = useState<Record<number, boolean>>({});

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(code);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyImproved = () => {
    navigator.clipboard.writeText(improvedCode);
    setCopiedImproved(true);
    setTimeout(() => setCopiedImproved(false), 2000);
  };

  const handleCopySnippet = (index: number, txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedSnippets((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedSnippets((prev) => ({ ...prev, [index]: false }));
    }, 2000);
  };

  // Trigger browser print logic (configured for perfect PDF reporting)
  const handleDownloadPDF = () => {
    window.print();
  };

  const toggleIssueExpansion = (idx: number) => {
    setExpandedIssues((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Get score layout colors
  const getScoreColorClass = (score: number) => {
    if (score >= 85) return { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/15" };
    if (score >= 60) return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", glow: "shadow-amber-500/15" };
    return { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", glow: "shadow-rose-500/15" };
  };

  const scoreTheme = getScoreColorClass(overallScore);

  // Group severity statistics
  const categoryCounts = {
    Bugs: issues.filter((i) => i.category === "Bugs").length,
    Security: issues.filter((i) => i.category === "Security").length,
    Performance: issues.filter((i) => i.category === "Performance").length,
    "Best Practices": issues.filter((i) => i.category === "Best Practices").length,
    "Code Smells": issues.filter((i) => i.category === "Code Smells").length,
  };

  const severityCounts = {
    critical: issues.filter((i) => i.severity === "critical").length,
    warning: issues.filter((i) => i.severity === "warning").length,
    medium: issues.filter((i) => i.severity === "medium").length,
    info: issues.filter((i) => i.severity === "info").length,
  };

  // Filter issues based on category selection
  const filteredIssues = selectedCategory
    ? issues.filter((i) => i.category === selectedCategory)
    : issues;

  // Split original code to render beautiful annotated lines
  const originalLines = code.split("\n");

  const getSeverityBadge = (sev: SeverityType) => {
    switch (sev) {
      case "critical":
        return <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20 font-mono">🔴 CRITICAL BUG</span>;
      case "warning":
        return <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20 font-mono">🟠 SECURITY RISK</span>;
      case "medium":
        return <span className="inline-flex items-center gap-1 rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-400 border border-yellow-500/20 font-mono">🟡 PERFORMANCE</span>;
      case "info":
        return <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20 font-mono">🔵 BEST PRACTICE</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 printable-container">
      
      {/* 1. SCOREBOARD OVERVIEW BLOCK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        
        {/* Rounded Progress Meter */}
        <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-800 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Integrity Score</span>
          <div className={`relative flex items-center justify-center h-28 w-28 rounded-full ${scoreTheme.bg} border-4 ${scoreTheme.border} ${scoreTheme.glow} shadow-lg mt-4 transition-all duration-500`}>
            <div className="text-center">
              <span className={`text-4xl font-extrabold font-sans tracking-tight ${scoreTheme.text}`}>{overallScore}</span>
              <span className="text-xs text-slate-500 font-mono block">/ 100</span>
            </div>
          </div>
          <span className={`text-sm font-semibold mt-3 ${scoreTheme.text} capitalize`}>
            {overallScore >= 85 ? "Excellent Architecture" : overallScore >= 60 ? "Acceptable but Vulnerable" : "Action Required"}
          </span>
        </div>

        {/* AI Prompt Summary */}
        <div className="md:col-span-2 flex flex-col justify-between p-2">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 font-sans">
              <Sparkles className="h-4.5 w-4.5 text-teal-400 animate-pulse" />
              <span>Executive Quality Review</span>
            </h3>
            <p className="text-sm font-light text-slate-300 leading-relaxed mt-2.5">
              {summary}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/60 font-mono">
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 text-center">
              <span className="text-[10px] text-slate-500 uppercase block">Bugs</span>
              <span className={`text-base font-bold ${categoryCounts.Bugs > 0 ? "text-red-400" : "text-slate-400"}`}>
                {categoryCounts.Bugs}
              </span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 text-center">
              <span className="text-[10px] text-slate-500 uppercase block">Security</span>
              <span className={`text-base font-bold ${categoryCounts.Security > 0 ? "text-amber-400" : "text-slate-400"}`}>
                {categoryCounts.Security}
              </span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 text-center">
              <span className="text-[10px] text-slate-500 uppercase block">Performance</span>
              <span className={`text-base font-bold ${categoryCounts.Performance > 0 ? "text-yellow-400" : "text-slate-400"}`}>
                {categoryCounts.Performance}
              </span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 text-center">
              <span className="text-[10px] text-slate-500 uppercase block">Code Scent</span>
              <span className="text-base font-bold text-blue-400">
                {categoryCounts["Code Smells"] + categoryCounts["Best Practices"]}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ACTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-1 border-b border-slate-800">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 font-sans">
          <button
            onClick={() => setActiveTab("side-by-side")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "side-by-side"
                ? "bg-teal-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Side-by-Side Review</span>
          </button>
          
          <button
            onClick={() => setActiveTab("issues")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "issues"
                ? "bg-teal-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Comprehensive Issues ({issues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("improved")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "improved"
                ? "bg-teal-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Synthesized Code</span>
          </button>
        </div>

        {/* Global Toolbar controls */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs px-3.5 py-2 font-medium text-slate-300 transition-all cursor-pointer"
            title="Download PDF Report"
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF Export</span>
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs px-3.5 py-2 font-medium text-slate-300 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Audit Fresh File</span>
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC WORKSPACE BODY */}
      
      {/* Tab A: SIDE BY SIDE EXTREME AUDIT */}
      {activeTab === "side-by-side" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* ORIGINAL CODE COLUMN (Annotated Line by Line) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between bg-slate-900/50 px-4 py-2.5 border-b border-slate-800 font-mono text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-slate-800 font-bold uppercase text-[9px] tracking-wider text-teal-400">Original</span>
                <span>{filename}</span>
              </div>
              <button
                onClick={handleCopyOriginal}
                className="flex items-center gap-1 text-[11px] hover:text-slate-100 transition-all font-mono py-0.5 px-2 rounded hover:bg-slate-800/80 cursor-pointer"
              >
                {copiedOriginal ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedOriginal ? "Copied" : "Copy Source"}</span>
              </button>
            </div>

            {/* Line annotation scrollbox */}
            <div className="max-h-[600px] overflow-y-auto font-mono text-slate-300 text-xs py-4 select-text selection:bg-teal-500/20">
              {originalLines.map((lineContent, idx) => {
                const lineNum = idx + 1;
                // Find if an issue matches this line
                const matchedIssues = issues.filter((i) => i.line === lineNum);
                const hasIssue = matchedIssues.length > 0;
                
                // Color highlight line background
                let lineBg = "hover:bg-slate-900/40";
                let badgeMarker: string | null = null;
                if (hasIssue) {
                  const criticalCount = matchedIssues.filter(i => i.severity === "critical").length;
                  const warningCount = matchedIssues.filter(i => i.severity === "warning").length;
                  if (criticalCount > 0) {
                    lineBg = "bg-red-500/10 hover:bg-red-500/15 border-l-2 border-red-500";
                    badgeMarker = "🔴";
                  } else if (warningCount > 0) {
                    lineBg = "bg-amber-500/10 hover:bg-amber-500/15 border-l-2 border-amber-500";
                    badgeMarker = "🟠";
                  } else {
                    lineBg = "bg-blue-500/5 hover:bg-blue-500/10 border-l-2 border-blue-500";
                    badgeMarker = "🟡";
                  }
                }

                return (
                  <div key={idx} className="flex flex-col">
                    {/* Source Line Row */}
                    <div className={`flex items-start ${lineBg} transition-colors group/row py-0.5 pr-4`}>
                      {/* Gutter Gutter Line count */}
                      <span className="w-10 text-right pr-3 font-mono text-slate-600 select-none text-[11px] shrink-0 pt-0.5">
                        {lineNum}
                      </span>
                      {hasIssue && (
                        <span className="text-[11px] mr-1 text-slate-500 pt-0.5 select-none" title="Line diagnostic marker">
                          {badgeMarker}
                        </span>
                      )}
                      <pre className="whitespace-pre flex-1 overflow-x-auto text-slate-300 select-text leading-relaxed font-mono">
                        {lineContent}
                      </pre>
                    </div>

                    {/* Inline warnings injector */}
                    {hasIssue && matchedIssues.map((issue, issueIdx) => {
                      const style = issue.severity === "critical" 
                        ? { bg: "bg-red-950/20", text: "text-red-400", border: "border-red-900/35" }
                        : issue.severity === "warning"
                        ? { bg: "bg-amber-950/20", text: "text-amber-400", border: "border-amber-900/35" }
                        : { bg: "bg-blue-950/15", text: "text-blue-400", border: "border-blue-900/35" };

                      return (
                        <div 
                          key={issueIdx} 
                          className={`ml-10 my-1 mr-4 rounded-lg p-3.5 border text-[11px] ${style.bg} ${style.border} ${style.text}`}
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-1">
                              <div>
                                <span className="font-bold border-r border-slate-800/40 pr-2 mr-2 font-sans tracking-wide uppercase text-[10px]">
                                  {issue.category}
                                </span>
                                <span className="font-semibold text-slate-200">{issue.title}</span>
                              </div>
                              <p className="text-slate-300 leading-normal font-sans font-light">
                                {issue.explanation}
                              </p>
                              {issue.suggestion && (
                                <div className="mt-2.5">
                                  <div className="flex items-center justify-between text-slate-400 bg-slate-950/60 px-3 py-1 rounded-t-md font-mono text-[10px] border-b border-slate-900/40">
                                    <span>Suggested correction</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopySnippet(idx * 100 + issueIdx, issue.suggestion)}
                                      className="hover:text-slate-100 flex items-center gap-1 cursor-pointer"
                                    >
                                      {copiedSnippets[idx * 100 + issueIdx] ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                                      <span>{copiedSnippets[idx * 100 + issueIdx] ? "Copied" : "Copy Fix"}</span>
                                    </button>
                                  </div>
                                  <pre className="p-2.5 overflow-x-auto rounded-b-md bg-slate-950 text-emerald-400/90 font-mono text-[11px] border border-t-0 border-slate-900/40 leading-relaxed max-h-48 overflow-y-auto">
                                    {issue.suggestion}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* REFACTORED CODE COLUMN */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between bg-slate-900/50 px-4 py-2.5 border-b border-slate-800 font-mono text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-gradient-to-r from-emerald-500 to-teal-500 font-bold uppercase text-[9px] tracking-wider text-slate-950">Refactored</span>
                <span>{filename}</span>
              </div>
              <button
                onClick={handleCopyImproved}
                className="flex items-center gap-1 text-[11px] hover:text-slate-100 transition-all font-mono py-0.5 px-2 rounded hover:bg-slate-800/80 cursor-pointer"
              >
                {copiedImproved ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedImproved ? "Copied" : "Copy Refactored"}</span>
              </button>
            </div>

            {/* Read-Only Refactored Lines scrollbox */}
            <div className="max-h-[600px] overflow-y-auto font-mono text-slate-300 text-xs py-4 leading-relaxed select-text selection:bg-emerald-500/20 bg-slate-950/30">
              {improvedCode.split("\n").map((line, idx) => (
                <div key={idx} className="flex items-start hover:bg-slate-900/20 pr-4">
                  <span className="w-10 text-right pr-3 font-mono text-slate-700 select-none text-[11px] shrink-0 pt-0.5">
                    {idx + 1}
                  </span>
                  <pre className="whitespace-pre flex-1 text-slate-100 overflow-x-auto font-mono">
                    {line}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab B: COMPREHENSIVE FILTERED EXPANDABLE ISSUES LIST */}
      {activeTab === "issues" && (
        <div className="space-y-4">
          
          {/* Pill Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-2 uppercase tracking-wide">Filter Categories:</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg font-sans transition-all cursor-pointer ${
                selectedCategory === null 
                  ? "bg-slate-300 text-slate-950 font-bold" 
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100"
              }`}
            >
              All Categories ({issues.length})
            </button>
            {Object.entries(categoryCounts).map(([cat, cnt]) => {
              if (cnt === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg font-sans transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? "bg-teal-500 text-slate-950 font-bold" 
                      : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100"
                  }`}
                >
                  {cat} ({cnt})
                </button>
              );
            })}
          </div>

          {/* Issues expanding cards */}
          <div className="space-y-3.5">
            {filteredIssues.map((issue, idx) => {
              const isExpanded = !!expandedIssues[idx];
              const criticalBorder = issue.severity === "critical" 
                ? "border-red-500/40 bg-red-950/5 hover:bg-red-950/10" 
                : issue.severity === "warning"
                ? "border-amber-500/40 bg-amber-950/5 hover:bg-amber-950/10"
                : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60";

              return (
                <div 
                  key={idx} 
                  className={`rounded-xl border ${criticalBorder} overflow-hidden transition-all shadow-md`}
                >
                  {/* Card trigger summary */}
                  <div 
                    onClick={() => toggleIssueExpansion(idx)}
                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        {getSeverityBadge(issue.severity)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tracking-wider font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 uppercase">
                            {issue.category}
                          </span>
                          {issue.line && (
                            <span className="text-xs text-slate-400 font-mono">
                              Line {issue.line}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100 mt-1 font-sans">
                          {issue.title}
                        </h4>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? (
                        <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4.5 w-4.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expand-collapsed section */}
                  {isExpanded && (
                    <div className="px-4 pb-4.5 pt-1.5 border-t border-slate-800/50 space-y-4">
                      {/* Explanatory description paragraph */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wide">Analysis & Remedy</span>
                        <p className="text-sm font-light text-slate-300 leading-relaxed font-sans">
                          {issue.explanation}
                        </p>
                      </div>

                      {/* Snippet correction view */}
                      {issue.suggestion && (
                        <div className="rounded-xl border border-slate-800/80 bg-slate-950 overflow-hidden mt-3">
                          <div className="flex items-center justify-between text-slate-400 bg-slate-900/60 px-4 py-2 border-b border-slate-800 font-mono text-xs">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Proposed Secure Revision
                            </span>
                            <button
                              onClick={() => handleCopySnippet(idx, issue.suggestion)}
                              className="text-[11px] hover:text-slate-100 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedSnippets[idx] ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              <span>{copiedSnippets[idx] ? "Snippet Copied" : "Copy Suggested Snippet"}</span>
                            </button>
                          </div>
                          <pre className="p-4 overflow-x-auto text-emerald-400/90 font-mono text-xs leading-relaxed max-h-56">
                            {issue.suggestion}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab C: SYNTHESIZED REMODEL VERSION */}
      {activeTab === "improved" && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between bg-slate-900/50 px-5 py-3 border-b border-slate-800 font-mono text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-200">Reconstructed Secure Model</span>
              <span className="text-slate-500 font-normal">({language || filename})</span>
            </div>
            <button
              onClick={handleCopyImproved}
              className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-all font-mono py-1 px-3 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              {copiedImproved ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedImproved ? "Synthesized Output Copied" : "Copy Entire Solution"}</span>
            </button>
          </div>

          <div className="p-5 font-mono text-slate-300 text-xs py-4 leading-relaxed select-text select-all overflow-x-auto max-h-[600px] overflow-y-auto">
            {improvedCode.split("\n").map((line, idx) => (
              <div key={idx} className="flex items-start hover:bg-slate-900/25">
                <span className="w-10 text-right pr-3.5 font-mono text-slate-700 select-none text-[11px] shrink-0 pt-0.5">
                  {idx + 1}
                </span>
                <pre className="whitespace-pre flex-1 text-slate-100 overflow-x-auto font-mono">
                  {line}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          PRINT OVERRIDE STYLING (FOR PERFECT PDF)
          ========================================== */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .printable-container {
            background: white !important;
            color: black !important;
            padding: 20px !important;
          }
          /* Hide non-printable elements */
          button, header, select, select-box, .nav-tabs, div.flex.font-mono, select.language {
            display: none !important;
          }
          /* Override dark classes for high-quality dark-free laser prints */
          .bg-slate-900, .bg-slate-950, .bg-slate-950/80 {
            background: #fafafa !important;
            border-color: #ddd !important;
            color: black !important;
          }
          pre, code, span, p, h2, h3, h4 {
            color: black !important;
            text-shadow: none !important;
          }
        }
      `}</style>

    </div>
  );
}
