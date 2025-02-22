"use client";
import { useSession } from "next-auth/react";
import { Reaction } from "@/types/comments";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ReactionCounterProps {
  reactions: Reaction[];
  onRemoveReaction?: (reactionType: Reaction['reaction_type']) => Promise<void>;
}

export function ReactionCounter({ reactions, onRemoveReaction }: ReactionCounterProps) {
  const { data: session } = useSession();
  
  if (!reactions?.length) return null;

  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<Reaction['reaction_type'], number>);

  const userReactions = reactions.filter(r => r.user_id === session?.user?.email)
    .map(r => r.reaction_type);

  const totalReactions = reactions.length;
  const topReactions = Object.entries(reactionCounts) as [Reaction['reaction_type'], number][];
  const sortedReactions = topReactions
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 text-xs">
          <div className="flex -space-x-1 items-center">
            {sortedReactions.map(([type], index) => (
              <div
                key={type}
                className={cn(
                  "w-4 h-4 flex items-center justify-center rounded-full",
                  index === 0 && "bg-gray-100 ring-[0.01rem] ring-white z-10",
                  "relative"
                )}
              >
                <span>{type}</span>
              </div>
            ))}
          </div>
          <span className="text-muted-foreground ml-1">{totalReactions}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2">
        <div className="flex flex-col gap-1">
          {(Object.entries(reactionCounts) as [Reaction['reaction_type'], number][]).map(([type, count]) => (
            <div 
              key={type} 
              className={cn(
                "flex items-center gap-2 text-xs px-2 py-1 rounded-md",
                userReactions.includes(type) && "bg-primary/20 cursor-pointer"
              )}
              onClick={() => {
                if (userReactions.includes(type) && onRemoveReaction) {
                  onRemoveReaction(type);
                }
              }}
            >
              <span>{type}</span>
              <span className="text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
} 