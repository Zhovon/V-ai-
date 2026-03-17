"use client";

import { useState, useCallback } from "react";
import { X, UploadCloud, Loader2, Info } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

interface ModelTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobId: string, charName: string) => void;
}

export function ModelTrainerModal({ isOpen, onClose, onSubmit }: ModelTrainerModalProps) {
  const [characterName, setCharacterName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError("");
    const newFiles = [...files, ...acceptedFiles].slice(0, 20); // Max 20 files
    setFiles(newFiles);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10485760, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleTrain = async () => {
    if (!characterName.trim()) {
      setError("Please enter a character name.");
      return;
    }
    if (files.length < 4) {
      setError("Please upload at least 4 images (5-15 recommended).");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Create FormData to send files
      const formData = new FormData();
      formData.append("character_name", characterName);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const token = useAuthStore.getState().token;
      
      // API Call to custom backend endpoint that zips & sends to Fal.ai
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/v1/train`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to start training job");
      }

      const data = await response.json();
      
      // Pass the job info back to ChatLayout to track progress
      onSubmit(data.id, characterName);
      
      // Reset and close
      setCharacterName("");
      setFiles([]);
      onClose();

    } catch (err: any) {
      console.error("Training error:", err);
      setError("Failed to start training. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-black border border-white/10 shadow-2xl rounded-2xl overflow-hidden glass-card">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-semibold">Train Custom Character</h2>
            <p className="text-sm text-muted-foreground mt-1">Upload 5-15 images of a specific person's face to create a LoRA.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          <div>
            <label className="block text-sm font-medium mb-2">Character Trigger Name</label>
            <input 
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="e.g., 'zman_ai'"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
              disabled={isUploading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Upload Images ({files.length}/20)</label>
            </div>
            
            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200",
                isDragActive ? "border-primary bg-primary/5" : "border-white/20 hover:border-white/40 hover:bg-white/5",
                isUploading && "opacity-50 pointer-events-none"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-white/5">
                  <UploadCloud className="text-muted-foreground" size={24} />
                </div>
                <div className="text-sm">
                  <span className="text-primary font-medium">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, up to 10MB per file</p>
              </div>
            </div>
            
            {/* Image Preview Grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {files.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                      disabled={isUploading}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-sm text-blue-200">
            <Info className="shrink-0 mt-0.5" size={16} />
            <p>Training takes about 5-10 minutes. Once complete, you can use this character's name in your video and image prompts!</p>
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button 
            onClick={handleTrain}
            disabled={isUploading || files.length === 0 || !characterName}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Initializing...
              </>
            ) : "Start Training ($2.00)"}
          </button>
        </div>

      </div>
    </div>
  );
}
