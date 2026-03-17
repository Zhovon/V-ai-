"use client";

import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";
import Image from "next/image";

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  mediaType?: "video" | "image";
  mediaUrl?: string;
  status?: "pending" | "processing" | "completed" | "failed";
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full mb-8", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
        
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-lg",
          isUser ? "bg-primary text-primary-foreground" : "glass border border-white/10"
        )}>
          {isUser ? <User size={20} /> : <Sparkles className="text-blue-400" size={20} />}
        </div>

        {/* Content Bubble */}
        <div className={cn(
          "flex flex-col gap-3",
          isUser ? "items-end" : "items-start"
        )}>
          {/* Text Content */}
          {message.content && (
            <div className={cn(
              "px-5 py-3.5 rounded-3xl max-w-prose shadow-sm text-[15px] leading-relaxed",
              isUser 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "glass-card text-foreground rounded-tl-sm border border-white/5"
            )}>
              {message.content}
            </div>
          )}

          {/* User Attached Media */}
          {isUser && message.mediaUrl && (
             <div className="mt-1 overflow-hidden rounded-2xl border border-white/10 glass-card bg-black/40 min-w-[200px] max-w-[300px]">
                 {message.mediaUrl.match(/\.(mp4|webm)$/i) || message.mediaUrl.startsWith("blob:") && message.content.includes("VIDEO") ? (
                    <video src={message.mediaUrl} controls className="w-full h-auto object-cover" />
                 ) : (
                    <img src={message.mediaUrl} alt="User Attachment" className="w-full h-auto object-cover" />
                 )}
             </div>
          )}

          {/* Media/Status Content */}
          {!isUser && message.status && (
            <div className="mt-1 overflow-hidden rounded-2xl border border-white/10 glass-card bg-black/40 min-w-[280px]">
              
              {(message.status === "pending" || message.status === "processing") && (
                <div className="p-8 flex flex-col items-center justify-center gap-4 text-muted-foreground w-full h-[200px] animate-pulse">
                  <Sparkles className="animate-spin text-blue-500" size={24} />
                  <p className="text-sm">Generating your {message.mediaType}...</p>
                </div>
              )}

              {message.status === "failed" && (
                <div className="p-6 text-red-400 flex flex-col items-center justify-center bg-red-950/20 text-sm">
                  <p>Generation failed. Please try again.</p>
                </div>
              )}

              {message.status === "completed" && message.mediaUrl && (
                <div className="relative group w-full bg-black">
                  {message.mediaType === "video" ? (
                    <video 
                      src={message.mediaUrl} 
                      controls 
                      autoPlay 
                      loop 
                      muted 
                      className="w-full h-auto max-h-[500px] object-contain rounded-2xl"
                    />
                  ) : (
                    <img 
                      src={message.mediaUrl} 
                      alt="Generated AI Media" 
                      className="w-full h-auto max-h-[500px] object-contain rounded-2xl transition-transform duration-500"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
