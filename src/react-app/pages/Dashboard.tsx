import { useState } from 'react';
import { CreditCard, Sparkles, Search, Home, Plus } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/react-app/components/ui/card';
import ChatBot from '@/react-app/components/ChatBot';
import { useNavigate } from 'react-router';

// Sample card data
const sampleCards = [
  {
    id: 'card_1',
    name: 'HDFC Millennia',
    bank: 'HDFC Bank',
    network: 'Visa',
    lastFour: '4523',
    bgColor: 'bg-[hsl(var(--violet))]',
    rewards: {
      dining: 5,
      groceries: 5,
      shopping: 2.5,
      travel: 1,
      fuel: 1,
      utilities: 1,
      entertainment: 5,
      others: 1,
    },
  },
  {
    id: 'card_2',
    name: 'Axis Flipkart',
    bank: 'Axis Bank',
    network: 'Mastercard',
    lastFour: '8821',
    bgColor: 'bg-[hsl(var(--indigo))]',
    rewards: {
      shopping: 5,
      dining: 4,
      groceries: 1.5,
      travel: 1.5,
      fuel: 1.5,
      utilities: 1.5,
      entertainment: 1.5,
      others: 1.5,
    },
  },
  {
    id: 'card_3',
    name: 'ICICI Amazon Pay',
    bank: 'ICICI Bank',
    network: 'Visa',
    lastFour: '2156',
    bgColor: 'bg-[hsl(var(--periwinkle))]',
    rewards: {
      shopping: 5,
      dining: 2,
      groceries: 2,
      travel: 1,
      fuel: 1,
      utilities: 1,
      entertainment: 2,
      others: 1,
    },
  },
];

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!merchant.trim() || !amount.trim()) {
      setError('Please enter both merchant name and amount');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setRecommendation(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant: merchant.trim(), amount }),
      });

      if (!response.ok) throw new Error('Failed to analyze');

      const data = await response.json();
      setRecommendation(data);
    } catch (err) {
      setError('Failed to analyze purchase. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <ChatBot />

      {/* Decorative shapes */}
      <div className="absolute top-40 right-10 w-24 h-24 bg-[hsl(var(--lavender))] border-4 border-black rotate-12 -z-10" />
      <div className="absolute bottom-40 left-10 w-32 h-32 rounded-full bg-[hsl(var(--periwinkle))] border-4 border-black -z-10" />

      {/* Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-5deg]">
                <CreditCard className="w-7 h-7 text-white rotate-[5deg]" />
              </div>
              <h1 className="text-3xl font-bold uppercase tracking-tight">CardWise</h1>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Purchase Analyzer */}
          <Card className="bg-[hsl(var(--violet))] border-black text-white h-fit">
            <CardHeader>
              <CardTitle className="text-3xl uppercase flex items-center gap-3">
                <div className="w-12 h-12 bg-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Search className="w-7 h-7 text-white" />
                </div>
                Find Best Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="block text-sm font-bold uppercase mb-3 text-white">Merchant Name</label>
                <Input
                  className="bg-white text-black"
                  placeholder="e.g., Swiggy, Flipkart, BigBasket"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase mb-3 text-white">Amount (₹)</label>
                <Input
                  className="bg-white text-black"
                  type="number"
                  placeholder="e.g., 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-white text-black hover:bg-gray-100 disabled:opacity-50"
                size="lg"
              >
                <Sparkles className="w-5 h-5" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Purchase'}
              </Button>
              {error && (
                <p className="text-sm font-bold text-white bg-red-500 border-2 border-black p-2">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recommendation Result */}
          {recommendation ? (
            <Card className="border-black bg-white h-fit">
              <CardHeader className="bg-[hsl(var(--indigo))] text-white border-b-4 border-black">
                <CardTitle className="text-2xl uppercase">Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1 bg-[hsl(var(--lavender))] border-2 border-black">
                    <p className="text-xs font-bold uppercase">{recommendation.category}</p>
                  </div>
                  <div className="px-3 py-1 bg-[hsl(var(--periwinkle))] text-white border-2 border-black">
                    <p className="text-xs font-bold">{Math.round(recommendation.confidence * 100)}% Match</p>
                  </div>
                </div>
                <h4 className="text-lg font-bold uppercase mb-2 text-gray-600">Best Card</h4>
                <p className="text-3xl font-bold text-[hsl(var(--indigo))] mb-2">{recommendation.recommendedCard.name}</p>
                <p className="text-sm font-medium text-gray-600 mb-4">{recommendation.recommendedCard.bank}</p>
                <div className="p-4 bg-[hsl(var(--indigo))] text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-sm font-bold mb-1 uppercase">Estimated Cashback</p>
                  <p className="text-4xl font-bold">₹{recommendation.estimatedReward.value}</p>
                  <p className="text-sm font-medium opacity-90">{recommendation.estimatedReward.percentage}% back on this purchase</p>
                </div>
                <p className="text-sm font-medium mt-4 text-gray-700">{recommendation.explanation}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border-4 border-dashed border-gray-300 bg-gray-50 p-12 text-center h-fit">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold uppercase text-gray-600 mb-2">Ready to Analyze</h3>
              <p className="text-gray-500 font-medium">Enter a merchant and amount to get your recommendation</p>
            </div>
          )}
        </div>

        {/* Card Wallet */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[hsl(var(--periwinkle))] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-4xl font-bold uppercase">Your Cards</h3>
                <p className="text-gray-600 text-lg">{sampleCards.length} cards in wallet</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="w-5 h-5" />
              Add Card
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleCards.map((card, idx) => (
              <div
                key={card.id}
                className={`relative h-56 border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden group hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all ${
                  idx === 0 ? 'rotate-[-2deg]' : idx === 1 ? 'rotate-[1deg]' : 'rotate-[-1deg]'
                } hover:rotate-0`}
              >
                <div className={`absolute inset-0 ${card.bgColor}`} />
                <div className="relative h-full p-8 flex flex-col justify-between text-white">
                  <div>
                    <div className="inline-block px-3 py-1 bg-white border-2 border-black mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-black">{card.bank}</p>
                    </div>
                    <p className="text-2xl font-bold uppercase leading-tight text-white">{card.name}</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold mb-3 tracking-wider text-white">•••• {card.lastFour}</p>
                    <div className="flex items-center justify-between">
                      <div className="px-4 py-1.5 bg-white text-black text-sm font-bold uppercase border-2 border-black">
                        {card.network}
                      </div>
                      <div className="text-sm font-bold text-white">
                        Up to {Math.max(...Object.values(card.rewards))}% back
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-[hsl(var(--lavender))] py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold uppercase">© 2024 CardWise. Maximize Every Swipe.</p>
        </div>
      </footer>
    </div>
  );
}
