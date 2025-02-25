"use client";

import React from "react";
import { CommentItem } from "./CommentItem";
import { Comment, Reaction } from "@/types/comments";
import { useSession } from "next-auth/react";

interface CommentListProps {
  comments: Comment[];
  deleteComment: (commentId: string) => Promise<void>;
  addReply: (content: string, parentId: string) => Promise<string>;
  addReaction: (commentId: string, reactionType: Reaction["reaction_type"]) => Promise<void>;
  removeReaction: (commentId: string, reactionType: Reaction["reaction_type"]) => Promise<void>;
  onReply: (comment: Comment) => void;
  focusedCommentId?: string;
}

export function CommentList({ comments, focusedCommentId = undefined, ...props }: CommentListProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || '';

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          isFocused={comment.id === focusedCommentId}
          focusedCommentId={focusedCommentId}
          {...props}
        />
      ))}
    </div>
  );
} 