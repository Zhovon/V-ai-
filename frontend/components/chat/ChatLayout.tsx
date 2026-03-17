"use client";

import { useState, useRef, useEffect } from "react";
import { MessageBubble, type Message } from "./MessageBubble";
import { PromptInput } from "./PromptInput";
import { ModelTrainerModal } from "./ModelTrainerModal";
import { UserPlus, LayoutDashboard, MessageSquarePlus, Settings as SettingsIcon, CreditCard, Menu, Sparkles } from "lucide-react";
import apiClient from "@/lib/api";

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hello! I'm your AI video and image generator. Describe what you'd like to see, and I'll create it using Wan 2.1 or ZImage."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTrainerOpen, setIsTrainerOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (prompt: string, type: "chat" | "video" | "video-kling" | "image-zimage-turbo" | "image-nanobanana2" | "faceswap" | "lipsync", extraInputs?: any) => {
    setIsLoading(true);

    // 1. Add user message
    const userMsgId = Date.now().toString();
    const newUserMsg: Message = { 
        id: userMsgId, 
        role: "user", 
        content: prompt || `[${type.toUpperCase()}] Request with attachment`,
        mediaUrl: extraInputs?.face_image_url || extraInputs?.audio_url || extraInputs?.image_url // Show what they uploaded
    };
    
    // 2. Add AI placeholder message
    const aiMsgId = (Date.now() + 1).toString();
    const displayType = type === 'video-kling' ? 'Kling 3.0 Video' : type;
    const newAiMsg: Message = { 
      id: aiMsgId, 
      role: "ai", 
      content: `I'm on it! Generating a new ${displayType}...`,
      mediaType: type.startsWith("image-") ? "image" : "video",
      status: "processing" 
    };

    setMessages(prev => [...prev, newUserMsg, newAiMsg]);

    try {
      // Determine provider and model for Generation API
      let provider = "piapi";
      let model_used = "kling3";
      
      if (type === "video") {
          provider = "novita";
          model_used = "wan2.1";
      } else if (type === "video-kling") {
          provider = "piapi";
          model_used = "kling3";
      } else if (type === "image-zimage-turbo") {
          provider = "piapi";
          model_used = "zimage-turbo";
      } else if (type === "image-nanobanana2") {
          provider = "piapi";
          model_used = "nanobanana-2";
      } else if (type === "faceswap") {
          provider = "piapi";
          model_used = "faceswap";
      } else if (type === "lipsync") {
          provider = "piapi";
          model_used = "lipsync";
      }

      // API call to the backend using apiClient
      const job = await apiClient.post<any>("/api/v1/generations", {
        prompt: prompt || "",
        media_type: type.startsWith("image-") ? "image" : "video",
        provider,
        model_used,
        extra_inputs: extraInputs
      });
      
      // Setup Polling mechanism
      pollJobStatus(job.id, aiMsgId);
      
    } catch (error) {
      console.error(error);
      updateMessageStatus(aiMsgId, "failed");
      setIsLoading(false);
    }
  };

  const pollJobStatus = async (jobId: number, messageId: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 5 mins total if 2.5s intervals
    
    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        const job = await apiClient.get<any>(`/api/v1/generations/${jobId}`);
        
        if (job.status === "completed") {
          updateMessageStatus(messageId, "completed", job.result_url);
          setIsLoading(false);
          clearInterval(pollInterval);
        } else if (job.status === "failed") {
          updateMessageStatus(messageId, "failed");
          setIsLoading(false);
          clearInterval(pollInterval);
        }
        
        if (attempts >= maxAttempts) {
          updateMessageStatus(messageId, "failed");
          setIsLoading(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error(error);
      }
    }, 2500); // 2.5 seconds optimal polling
  };

  const updateMessageStatus = (id: string, status: Message["status"], mediaUrl?: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, status, mediaUrl } : msg
    ));
  };

  const handleTrainerSubmit = (jobId: string, charName: string) => {
    // 1. Add User "Action" Message
    const userMsgId = Date.now().toString();
    const newUserMsg: Message = { 
        id: userMsgId, 
        role: "user", 
        content: `Train new character model: @${charName}` 
    };
    
    // 2. Add AI Training indicator
    const aiMsgId = (Date.now() + 1).toString();
    const newAiMsg: Message = { 
      id: aiMsgId, 
      role: "ai", 
      content: `Training LoRA model for @${charName}. This usually takes about 5 minutes...`,
      mediaType: "image", // Mock media type to show it's working behind the scenes
      status: "processing" 
    };

    setMessages(prev => [...prev, newUserMsg, newAiMsg]);

    // Track the training job status just like a generation
    pollJobStatus(parseInt(jobId), aiMsgId);
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-background">
      {/* Background Aurora Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-[100%] bg-purple-600/10 blur-[150px]" />
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl z-30 flex-col p-4 relative hidden md:flex">
        <div className="mb-8 px-2 mt-2">
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Zhovon Studio
            </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
            <LayoutDashboard size={18} />
            Dashboard
          </a>
          <a href="/assistant" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
            <MessageSquarePlus size={18} />
            Chat Assistant
          </a>
          <a href="/" className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 transition-colors text-sm font-medium">
            <Sparkles size={18} />
            Media Studio
          </a>
          <button onClick={() => setIsTrainerOpen(true)} className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
            <UserPlus size={18} />
            Train Character
          </button>
        </nav>
        
        <div className="mt-auto space-y-2 border-t border-white/5 pt-4">
          <a href="/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
            <CreditCard size={18} />
            Pricing Plans
          </a>
          <a href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
            <SettingsIcon size={18} />
            Settings
          </a>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Mobile Header */}
        <header className="absolute top-0 w-full z-20 flex justify-between items-center p-6 bg-gradient-to-b from-background/80 to-transparent md:hidden">
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Zhovon Studio
          </h1>
          <button className="text-white">
            <Menu size={24} />
          </button>
        </header>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto px-4 pt-24 md:pt-8 pb-32 z-10 w-full max-w-5xl mx-auto custom-scrollbar">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background/90 to-transparent pb-4 pt-8 z-20">
          <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </main>

      <ModelTrainerModal 
        isOpen={isTrainerOpen} 
        onClose={() => setIsTrainerOpen(false)} 
        onSubmit={handleTrainerSubmit} 
      />
    </div>
  );
}
