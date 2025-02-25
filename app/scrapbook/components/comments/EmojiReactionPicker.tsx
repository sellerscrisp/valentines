"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Reaction } from "@/types/comments";
import { motion, useDragControls, useMotionValue } from "framer-motion";

const REACTIONS = [
  { emoji: "❤️", label: "love" },
  { emoji: "👍", label: "thumbs up" },
  { emoji: "👎", label: "thumbs down" },
  { emoji: "😁", label: "grin" },
  { emoji: "😂", label: "joy" },
  { emoji: "🥹", label: "holding tears" },
  { emoji: "😉", label: "wink" },
  { emoji: "😘", label: "kiss" },
  { emoji: "🥰", label: "love face" },
  { emoji: "😍", label: "heart eyes" },
  { emoji: "😠", label: "angry" },
  { emoji: "😜", label: "wink tongue" },
  { emoji: "🤓", label: "nerd" },
] as const;

interface EmojiReactionPickerProps {
  onReactionSelect: (reactionType: Reaction['reaction_type']) => void;
  children: React.ReactNode;
}

export const EmojiReactionPicker: React.FC<EmojiReactionPickerProps> = ({
  onReactionSelect,
}) => {
  const [open, setOpen] = useState(false);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = () => {
    const currentX = x.get();
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const contentWidth = REACTIONS.length * 56; // 48px button + 8px gap
    const maxDrag = -(contentWidth - containerWidth);

    if (currentX > 0) x.set(0);
    else if (currentX < maxDrag) x.set(maxDrag);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <a className="p-0 text-xs font-normal text-muted-foreground focus:text-slate-300">
          React
        </a>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-3 backdrop-blur-xl bg-slate-600/50 border-none shadow-xl"
        sideOffset={5}
        align="start"
      >
        <div
          ref={containerRef}
          className="overflow-hidden"
          onPointerDown={(e) => dragControls.start(e)}
          style={{ height: '34px' }}
        >
          <motion.div
            drag="x"
            dragControls={dragControls}
            dragConstraints={{
              right: 0,
              left: -((REACTIONS.length * 42) - 280)
            }}
            dragElastic={1.1}
            dragMomentum={false}
            style={{ x }}
            onDragEnd={handleDragEnd}
            className="flex gap-2"
          >
            {REACTIONS.map((reaction) => (
              <Button
                key={reaction.label}
                variant="ghost"
                className="h-8 w-3 rounded-full hover:bg-muted/0 group relative flex-shrink-0"
                onClick={() => {
                  onReactionSelect(reaction.emoji as Reaction['reaction_type']);
                  setOpen(false);
                }}
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">
                  {reaction.emoji}
                </span>
                <span className="absolute -bottom-5 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {reaction.label}
                </span>
              </Button>
            ))}
          </motion.div>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 