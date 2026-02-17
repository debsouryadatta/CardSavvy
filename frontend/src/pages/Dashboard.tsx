import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CreditCard, Home, LogOut, Plus, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, type CardCatalogItem, type RewardRules } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatBot from "@/components/ChatBot";

type Recommendation = {
  category: string;
  confidence: number;
  recommendedCard: { id: string; name: string; bank: string };
  estimatedReward: { value: string; unit: string; percentage: number };
  explanation: string;
};

type LookupResponse =
  | { status: "found_verified"; card: CardCatalogItem }
  | {
      status: "needs_confirmation";
      candidate: CardCatalogItem;
      confidence: number;
      extracted_from: string[];
    };

const CATEGORY_ORDER: (keyof RewardRules)[] = [
  "dining",
  "groceries",
  "shopping",
  "travel",
  "fuel",
  "utilities",
  "entertainment",
  "others",
];

const CARD_COLORS = [
  "bg-[hsl(var(--violet))]",
  "bg-[hsl(var(--indigo))]",
  "bg-[hsl(var(--periwinkle))]",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [wallet, setWallet] = useState<CardCatalogItem[]>([]);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState("");

  const [cardName, setCardName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const loadWallet = async () => {
    if (!token) return;
    const data = await apiRequest<{ cards: CardCatalogItem[] }>("/api/cards/wallet", {}, token);
    setWallet(data.cards);
  };

  useEffect(() => {
    loadWallet().catch((err) => setError(err instanceof Error ? err.message : "Failed to load wallet"));
  }, [token]);


  const analyze = async () => {
    if (!token) return;
    setError("");
    setRecommendation(null);
    try {
      const data = await apiRequest<Recommendation>(
        "/api/analyze",
        { method: "POST", body: JSON.stringify({ merchant, amount }) },
        token
      );
      setRecommendation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyze failed");
    }
  };

  const lookupCard = async () => {
    if (!token) return;
    setBusy(true);
    setError("");
    setLookupResult(null);
    try {
      const data = await apiRequest<LookupResponse>(
        "/api/cards/lookup",
        { method: "POST", body: JSON.stringify({ card_name: cardName, issuer }) },
        token
      );
      setLookupResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  };

  const addVerified = async (id: string) => {
    if (!token) return;
    setBusy(true);
    try {
      await apiRequest(
        "/api/cards/wallet",
        { method: "POST", body: JSON.stringify({ card_catalog_id: id, last_four: lastFour || undefined }) },
        token
      );
      setLookupResult(null);
      await loadWallet();
      setShowAddCard(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add card failed");
    } finally {
      setBusy(false);
    }
  };

  const confirmPending = async (candidate: CardCatalogItem) => {
    if (!token) return;
    setBusy(true);
    try {
      await apiRequest(
        "/api/cards/confirm",
        {
          method: "POST",
          body: JSON.stringify({
            card_name: candidate.card_name,
            issuer: candidate.issuer,
            network: candidate.network,
            reward_rules: candidate.reward_rules,
            evidence: candidate.evidence,
            last_four: lastFour || undefined,
          }),
        },
        token
      );
      setLookupResult(null);
      await loadWallet();
      setShowAddCard(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    } finally {
      setBusy(false);
    }
  };

  const cardsToRender = useMemo(() => wallet, [wallet]);

  return (
    <div className="min-h-screen bg-[#e8e8e8] relative overflow-hidden">
      <ChatBot token={token} />

      <header className="border-b-4 border-black bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-5deg]">
                <CreditCard className="w-7 h-7 text-white rotate-[5deg]" />
              </div>
              <h1 className="text-3xl font-bold uppercase tracking-tight">CardWise</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate("/")} variant="outline" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 pb-28">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="border-4 border-black bg-[hsl(var(--violet))] text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <h2 className="text-4xl font-bold uppercase flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Search className="w-7 h-7 text-white" />
              </div>
              Find Best Card
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Merchant Name</label>
                <Input
                  className="bg-white text-black"
                  placeholder="e.g., Swiggy, Flipkart, BigBasket"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Amount (Rs)</label>
                <Input
                  className="bg-white text-black"
                  type="number"
                  placeholder="e.g., 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button onClick={analyze} disabled={busy} className="w-full bg-white text-black hover:bg-gray-100" size="lg">
                <Sparkles className="w-5 h-5" />
                Analyze Purchase
              </Button>
              {error && <p className="text-sm font-bold bg-red-500 border-2 border-black p-2">{error}</p>}
            </div>
          </div>

          {recommendation ? (
            <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-[hsl(var(--indigo))] text-white border-b-4 border-black p-4">
                <h3 className="text-2xl font-bold uppercase">Recommendation</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1 bg-[hsl(var(--lavender))] border-2 border-black text-xs font-bold uppercase text-black">
                    {recommendation.category}
                  </div>
                  <div className="px-3 py-1 bg-[hsl(var(--periwinkle))] text-white border-2 border-black text-xs font-bold">
                    {Math.round(recommendation.confidence * 100)}% Match
                  </div>
                </div>
                <h4 className="text-lg font-bold uppercase mb-2 text-gray-700">Best Card</h4>
                <p className="text-3xl font-bold text-[hsl(var(--indigo))] mb-2">{recommendation.recommendedCard.name}</p>
                <p className="text-sm font-medium text-gray-600 mb-4">{recommendation.recommendedCard.bank}</p>
                <div className="p-4 bg-[hsl(var(--indigo))] text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-sm font-bold mb-1 uppercase">Estimated Cashback</p>
                  <p className="text-4xl font-bold">Rs {recommendation.estimatedReward.value}</p>
                  <p className="text-sm">{recommendation.estimatedReward.percentage}% back on this purchase</p>
                </div>
                <p className="text-sm font-medium mt-4 text-gray-700">{recommendation.explanation}</p>
              </div>
            </div>
          ) : (
            <div className="border-4 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold uppercase text-gray-600 mb-2">Ready to Analyze</h3>
              <p className="text-gray-500 font-medium">Enter a merchant and amount to get your recommendation</p>
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[hsl(var(--periwinkle))] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-5xl font-bold uppercase">Your Cards</h3>
              <p className="text-gray-600 text-2xl">{cardsToRender.length} cards in wallet</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setShowAddCard((v) => !v)}>
            <Plus className="w-5 h-5" />
            Add Card
          </Button>
        </div>

        {showAddCard && (
          <div className="border-4 border-black bg-white p-4 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid md:grid-cols-3 gap-3 mb-3">
              <Input placeholder="Card name" value={cardName} onChange={(e) => setCardName(e.target.value)} />
              <Input placeholder="Issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} />
              <Input
                placeholder="Last 4 digits"
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </div>
            <Button onClick={lookupCard} disabled={busy}>Lookup Card</Button>

            {lookupResult?.status === "found_verified" && (
              <div className="mt-3 p-3 border-2 border-black bg-green-50">
                <p className="font-bold">Verified card found: {lookupResult.card.card_name}</p>
                <Button className="mt-2" onClick={() => addVerified(lookupResult.card.id)} disabled={busy}>Add to wallet</Button>
              </div>
            )}

            {lookupResult?.status === "needs_confirmation" && (
              <div className="mt-3 p-3 border-2 border-black bg-yellow-50">
                <p className="font-bold">Needs confirmation: {lookupResult.candidate.card_name}</p>
                <p className="text-sm mb-2">Confidence: {Math.round(lookupResult.confidence * 100)}%</p>
                <Button onClick={() => confirmPending(lookupResult.candidate)} disabled={busy}>Confirm and store as pending</Button>
              </div>
            )}
          </div>
        )}

        {cardsToRender.length === 0 ? (
          <div className="border-4 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <h3 className="text-2xl font-bold uppercase text-gray-600 mb-2">No Cards Yet</h3>
            <p className="text-gray-500 font-medium">Click `Add Card` to add your first card.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cardsToRender.map((card, idx) => {
              const topRate = Math.max(...CATEGORY_ORDER.map((k) => card.reward_rules[k])) * 100;
              return (
                <div
                  key={card.id}
                  className={`relative h-56 border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden group hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all ${
                    idx === 0 ? "rotate-[-2deg]" : idx === 1 ? "rotate-[1deg]" : "rotate-[-1deg]"
                  } hover:rotate-0`}
                >
                  <div className={`absolute inset-0 ${CARD_COLORS[idx % CARD_COLORS.length]}`} />
                  <div className="relative h-full p-8 flex flex-col justify-between text-white">
                    <div>
                      <div className="inline-block px-3 py-1 bg-white border-2 border-black mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-black">{card.issuer}</p>
                      </div>
                      <p className="text-2xl font-bold uppercase leading-tight text-white">{card.card_name}</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold mb-3 tracking-wider text-white">•••• {String(idx + 1).repeat(4)}</p>
                      <div className="flex items-center justify-between">
                        <div className="px-4 py-1.5 bg-white text-black text-sm font-bold uppercase border-2 border-black">
                          {card.network || "Card"}
                        </div>
                        <div className="text-sm font-bold text-white">Up to {topRate.toFixed(1)}% back</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t-4 border-black bg-[hsl(var(--lavender))] py-6 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold uppercase">© 2024 CardWise. Maximize Every Swipe.</p>
        </div>
      </footer>
    </div>
  );
}

