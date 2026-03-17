"use client";

import { Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Aurora Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-[100%] bg-purple-600/10 blur-[150px]" />
        <div className="absolute top-[40%] right-[-10%] w-[60%] h-[60%] rounded-[100%] bg-blue-600/10 blur-[150px]" />
      </div>

      <header className="absolute top-0 w-full z-20 flex justify-between items-center p-6 bg-gradient-to-b from-background/80 to-transparent">
        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 cursor-pointer" onClick={() => router.push('/')}>
          Zhovon AI
        </h1>
        <div className="flex gap-4">
            <button onClick={() => router.push('/auth/login')} className="px-4 py-2 text-sm font-medium hover:text-white transition-colors">
            Login
            </button>
            <button onClick={() => router.push('/')} className="px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-sm font-medium shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            Go to App
            </button>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto pt-40 pb-20 px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto">
          Start generating mind-blowing AI videos and images with Zhovon AI. Choose the plan that fits your creative needs.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          
          {/* Starter Plan */}
          <div className="glass-card rounded-3xl p-8 border border-white/5 flex flex-col hover:border-white/10 transition-colors relative">
            <h3 className="text-xl font-semibold mb-2">Starter</h3>
            <p className="text-muted-foreground text-sm mb-6">For casual creators trying things out.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$9</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-4 flex-1 mb-8">
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> 500 Image Generations (ZImage)</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> 10 Video Generations (Wan 2.1)</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> Standard Resolution</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> Normal Queue Speed</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 font-medium hover:bg-white/10 transition-colors">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="glass-card rounded-3xl p-8 border border-primary/40 relative flex flex-col shadow-[0_0_30px_rgba(var(--primary),0.15)] transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={12} /> MOST POPULAR
            </div>
            
            <h3 className="text-xl font-semibold mb-2 text-white">Pro</h3>
            <p className="text-primary/80 text-sm mb-6">For serious creators and professionals.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-4 flex-1 mb-8 text-gray-200">
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> Unlimited Image Generations</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> 50 Video Generations (Kling 3.0 & Wan)</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> Upscaling to 4K</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> 2 Custom Model Trainings (LoRA)</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> Fast Queue Speed</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              Upgrade to Pro
            </button>
          </div>

          {/* Ultimate Plan */}
          <div className="glass-card rounded-3xl p-8 border border-white/5 flex flex-col hover:border-white/10 transition-colors">
            <h3 className="text-xl font-semibold mb-2">Studio</h3>
            <p className="text-muted-foreground text-sm mb-6">For agencies and heavy production.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-4 flex-1 mb-8">
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> Unlimited Images & Videos</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> Unrestricted Access to Kling 3.0</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> 10 Custom Model Trainings (LoRA)</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> Priority API Access</li>
              <li className="flex items-start gap-3 text-sm"><Check size={18} className="text-primary mt-0.5" /> Highest Queue Priority</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 font-medium hover:bg-white/10 transition-colors">
              Contact Sales
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
