"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Image as ImageIcon, Video, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  onSubmit: (prompt: string, type: "video" | "video-kling" | "image-zimage-turbo" | "image-nanobanana2" | "faceswap" | "lipsync", extraInputs?: any) => void;
  isLoading: boolean;
}

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [generationType, setGenerationType] = useState<"video" | "video-kling" | "image-zimage-turbo" | "image-nanobanana2" | "faceswap" | "lipsync">("video");
  const [attachment, setAttachment] = useState<{fileUrl?: string, name?: string, type?: string} | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((prompt.trim() || generationType === "faceswap" || generationType === "lipsync") && !isLoading) {
      
      const extraInputs: any = {};
      if (attachment?.fileUrl) {
          if (generationType === "faceswap") extraInputs.face_image_url = attachment.fileUrl;
          if (generationType === "lipsync") extraInputs.audio_url = attachment.fileUrl;
          if (generationType === "video" || generationType === "video-kling" || generationType.startsWith("image-")) {
              if (attachment.type?.startsWith("video/")) {
                  extraInputs.video_url = attachment.fileUrl;
              } else {
                  extraInputs.image_url = attachment.fileUrl;
              }
          }
      }

      onSubmit(prompt.trim(), generationType, Object.keys(extraInputs).length > 0 ? extraInputs : undefined);
      setPrompt("");
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app we'd upload to a bucket here and get a URL back.
      // For demo purposes, we will mock the URL or create an object URL.
      const fakeUrl = URL.createObjectURL(file);
      setAttachment({ fileUrl: fakeUrl, name: file.name, type: file.type });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 z-10 glass-card rounded-3xl m-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {showAdvanced && (
          <div className="flex flex-wrap items-center gap-2 pb-3 mb-2 border-b border-white/5 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs text-muted-foreground mr-2">Advanced Tools:</span>
            
            <button
              type="button"
              onClick={() => setGenerationType("faceswap")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                generationType === "faceswap" 
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/30" 
                  : "bg-black/20 text-muted-foreground border border-transparent hover:bg-black/40 hover:text-foreground"
              )}
            >
              Face Swap
            </button>
            <button
              type="button"
              onClick={() => setGenerationType("lipsync")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                generationType === "lipsync" 
                  ? "bg-pink-500/20 text-pink-200 border border-pink-500/30" 
                  : "bg-black/20 text-muted-foreground border border-transparent hover:bg-black/40 hover:text-foreground"
              )}
            >
              Lip Sync
            </button>
            
            <div className="ml-auto flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-foreground hover:bg-white/10 cursor-pointer transition-colors border border-white/10">
                <ImageIcon size={14} />
                {attachment ? "Replace File" : "Attach File (Image/Audio/Video)"}
                <input type="file" className="hidden" accept="image/*,audio/*,video/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        )}

        {attachment && (
            <div className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg w-max text-sm text-blue-300 border border-blue-500/20 mb-2">
              <Sparkles size={14} /> Attached: {attachment.name}
              <button type="button" onClick={() => setAttachment(null)} className="ml-2 text-muted-foreground hover:text-white">&times;</button>
            </div>
        )}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={generationType === "faceswap" ? "Optional: Describe the target video..." : generationType === "lipsync" ? "Optional: Describe the target video..." : "Describe the video or image you want to generate..."}
          className="w-full bg-transparent text-foreground placeholder-muted-foreground resize-none outline-none hide-scrollbar p-2 max-h-40 min-h-[60px]"
          disabled={isLoading}
        />
        
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGenerationType("video")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                generationType === "video" 
                  ? "bg-primary/20 text-primary-foreground border border-primary/30" 
                  : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10 hover:text-foreground"
              )}
            >
              <Video size={14} /> Video (Wan 2.1)
            </button>
            <button
              type="button"
              onClick={() => setGenerationType("video-kling")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                generationType === "video-kling" 
                  ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" 
                  : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10 hover:text-foreground"
              )}
            >
              <Sparkles size={14} /> Video (Kling 3.0)
            </button>
            <button
              type="button"
              onClick={() => setGenerationType("image-zimage-turbo")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                generationType === "image-zimage-turbo" 
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/30" 
                  : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10 hover:text-foreground"
              )}
            >
              <ImageIcon size={14} /> Image (ZImage Turbo)
            </button>
            <button
              type="button"
              onClick={() => setGenerationType("image-nanobanana2")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                generationType === "image-nanobanana2" 
                  ? "bg-yellow-500/20 text-yellow-200 border border-yellow-500/30" 
                  : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10 hover:text-foreground"
              )}
            >
              <ImageIcon size={14} /> Image (NanoBanana 2)
            </button>
             <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ml-2",
                showAdvanced 
                  ? "bg-blue-500/20 text-blue-200 border border-blue-500/30" 
                  : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10 hover:text-foreground"
              )}
            >
              <Sparkles size={14} /> Advanced Tools
            </button>
          </div>
          
          <button
            type="submit"
            disabled={(!prompt.trim() && generationType !== "faceswap" && generationType !== "lipsync") || isLoading}
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
  );
}
