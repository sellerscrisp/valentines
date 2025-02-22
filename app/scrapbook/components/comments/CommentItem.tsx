"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Comment, Reaction } from "@/types/comments";
import { formatTimeAgo } from "@/lib/utils";
import { EmojiReactionPicker } from "./EmojiReactionPicker";
import { CommentInput } from "./CommentInput";
import { useSession } from "next-auth/react";
import { ReactionCounter } from "./ReactionCounter";
import { DeleteCommentDialog } from "./DeleteCommentDialog";
import { useToast } from "@/hooks/use-toast";

interface CommentItemProps {
  comment: Comment;
  deleteComment: (commentId: string) => Promise<void>;
  addReply: (content: string, parentId: string) => Promise<void>;
  addReaction: (commentId: string, reactionType: Reaction['reaction_type']) => Promise<void>;
  removeReaction: (commentId: string, reactionType: Reaction['reaction_type']) => Promise<void>;
  currentUserId: string;
  isReply?: boolean;
  onReplyClick: (commentId: string | null, replyContent?: string) => void;
  activeReplyId: string | null;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  deleteComment,
  addReply,
  addReaction,
  removeReaction,
  currentUserId,
  isReply = false,
  onReplyClick,
  activeReplyId,
}) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleReplyClick = () => {
    if (isReply) {
      // For nested replies, generate @ mention
      const replyContent = `@${comment.user_name} `;
      onReplyClick(comment.parent_id || comment.id, replyContent);
    } else {
      onReplyClick(comment.id);
    }
  };

  return (
    <div className="group relative">
      <div className="flex gap-2">
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback>
              {comment.user_name?.[0] || comment.user_id?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 space-y-1">
          <div className="inline-block">
            <div className="inline-block bg-slate-300 rounded-2xl px-3 py-2">
              <span className="font-medium text-sm block">{comment.user_name}</span>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <EmojiReactionPicker
              onReactionSelect={(type) => addReaction(comment.id, type)}
            >
              <Button variant="link" className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground">
                Like
              </Button>
            </EmojiReactionPicker>
            <button
              className="hover:underline"
              onClick={handleReplyClick}
            >
              Reply
            </button>
            <span>{formatTimeAgo(comment.created_at)}</span>
            
            {(comment.reactions && comment.reactions.length > 0) && (
              <ReactionCounter 
                reactions={comment.reactions} 
                onRemoveReaction={(type) => removeReaction(comment.id, type)}
              />
            )}

            {session?.user?.email === comment.user_id && (
              <>
                <span>•</span>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
                <DeleteCommentDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                  onConfirm={async () => {
                    try {
                      await deleteComment(comment.id);
                      setShowDeleteDialog(false);
                      toast({
                        title: "Comment deleted",
                        description: "Your comment has been successfully deleted.",
                      });
                    } catch {
                      toast({
                        title: "Error",
                        description: "Failed to delete comment. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  isDeleting={false}
                />
              </>
            )}
          </div>

          {activeReplyId === comment.id && !isReply && (
            <div className="mt-2">
              <CommentInput
                entryId={comment.entry_id}
                addComment={(content) => addReply(content, comment.id)}
                replyingTo={comment.id}
                onCancelReply={() => onReplyClick(null, "")}
              />
            </div>
          )}

          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="relative mt-2">
              <div className="absolute left-[1.5px] top-0 bottom-0 w-[1.5px] bg-gray-300" />
              <div className="space-y-2 pl-3">
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
                    onReplyClick={onReplyClick}
                    activeReplyId={activeReplyId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 