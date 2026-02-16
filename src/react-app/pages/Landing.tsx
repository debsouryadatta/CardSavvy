import { CreditCard, Sparkles, TrendingUp, Zap, Search, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';
import { useNavigate } from 'react-router';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-[hsl(var(--indigo))] border-4 border-black rotate-12 -z-10" />
      <div className="absolute top-60 left-10 w-24 h-24 rounded-full bg-[hsl(var(--violet))] border-4 border-black -z-10" />
      <div className="absolute bottom-40 right-20 w-40 h-40 bg-[hsl(var(--periwinkle))] border-4 border-black rotate-[-15deg] -z-10" />
      <div className="absolute bottom-20 left-40 w-20 h-20 bg-[hsl(var(--lavender))] border-4 border-black -z-10" />

      {/* Header */}
      <header className="border-b-4 border-black bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-black border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-5deg]">
                <CreditCard className="w-8 h-8 text-white rotate-[5deg]" />
              </div>
              <h1 className="text-4xl font-bold uppercase tracking-tight">CardWise</h1>
            </div>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Launch App
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
            CardWise uses AI to instantly recommend the best credit card for every purchase, maximizing your rewards automatically
          </p>
          <div className="flex gap-6 justify-center">
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="text-lg px-8 py-6 gap-2"
            >
              Get Started Free
              <ChevronRight className="w-6 h-6" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-[hsl(var(--violet))] text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-9 h-9 text-black" />
            </div>
            <h3 className="text-3xl font-bold uppercase mb-4">Instant Analysis</h3>
            <p className="text-lg font-medium">
              Enter any merchant and amount - our AI identifies the category and calculates the best reward in seconds
            </p>
          </div>

          <div className="bg-[hsl(var(--indigo))] text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CreditCard className="w-9 h-9 text-black" />
            </div>
            <h3 className="text-3xl font-bold uppercase mb-4">Smart Wallet</h3>
            <p className="text-lg font-medium">
              Manage all your credit cards in one place with complete reward rate tracking across categories
            </p>
          </div>

          <div className="bg-[hsl(var(--periwinkle))] text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <TrendingUp className="w-9 h-9 text-black" />
            </div>
            <h3 className="text-3xl font-bold uppercase mb-4">Maximize Savings</h3>
            <p className="text-lg font-medium">
              Never leave money on the table - always use the card that gives you the highest cashback percentage
            </p>
          </div>
        </div>

        {/* How It Works */}
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
              <p className="text-gray-700 text-center text-lg">
                Tell us where you're shopping and how much you're spending
              </p>
            </div>

            <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 mx-auto mb-6 bg-[hsl(var(--violet))] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Zap className="w-9 h-9 text-white" />
              </div>
              <div className="text-6xl font-bold mb-4 text-center text-black">02</div>
              <h4 className="text-2xl font-bold uppercase mb-3 text-center text-black">AI Analysis</h4>
              <p className="text-gray-700 text-center text-lg">
                Our AI instantly identifies the category and calculates best rewards
              </p>
            </div>

            <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 mx-auto mb-6 bg-[hsl(var(--periwinkle))] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <TrendingUp className="w-9 h-9 text-white" />
              </div>
              <div className="text-6xl font-bold mb-4 text-center text-black">03</div>
              <h4 className="text-2xl font-bold uppercase mb-3 text-center text-black">Get Best Card</h4>
              <p className="text-gray-700 text-center text-lg">
                Receive instant recommendation with estimated cashback amount
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-24">
          {[
            { label: 'Cards Supported', value: '150+', color: 'bg-[hsl(var(--lavender))]' },
            { label: 'Users Saving', value: '10K+', color: 'bg-[hsl(var(--violet))]', textColor: 'text-white' },
            { label: 'Avg. Savings', value: '₹5K/mo', color: 'bg-[hsl(var(--periwinkle))]', textColor: 'text-white' },
            { label: 'Accuracy Rate', value: '99%', color: 'bg-[hsl(var(--indigo))]', textColor: 'text-white' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} ${stat.textColor || 'text-black'} border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center`}
            >
              <div className="text-5xl font-bold uppercase mb-2">{stat.value}</div>
              <div className="text-sm font-bold uppercase">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-black text-white border-4 border-black p-16 text-center shadow-[12px_12px_0px_0px_hsl(var(--indigo))]">
          <h3 className="text-5xl font-bold uppercase mb-6">Ready to Maximize Your Rewards?</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users already saving more with every purchase
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="bg-[hsl(var(--indigo))] hover:bg-[hsl(var(--violet))] text-white text-xl px-12 py-6 gap-3"
          >
            Start Optimizing Now
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-[hsl(var(--lavender))] py-12 mt-20">
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
                <li className="cursor-pointer hover:underline">How It Works</li>
                <li className="cursor-pointer hover:underline">Supported Cards</li>
                <li className="cursor-pointer hover:underline">FAQ</li>
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
