"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Send } from "lucide-react";

interface CommentInputProps {
  entryId: string;
  addComment: (content: string, parentId?: string) => Promise<void>;
  replyingTo?: string;
  onCancelReply?: () => void;
  initialContent?: string;
}

export function CommentInput({ addComment, replyingTo, onCancelReply, initialContent = "" }: CommentInputProps) {
  const [content, setContent] = useState(initialContent);
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session?.user) return null;

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addComment(content, replyingTo);
      setContent("");
      onCancelReply?.();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={session.user.image || undefined} />
        <AvatarFallback>
          {session.user.name?.[0] || session.user.email?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyingTo ? `@${session.user.name}` : "Add a comment..."}
          className="min-h-[40px] pr-10 text-sm resize-none"
        />
        <Button
          size="icon"
          className="h-7 w-7 absolute right-1.5 bottom-1.5 bg-background"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
        >
          <Send className="h-4 w-4 text-secondary" />
        </Button>
      </div>
    </div>
  );
} 