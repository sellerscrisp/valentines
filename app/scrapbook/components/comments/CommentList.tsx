"use client";

import React from "react";
import { CommentItem } from "./CommentItem";
import { Comment, Reaction } from "@/types/comments";
import { useSession } from "next-auth/react";

interface CommentListProps {
  comments: Comment[];
  deleteComment: (commentId: string) => Promise<void>;
  addReply: (content: string, parentId: string) => Promise<void>;
  addReaction: (commentId: string, reactionType: Reaction['reaction_type']) => Promise<void>;
  removeReaction: (commentId: string, reactionType: Reaction['reaction_type']) => Promise<void>;
  onReplyClick: (commentId: string | null, replyContent?: string) => void;
  activeReplyId: string | null;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  deleteComment,
  addReply,
  addReaction,
  removeReaction,
  onReplyClick,
  activeReplyId,
}) => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  if (!currentUserId) return null;

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="pb-4">
          <CommentItem
            comment={comment}
            deleteComment={deleteComment}
            addReply={addReply}
            addReaction={addReaction}
            removeReaction={removeReaction}
            currentUserId={currentUserId}
            onReplyClick={onReplyClick}
            activeReplyId={activeReplyId}
          />
        </div>
      ))}
    </div>
  );
}; 