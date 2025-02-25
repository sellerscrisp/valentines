"use client";

import { useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Send } from "lucide-react";
// import { useAvatar } from "@/hooks/use-avatar";

interface CommentInputProps {
  entryId?: string;
  addComment: (content: string) => Promise<string>;
  placeholder?: string;
  replyingTo?: { user_name: string };
  onCancelReply: () => void;
  onCommentAdded?: (commentId: string) => void;
}

export const CommentInput = forwardRef<HTMLTextAreaElement, CommentInputProps>(
  ({ addComment, placeholder = "Add a comment...", replyingTo, onCancelReply, onCommentAdded }, ref) => {
    const { data: session } = useSession();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      if (!content.trim()) return;
      setIsSubmitting(true);
      try {
        const commentId = await addComment(content);
        setContent("");
        onCommentAdded?.(commentId);
      } catch (error) {
        console.error("Error adding comment:", error);
      }
      setIsSubmitting(false);
    };

    if (!session?.user) return null;

    return (
      <div className="flex flex-col">
        {replyingTo && (
          <div className="flex items-center justify-between mb-2 px-3">
            <span className="text-sm text-muted-foreground">
              Replying to @{replyingTo.user_name}...
            </span>
            <button 
              onClick={() => onCancelReply()} 
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex gap-2 items-start">
          {/* <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{session?.user?.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar> */}
          <div className="flex-1 relative">
            <Textarea
              ref={ref}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-[40px] pr-10 text-sm resize-none rounded-t-none border-secondary/60 bg-secondary/60"
            />
            <Button
              size="icon"
              className="h-7 w-7 absolute right-1.5 bottom-1.5 border-secondary/60 bg-secondary/60"
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
            >
              <Send className="h-4 w-4 text-primary" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

CommentInput.displayName = 'CommentInput'; 