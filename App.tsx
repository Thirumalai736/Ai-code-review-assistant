import { useState, useEffect } from "react";
import { 
  AlertCircle, 
  Sparkles, 
  Play, 
  Upload, 
  FileCode, 
  CheckCircle,
  Code,
  ArrowRight,
  ShieldAlert,
  Terminal,
  X
} from "lucide-react";
import Header from "./components/Header.jsx";
import AuthModal from "./components/AuthModal.jsx";
import CodeInputSection from "./components/CodeInputSection.jsx";
import ReviewDashboard from "./components/ReviewDashboard.jsx";
import HistorySidebar from "./components/HistorySidebar.jsx";
import { User, CodeReview } from "./types.js";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("dev_review_token"));
  const [user, setUser] = useState<User | null>(null);
  
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [activeReview, setActiveReview] = useState<CodeReview | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // 1. Recover active user profile from token on initialization
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Token reference expired.");
        }
        const profile = await response.json();
        setUser({ id: profile.id, email: profile.email });
        setShowHistory(true); // Open history on login by default for convenient workspace
      } catch (err) {
        // Drop bad or expired credentials
        localStorage.removeItem("dev_review_token");
        setToken(null);
        setUser(null);
      }
    };
    fetchProfile();
  }, [token]);

  // 2. Fetch history whenever authenticated user is resolved
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !token) {
        setReviews([]);
        return;
      }
      try {
        const response = await fetch(`/api/history/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error("Failed to load history list logs: ", error);
      }
    };
    fetchHistory();
  }, [user, token]);

  const handleLoginSuccess = (newUser: User, newToken: string) => {
    localStorage.setItem("dev_review_token", newToken);
    setToken(newToken);
    setUser(newUser);
    triggerSuccessAlert(`Welcome back, connected as ${newUser.email}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("dev_review_token");
    setToken(null);
    setUser(null);
    setReviews([]);
    setActiveReview(null);
    setShowHistory(false);
    triggerSuccessAlert("Connected account logged out successfully.");
  };

  const triggerSuccessAlert = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // 3. Dispatch prompt + code text to Express model proxy
  const handleAnalyzeCode = async (code: string, language: string, filename: string) => {
    setLoading(true);
    setApiError(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/review-code", {
        method: "POST",
        headers,
        body: JSON.stringify({ code, language, filename }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analyzing source code was unable to finish.");
      }

      const completedReview: CodeReview = data.review;
      setActiveReview(completedReview);
      
      // Update local listing instantly to prevent cold refresh delay
      if (user) {
        setReviews((prev) => [completedReview, ...prev]);
      }
      triggerSuccessAlert("AI Code Review completed successfully!");
    } catch (err: any) {
      setApiError(err.message || "Something went wrong conducting this review session.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete individual session
  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/history/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        if (activeReview?.id === reviewId) {
          setActiveReview(null);
        }
        triggerSuccessAlert("Audit session deleted from logs.");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove audit.");
      }
    } catch (err: any) {
      setApiError(err.message);
    }
  };

  const handleSelectHistoricalReview = (historical: CodeReview) => {
    setActiveReview(historical);
    triggerSuccessAlert(`Audit history load: "${historical.filename}"`);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-teal-500/30">
      
      {/* 1. TOP HEADER NAVIGATION */}
      <Header
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onToggleHistory={() => setShowHistory(!showHistory)}
        showHistory={showHistory}
        historyCount={reviews.length}
      />

      {/* SUCCESS POPUP ALERT */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 border border-emerald-900/40 px-4 py-3 shadow-2xl animate-fade-in font-mono text-xs text-emerald-400">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          <span>{successToast}</span>
        </div>
      )}

      {/* MAIN LAYOUT SPLIT WRAPPER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COMPONENT: HISTORICAL SIDEBAR LOGS */}
        {showHistory && user && (
          <div className="hidden lg:block border-r border-slate-905">
            <HistorySidebar
              reviews={reviews}
              onSelectReview={handleSelectHistoricalReview}
              onDeleteReview={handleDeleteReview}
              activeReviewId={activeReview ? activeReview.id : null}
              onClose={() => setShowHistory(false)}
            />
          </div>
        )}

        {/* CENTER COMPONENT: CENTRAL RUNTIME STAGE */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Global API warnings display */}
            {apiError && (
              <div className="flex items-start gap-3 rounded-xl bg-rose-950/20 border border-rose-900/30 p-4 text-sm text-rose-400 font-sans shadow-lg">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <h5 className="font-bold">Suite Error Encountered</h5>
                  <p className="font-light text-rose-300/90 tracking-wide text-xs">
                    {apiError}
                  </p>
                </div>
                <button 
                  onClick={() => setApiError(null)}
                  className="p-1 rounded hover:bg-rose-900/10 text-rose-400 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* If there is an active audited review: render the quality dashboard */}
            {activeReview ? (
              <ReviewDashboard
                review={activeReview}
                onReset={() => setActiveReview(null)}
              />
            ) : (
              /* Otherwise, render raw input drop fields */
              <CodeInputSection
                onAnalyze={handleAnalyzeCode}
                loading={loading}
              />
            )}
            
          </div>
        </main>
      </div>

      {/* MOBILE HISTORY SIDEBAR SLIDEOUT */}
      {showHistory && user && (
        <div className="fixed inset-0 z-50 lg:hidden flex bg-slate-950/80 backdrop-blur-sm">
          <div className="relative animate-slide-in">
            <HistorySidebar
              reviews={reviews}
              onSelectReview={(r) => {
                handleSelectHistoricalReview(r);
                setShowHistory(false);
              }}
              onDeleteReview={handleDeleteReview}
              activeReviewId={activeReview ? activeReview.id : null}
              onClose={() => setShowHistory(false)}
            />
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => setShowHistory(false)} />
        </div>
      )}

      {/* AUTHENTICATION PORTAL DIALOG */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

    </div>
  );
}
