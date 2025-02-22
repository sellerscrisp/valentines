"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_email: string;
  user_name: string;
}

export function CommentSection({ entryId }: { entryId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("entry_id", entryId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  }, [entryId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.email || !newComment.trim()) return;

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from("comments")
      .insert([{
        entry_id: entryId,
        content: newComment,
        user_email: session.user.email,
        user_name: session.user.name || session.user.email
      }]);

    if (!error) {
      setNewComment("");
      loadComments();
    }
    
    setIsSubmitting(false);
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback>
                {comment.user_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm">
                <span className="font-medium">{comment.user_name}</span>{" "}
                <span className="text-muted-foreground">{comment.content}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[2.5rem] resize-none"
        />
        <Button 
          type="submit" 
          disabled={isSubmitting || !newComment.trim()}
          size="sm"
        >
          Post
        </Button>
      </form>
    </div>
  );
} 