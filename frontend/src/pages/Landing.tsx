import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CreditCard,
  Sparkles,
  TrendingUp,
  Search,
  ChevronRight,
  Star,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "signin" | "signup";

function AuthModal({
  isOpen,
  mode,
  onModeChange,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const path = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const data = await apiRequest<{ token: string }>(path, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
      <div className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between p-4 border-b-4 border-black">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === "signin" ? "default" : "outline"}
              onClick={() => onModeChange("signin")}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              variant={mode === "signup" ? "default" : "outline"}
              onClick={() => onModeChange("signup")}
            >
              Sign Up
            </Button>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-1 border-2 border-black">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder={mode === "signup" ? "Password (min 8 chars)" : "Password"}
          />
          {error && <p className="text-sm text-red-600 font-bold">{error}</p>}
          <Button className="w-full" disabled={loading} onClick={submit}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#e8e8e8] relative overflow-hidden">
      <AuthModal
        isOpen={modalOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          navigate("/dashboard");
        }}
      />

      <header className="border-b-4 border-black bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-black border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-5deg]">
                <CreditCard className="w-8 h-8 text-white rotate-[5deg]" />
              </div>
              <h1 className="text-4xl font-bold uppercase tracking-tight">CardWise</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => openAuth("signin")} variant="outline">Launch App</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="inline-block mb-6 px-6 py-2 bg-[hsl(var(--lavender))] text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
            <p className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
              <Star className="w-4 h-4 fill-black" />
              AI-Powered Rewards Optimization
            </p>
          </div>
          <h2 className="text-7xl md:text-8xl font-bold uppercase mb-8 tracking-tight leading-none">
            Never Miss
            <br />
            <span className="inline-block px-6 bg-[hsl(var(--indigo))] text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              Cashback
            </span>
            <br />
            Again
          </h2>
          <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
            CardWise uses AI to instantly recommend the best credit card for every purchase,
            maximizing your rewards automatically
          </p>
          <div className="flex gap-6 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 gap-2" onClick={() => openAuth("signup")}>
              Get Started Free
              <ChevronRight className="w-6 h-6" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-[hsl(var(--violet))] text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-9 h-9 text-black" />
            </div>
            <h3 className="text-3xl font-bold uppercase mb-4">Instant Analysis</h3>
            <p className="text-lg font-medium">
              Enter any merchant and amount. AI identifies category and calculates best rewards instantly.
            </p>
          </div>
          <div className="bg-[hsl(var(--indigo))] text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CreditCard className="w-9 h-9 text-black" />
            </div>
            <h3 className="text-3xl font-bold uppercase mb-4">Smart Wallet</h3>
            <p className="text-lg font-medium">Manage all your credit cards in one place with complete reward tracking.</p>
          </div>
          <div className="bg-[hsl(var(--periwinkle))] text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <TrendingUp className="w-9 h-9 text-black" />
            </div>
            <h3 className="text-3xl font-bold uppercase mb-4">Maximize Savings</h3>
            <p className="text-lg font-medium">Always use the card that gives the highest cashback percentage.</p>
          </div>
        </div>

        <div className="mb-24 bg-[hsl(var(--indigo))] text-white border-4 border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-12">
            <h3 className="text-6xl font-bold uppercase mb-4">How It Works</h3>
            <p className="text-xl text-white/90">Three simple steps to maximize rewards</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 mx-auto mb-6 bg-[hsl(var(--lavender))] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Search className="w-9 h-9 text-black" />
              </div>
              <div className="text-6xl font-bold mb-4 text-center text-black">01</div>
              <h4 className="text-2xl font-bold uppercase mb-3 text-center text-black">Enter Purchase</h4>
              <p className="text-gray-700 text-center text-lg">Tell us where you're shopping and how much you're spending</p>
            </div>

            <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 mx-auto mb-6 bg-[hsl(var(--violet))] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Zap className="w-9 h-9 text-white" />
              </div>
              <div className="text-6xl font-bold mb-4 text-center text-black">02</div>
              <h4 className="text-2xl font-bold uppercase mb-3 text-center text-black">AI Analysis</h4>
              <p className="text-gray-700 text-center text-lg">Our AI instantly identifies the category and calculates best rewards</p>
            </div>

            <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 mx-auto mb-6 bg-[hsl(var(--periwinkle))] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <TrendingUp className="w-9 h-9 text-white" />
              </div>
              <div className="text-6xl font-bold mb-4 text-center text-black">03</div>
              <h4 className="text-2xl font-bold uppercase mb-3 text-center text-black">Get Best Card</h4>
              <p className="text-gray-700 text-center text-lg">Receive instant recommendation with estimated cashback amount</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-24">
          {[
            { label: "Cards Supported", value: "150+", color: "bg-[hsl(var(--lavender))]" },
            { label: "Users Saving", value: "10K+", color: "bg-[hsl(var(--violet))]", textColor: "text-white" },
            { label: "Avg. Savings", value: "₹5K/mo", color: "bg-[hsl(var(--periwinkle))]", textColor: "text-white" },
            { label: "Accuracy Rate", value: "99%", color: "bg-[hsl(var(--indigo))]", textColor: "text-white" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} ${stat.textColor || "text-black"} border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center`}
            >
              <div className="text-5xl font-bold uppercase mb-2">{stat.value}</div>
              <div className="text-sm font-bold uppercase">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-black text-white border-4 border-black p-16 text-center shadow-[12px_12px_0px_0px_hsl(var(--indigo))] mb-24">
          <h3 className="text-5xl font-bold uppercase mb-6">Ready to Maximize Your Rewards?</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users already saving more with every purchase
          </p>
          <Button
            onClick={() => openAuth("signup")}
            size="lg"
            className="bg-[hsl(var(--indigo))] hover:bg-[hsl(var(--violet))] text-white text-xl px-12 py-6 gap-3"
          >
            Start Optimizing Now
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </main>

      <footer className="border-t-4 border-black bg-[hsl(var(--lavender))] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-black border-4 border-black flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold uppercase">CardWise</h3>
              </div>
              <p className="text-sm font-medium">Maximize every swipe with AI-powered card recommendations</p>
            </div>
            <div>
              <h4 className="font-bold uppercase mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li>How It Works</li>
                <li>Supported Cards</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase mb-3">Contact</h4>
              <p className="text-sm font-medium">support@cardwise.app</p>
            </div>
          </div>
          <div className="text-center pt-8 border-t-4 border-black">
            <p className="text-sm font-bold uppercase">© 2024 CardWise. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
