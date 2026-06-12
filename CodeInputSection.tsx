import React, { useState, useRef } from "react";
import { Upload, FileCode, Play, AlertCircle, FileText, Check } from "lucide-react";
import Editor from "@monaco-editor/react";

interface CodeInputSectionProps {
  onAnalyze: (code: string, language: string, filename: string) => void;
  loading: boolean;
}

const SUPPORTED_LANGUAGES = [
  { value: "detect", label: "Auto-Detect Language" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Shell / Bash" },
  { value: "sql", label: "SQL Query" },
];

export default function CodeInputSection({ onAnalyze, loading }: CodeInputSectionProps) {
  const [code, setCode] = useState(`// Paste your source code here or upload a file below
function calculateFactorial(num) {
  if (num === 0 || num === 1) {
    return 1;
  }
  
  // Potential bug: can create infinite stack overflow if "num" is negative
  // Performance smell: recursive call without memoization
  return num * calculateFactorial(num - 1);
}
`);
  const [language, setLanguage] = useState("javascript");
  const [filename, setFilename] = useState("factorial.js");
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper detect language from extension
  const detectLanguage = (name: string): string => {
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "py":
        return "python";
      case "java":
        return "java";
      case "cpp":
      case "cc":
      case "h":
        return "cpp";
      case "go":
        return "go";
      case "rs":
        return "rust";
      case "html":
        return "html";
      case "css":
        return "css";
      case "json":
        return "json";
      case "sh":
        return "bash";
      case "sql":
        return "sql";
      default:
        return "detect";
    }
  };

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content !== undefined) {
        setCode(content);
        const detected = detectLanguage(file.name);
        if (detected !== "detect") {
          setLanguage(detected);
        }
        setFilename(file.name);
        setUploadSuccess(`"${file.name}" loaded successfully into sandbox`);
        setTimeout(() => setUploadSuccess(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    onAnalyze(code, language, filename);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Static Review & Integrity Audit
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl font-sans lg:text-base">
            Paste code, upload local components, or drop code repositories. Our advanced Gemini rules engine runs exhaustive security lookups, bug validations, performance checks, and returns a fully refactored, robust, and copyable version of your source code.
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Editor Wrapper */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
          {/* Editor Header controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-teal-400" />
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-teal-500 focus:outline-none text-xs font-mono text-slate-300 w-44 transition-all"
                title="Double click to edit filename"
                placeholder="filename.js"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-teal-500 transition-all font-mono"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="h-[380px] md:h-[450px]">
            <Editor
              height="100%"
              language={language === "detect" ? "javascript" : language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                minimap: { enabled: false },
                lineNumbersMinChars: 3,
                padding: { top: 12, bottom: 12 },
                scrollbar: { verticalScrollbarSize: 10 },
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* File Drop Drag Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
            dragActive
              ? "border-teal-400 bg-teal-500/5 scale-[0.99]"
              : "border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileChange}
            className="hidden"
            accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.h,.c,.cs,.go,.json,.html,.css,.rs"
          />

          <div className="flex p-3 rounded-full bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-teal-400 group-hover:border-teal-500/30 group-hover:scale-105 transition-all mb-3 shadow-lg">
            <Upload className="h-5 w-5" />
          </div>

          <p className="text-sm text-slate-200 font-sans">
            <span className="font-semibold text-teal-400 cursor-pointer hover:underline">Click to browse</span> or drag & drop files here
          </p>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Accepting JS, TS, PY, JAVA, CPP, GO, RUST, JSON, or SQL (Max 10MB)
          </p>

          {uploadSuccess && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/90 border border-teal-500/30 px-4 py-2 transition-all">
              <div className="flex items-center gap-2 text-teal-400 font-mono text-xs">
                <Check className="h-4 w-4 bg-teal-500/15 p-0.5 rounded-full" />
                <span>{uploadSuccess}</span>
              </div>
            </div>
          )}
        </div>

        {/* Audit trigger action bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 px-8 py-3.5 font-bold tracking-wide shadow-xl shadow-teal-950/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 focus:outline-none"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                <span>Auditing Code Integrity...</span>
              </>
            ) : (
              <>
                <Play className="h-4.5 w-4.5 fill-slate-950 stroke-none" />
                <span>Audit Code & Suggest Fixes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
