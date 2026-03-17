"use client";

import { useState, useRef, useEffect } from "react";
import { MessageBubble, type Message } from "./MessageBubble";
import { Bot, UserPlus, LayoutDashboard, MessageSquarePlus, Settings as SettingsIcon, CreditCard, Menu, ArrowRight, Sparkles } from "lucide-react";
import apiClient from "@/lib/api";
import Link from 'next/link';

export function AssistantLayout() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hello! I'm your AI Assistant. I can help you write better prompts, brainstorm ideas, or just chat."
    }
  ]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = prompt;
    setPrompt("");

    const userMsgId = Date.now().toString();
    const newUserMsg: Message = { 
        id: userMsgId, 
        role: "user", 
        content: userMessage
    };
    
    const aiMsgId = (Date.now() + 1).toString();
    const newAiMsg: Message = { 
      id: aiMsgId, 
      role: "ai", 
      content: "Thinking...",
      status: "processing" 
    };

    setMessages(prev => [...prev, newUserMsg, newAiMsg]);

    try {
      const response = await apiClient.post<any>("/api/v1/chat", {
          messages: [{ role: "user", content: userMessage }],
          model: "meta/meta-llama-3-8b-instruct"
      });
      
      setMessages(prev => [
          ...prev.map(msg => msg.id === aiMsgId ? { ...msg, content: response.content, status: "completed" as Message["status"] } : msg)
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, content: "Sorry, I encountered an error. Please try again.", status: "failed" } : msg
      ));
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-background">
      {/* Background Aurora */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-600/20 blur-[120px]" />
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl z-30 flex-col p-4 relative hidden md:flex">
        <div className="mb-8 px-2 mt-2">
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Zhovon AI
            </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <button className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 transition-colors text-sm font-medium">
            <Bot size={18} />
            Chat Assistant
          </button>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
            <Sparkles size={18} />
            Media Studio
          </Link>
        </nav>
        
        <div className="mt-auto space-y-2 border-t border-white/5 pt-4">
          <Link href="/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
            <CreditCard size={18} />
            Pricing Plans
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Mobile Header */}
        <header className="absolute top-0 w-full z-20 flex justify-between items-center p-6 bg-gradient-to-b from-background/80 to-transparent md:hidden">
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Chat Assistant
          </h1>
          <button className="text-white">
            <Menu size={24} />
          </button>
        </header>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto px-4 pt-24 md:pt-8 pb-32 z-10 w-full max-w-4xl mx-auto custom-scrollbar">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background/90 to-transparent pb-4 pt-8 z-20">
          <div className="w-full max-w-4xl mx-auto p-4 z-10 glass-card rounded-3xl m-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message your AI assistant..."
                className="w-full bg-transparent text-foreground placeholder-muted-foreground resize-none outline-none hide-scrollbar p-2 max-h-40 min-h-[60px]"
                disabled={isLoading}
              />
              <div className="flex items-center justify-end pt-2 border-t border-white/5">
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="h-10 w-10 rounded-full flex items-center justify-center bg-foreground text-background transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  {isLoading ? (
                    <Sparkles className="animate-spin" size={18} />
                  ) : (
                    <ArrowRight className="group-hover:-rotate-45 transition-transform" size={18} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
