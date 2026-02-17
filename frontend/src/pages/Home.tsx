import { useEffect, useState } from "react";
import { CreditCard, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBot from "@/components/ChatBot";
import { fetchPublicCards } from "@/lib/cards";
import type { CardCatalogItem } from "@/lib/api";

interface Recommendation {
  category: string;
  confidence: number;
  recommendedCard: {
    id: string;
    name: string;
    bank: string;
  };
  estimatedReward: {
    value: string;
    unit: string;
    percentage: number;
  };
  explanation: string;
}

const cardBackgrounds = [
  "bg-[hsl(var(--violet))]",
  "bg-[hsl(var(--indigo))]",
  "bg-[hsl(var(--periwinkle))]",
];

export default function Home() {
  const [cards, setCards] = useState<CardCatalogItem[]>([]);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicCards()
      .then((data) => setCards(data))
      .catch(() => setError("Failed to load card catalog"));
  }, []);

  const handleAnalyze = async () => {
    if (!merchant.trim() || !amount.trim()) {
      setError("Please enter both merchant name and amount");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setRecommendation(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant: merchant.trim(), amount }),
      });

      if (!response.ok) throw new Error("Failed to analyze");

      const data = (await response.json()) as Recommendation;
      setRecommendation(data);
    } catch {
      setError("Failed to analyze purchase. Please login and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden p-6">
      <ChatBot token={null} />

      <div className="max-w-6xl mx-auto space-y-8">
        <header className="border-4 border-black bg-white p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8" />
            <h1 className="text-3xl font-bold uppercase">CardWise</h1>
          </div>
        </header>

        <Card className="bg-[hsl(var(--violet))] border-black text-white">
          <CardHeader>
            <CardTitle className="text-2xl uppercase flex items-center gap-2">
              <Search className="w-5 h-5" /> Analyze Purchase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input className="bg-white text-black" placeholder="Merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} />
            <Input className="bg-white text-black" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-white text-black hover:bg-gray-100">
              <Sparkles className="w-4 h-4" /> {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
            {error && <p className="text-sm font-bold">{error}</p>}
            {recommendation && (
              <div className="bg-white text-black p-3 border-2 border-black">
                <p className="font-bold">Best card: {recommendation.recommendedCard.name}</p>
                <p>Estimated cashback: {recommendation.estimatedReward.value} INR</p>
              </div>
            )}
          </CardContent>
        </Card>

        <section>
          <h2 className="text-2xl font-bold uppercase mb-4">Cards From Backend</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <div key={card.id} className="relative h-52 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className={`absolute inset-0 ${cardBackgrounds[idx % cardBackgrounds.length]}`} />
                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                  <div>
                    <p className="text-xs font-bold uppercase bg-white text-black inline-block px-2 py-1 border-2 border-black">{card.issuer}</p>
                    <p className="text-2xl font-bold uppercase mt-2">{card.card_name}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold bg-white text-black px-2 py-1 border-2 border-black">{card.network ?? "Card"}</span>
                    <span className="text-sm font-bold">
                      Up to {Math.max(...Object.values(card.reward_rules).map((value) => value * 100)).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
