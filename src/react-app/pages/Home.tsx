import { useState } from 'react';
import { CreditCard, Sparkles, TrendingUp, Zap, Search, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/react-app/components/ui/card';
import ChatBot from '@/react-app/components/ChatBot';

// Sample card data with indigo-based colors
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

export default function Home() {
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
      <div className="absolute top-20 right-10 w-32 h-32 bg-[hsl(var(--indigo))] border-4 border-black rotate-12 -z-10" />
      <div className="absolute top-60 left-10 w-24 h-24 rounded-full bg-[hsl(var(--violet))] border-4 border-black -z-10" />
      <div className="absolute bottom-40 right-20 w-40 h-40 bg-[hsl(var(--periwinkle))] border-4 border-black rotate-[-15deg] -z-10" />
      <div className="absolute bottom-20 left-40 w-20 h-20 bg-[hsl(var(--lavender))] border-4 border-black -z-10" />

      {/* Hero Section */}
      <header className="border-b-4 border-black bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-black border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-5deg]">
                <CreditCard className="w-8 h-8 text-white rotate-[5deg]" />
              </div>
              <h1 className="text-4xl font-bold uppercase tracking-tight">CardWise</h1>
            </div>
            <Button variant="outline">Sign In</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Banner - Restructured */}
        <div className="mb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-6 px-6 py-2 bg-[hsl(var(--lavender))] text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
              <p className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                <Star className="w-4 h-4 fill-black" />
                Maximize Your Rewards
              </p>
            </div>
            <h2 className="text-6xl md:text-7xl font-bold uppercase mb-6 tracking-tight leading-none">
              Never Miss
              <br />
              <span className="inline-block px-4 bg-[hsl(var(--indigo))] text-white border-4 border-black">Cashback</span>
              <br />
              Again
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-lg">
              Instantly find the best credit card for every purchase with AI-powered recommendations
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="gap-2">
                Get Started
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>

          {/* Purchase Analyzer - Featured */}
          <div>
            <Card className="bg-[hsl(var(--violet))] border-black text-white">
              <CardHeader>
                <CardTitle className="text-3xl uppercase flex items-center gap-3">
                  <div className="w-12 h-12 bg-black flex items-center justify-center">
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
                {recommendation && (
                  <div className="mt-4 p-4 bg-white text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="px-3 py-1 bg-[hsl(var(--lavender))] border-2 border-black">
                        <p className="text-xs font-bold uppercase">{recommendation.category}</p>
                      </div>
                      <div className="px-3 py-1 bg-[hsl(var(--periwinkle))] text-white border-2 border-black">
                        <p className="text-xs font-bold">{Math.round(recommendation.confidence * 100)}% Match</p>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold uppercase mb-2">Recommended Card</h4>
                    <p className="text-2xl font-bold text-[hsl(var(--indigo))] mb-2">{recommendation.recommendedCard.name}</p>
                    <p className="text-sm font-medium text-gray-600 mb-3">{recommendation.recommendedCard.bank}</p>
                    <div className="p-3 bg-[hsl(var(--indigo))] text-white border-2 border-black">
                      <p className="text-sm font-bold mb-1">Estimated Cashback</p>
                      <p className="text-3xl font-bold">₹{recommendation.estimatedReward.value}</p>
                      <p className="text-xs font-medium opacity-90">{recommendation.estimatedReward.percentage}% back on this purchase</p>
                    </div>
                    <p className="text-sm font-medium mt-3">{recommendation.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Card Wallet - Enhanced */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-[hsl(var(--periwinkle))] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <CreditCard className="w-9 h-9 text-black" />
            </div>
            <div>
              <h3 className="text-4xl font-bold uppercase">Your Cards</h3>
              <p className="text-gray-600 text-lg">Manage your credit card collection</p>
            </div>
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

          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Add New Card
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* How It Works - Restructured */}
        <div className="mb-20 bg-[hsl(var(--indigo))] text-white border-4 border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-12">
            <h3 className="text-5xl font-bold uppercase mb-4">How It Works</h3>
            <p className="text-xl text-white/90">Three simple steps to maximize rewards</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 mx-auto mb-6 bg-[hsl(var(--lavender))] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Search className="w-9 h-9 text-black" />
              </div>
              <div className="text-6xl font-bold mb-4 text-center text-black">01</div>
              <h4 className="text-2xl font-bold uppercase mb-3 text-center text-black">Enter Purchase</h4>
              <p className="text-gray-700 text-center">Tell us where you're shopping and how much you're spending</p>
            </div>
            
            <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 mx-auto mb-6 bg-[hsl(var(--violet))] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Zap className="w-9 h-9 text-white" />
              </div>
              <div className="text-6xl font-bold mb-4 text-center text-black">02</div>
              <h4 className="text-2xl font-bold uppercase mb-3 text-center text-black">AI Analysis</h4>
              <p className="text-gray-700 text-center">Our AI instantly identifies the category and calculates best rewards</p>
            </div>
            
            <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 mx-auto mb-6 bg-[hsl(var(--periwinkle))] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <TrendingUp className="w-9 h-9 text-white" />
              </div>
              <div className="text-6xl font-bold mb-4 text-center text-black">03</div>
              <h4 className="text-2xl font-bold uppercase mb-3 text-center text-black">Get Best Card</h4>
              <p className="text-gray-700 text-center">Receive instant recommendation with estimated cashback amount</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {[
            { label: 'Cards Supported', value: '150+', color: 'bg-[hsl(var(--lavender))]' },
            { label: 'Users Saving', value: '10K+', color: 'bg-[hsl(var(--violet))]', textColor: 'text-white' },
            { label: 'Avg. Savings', value: '₹5K/mo', color: 'bg-[hsl(var(--periwinkle))]', textColor: 'text-white' },
            { label: 'Accuracy Rate', value: '99%', color: 'bg-[hsl(var(--indigo))]', textColor: 'text-white' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} ${stat.textColor || 'text-black'} border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center`}
            >
              <div className="text-4xl font-bold uppercase mb-2">{stat.value}</div>
              <div className="text-sm font-bold uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
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
