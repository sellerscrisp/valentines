"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  files: FileList | null;
  onRemove: (index: number) => void;
}

export function ImagePreview({ files, onRemove }: ImagePreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  if (!files || files.length === 0) return null;

  const previews = Array.from(files).map(file => URL.createObjectURL(file));

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
      <Image
        src={previews[selectedIndex]}
        alt="Preview"
        fill
        className="object-contain"
      />
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white rounded-full"
        onClick={() => onRemove(selectedIndex)}
      >
        <X className="h-4 w-4" />
      </Button>

      {files.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {previews.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedIndex ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 