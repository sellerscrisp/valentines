"use client";

import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment, Reaction } from "@/types/comments";
import { formatTimeAgo } from "@/lib/utils";
import { EmojiReactionPicker } from "./EmojiReactionPicker";
import { useSession } from "next-auth/react";
import { ReactionCounter } from "./ReactionCounter";
import { DeleteCommentDialog } from "./DeleteCommentDialog";
import { useToast } from "@/hooks/use-toast";
import { useAvatar } from "@/hooks/use-avatar";
import { AnimatedComment } from "./AnimatedComment";
import { Trash2 } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
  deleteComment: (commentId: string) => Promise<void>;
  addReply: (content: string, parentId: string) => Promise<string>;
  addReaction: (commentId: string, reactionType: Reaction['reaction_type']) => Promise<void>;
  removeReaction: (commentId: string, reactionType: Reaction['reaction_type']) => Promise<void>;
  currentUserId: string;
  isReply?: boolean;
  onReply: (comment: Comment) => void;
  isFocused?: boolean;
  focusedCommentId?: string;
}

export function CommentItem({
  comment,
  deleteComment,
  addReply,
  addReaction,
  removeReaction,
  currentUserId,
  isReply = false,
  onReply,
  isFocused = false,
  focusedCommentId
}: CommentItemProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data: avatarUrl } = useAvatar(comment.user_email);
  const commentRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNew] = useState(true); // Will be true on first render

  // Determine if this comment or any of its replies are focused
  const isThreadFocused =
    isFocused ||
    comment.replies?.some(reply => reply.id === focusedCommentId);

  // Should blur if there's a focused comment and this thread isn't focused
  const shouldBlur = focusedCommentId && !isThreadFocused;
  const isInteractive = !focusedCommentId || isThreadFocused;

  useEffect(() => {
    if (isFocused && commentRef.current) {
      commentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isFocused]);

  const handleDelete = async () => {
    try {
      setShowDeleteDialog(false);
      setIsDeleting(true);

      // Delete immediately
      await deleteComment(comment.id);

      // Very short delay for poof animation
      await new Promise(resolve => setTimeout(resolve, 900));
    } catch {
      setIsDeleting(false);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AnimatedComment isDeleting={isDeleting} isNew={isNew}>
      <div
        ref={commentRef}
        data-comment-item
        className={`group relative p-1.5 transition-all duration-300 ${shouldBlur ? 'opacity-30 blur-[1px] pointer-events-none' : ''
          } ${isFocused ? 'scale-[1.02] z-10' : ''}`}
      >
        <div className="flex gap-1.5">
          <div className="flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={avatarUrl || ''}
                alt={comment.user_name || 'User'}
              />
              <AvatarFallback>
                {comment.user_name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <div className="inline-block">
              <div className="inline-block bg-slate-300 rounded-2xl px-3 py-2">
                <span className="font-medium text-sm block mb-0.5">{comment.user_name}</span>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 text-xs text-muted-foreground mt-0.5">
              <div className="px-1">
                <EmojiReactionPicker onReactionSelect={(type) => addReaction(comment.id, type)}>
                  {null}
                </EmojiReactionPicker>
              </div>
              <button
                onClick={() => onReply(comment)}
                disabled={!isInteractive}
                className="text-muted-foreground text-xs h-auto px-4"
              >
                Reply
              </button>
              <span className="px-1">{formatTimeAgo(comment.created_at)}</span>

              {(comment.reactions && comment.reactions.length > 0) && (
                <ReactionCounter
                  reactions={comment.reactions}
                  onRemoveReaction={(type) => removeReaction(comment.id, type)}
                />
              )}

              {session?.user?.id === comment.user_id && isInteractive && (
                <a
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-500 text-xs h-auto px-4"
                >
                  <Trash2 className="w-3 h-3" />
                </a>
              )}
            </div>

            {!isReply && comment.replies && comment.replies.length > 0 && (
              <div className="relative mt-1">
                <div className="absolute left-[1.5px] top-0 bottom-0 w-[1.5px] bg-gray-300" />
                <div className="space-y-1 pl-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      deleteComment={deleteComment}
                      addReply={addReply}
                      addReaction={addReaction}
                      removeReaction={removeReaction}
                      currentUserId={currentUserId}
                      isReply
                      onReply={onReply}
                      isFocused={focusedCommentId === reply.id}
                      focusedCommentId={focusedCommentId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DeleteCommentDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
    </AnimatedComment>
  );
} 