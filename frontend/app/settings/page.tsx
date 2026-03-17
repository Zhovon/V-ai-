"use client";

import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, User, Key, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    }
  }, [token, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background Aurora Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-600/20 blur-[120px]" />
      </div>

      <header className="absolute top-0 w-full z-20 flex justify-between items-center p-6 bg-gradient-to-b from-background/80 to-transparent border-b border-white/5">
        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 cursor-pointer" onClick={() => router.push('/')}>
          Zhovon AI
        </h1>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
        >
          Back to Generator
        </button>
      </header>

      <div className="container max-w-4xl mx-auto pt-32 pb-20 px-4 relative z-10">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1 flex flex-col gap-2">
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/10 text-white font-medium border border-white/10">
              <User size={18} /> Profile
            </button>
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
              <Key size={18} /> API Keys
            </button>
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
              <Shield size={18} /> Security
            </button>
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
              <Bell size={18} /> Notifications
            </button>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User size={20} className="text-primary" /> Profile Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || "user@example.com"} 
                    disabled 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your email cannot be changed.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="John Doe" 
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                
                <button className="px-5 py-2 mt-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/5 border-red-500/20">
              <h2 className="text-xl font-semibold mb-2 text-red-400">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-6">Actions here can affect your account access.</p>
              
              <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/10 bg-red-950/20">
                <div>
                  <h3 className="font-medium text-white">Log Out</h3>
                  <p className="text-sm text-muted-foreground">End your current session</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors font-medium text-sm"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
