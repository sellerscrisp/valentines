"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CommentList } from "./CommentList";
import { CommentInput } from "./CommentInput";
import { useComments } from "@/hooks/use-comments";
import { MessageCircle, X } from "lucide-react";
import { Comment, Reaction } from "@/types/comments";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CommentsDrawerProps {
  entryId: string;
}

interface ReplyingTo {
  id: string;
  author: string;
  level: number;
}

interface CommentsContentProps {
  comments: Comment[];
  isLoading: boolean;
  error: any;
  replyingTo: ReplyingTo | null;
  commentInputRef: React.RefObject<HTMLTextAreaElement | null>;
  handleComment: (content: string) => Promise<string>;
  handleReply: (comment: Comment) => void;
  cancelReply: () => void;
  handleBackdropClick: (e: React.MouseEvent) => void;
  onClose: () => void;
  className?: string;
  entryId: string;
  deleteComment: (commentId: string) => Promise<void>;
  addReply: (content: string, parentId: string) => Promise<string>;
  addReaction: (commentId: string, reactionType: Reaction["reaction_type"]) => Promise<void>;
  removeReaction: (commentId: string, reactionType: Reaction["reaction_type"]) => Promise<void>;
}

function CommentsContent({
  comments,
  isLoading,
  error,
  replyingTo,
  commentInputRef,
  handleComment,
  handleReply,
  cancelReply,
  handleBackdropClick,
  className = "",
  entryId,
  deleteComment,
  addReply,
  addReaction,
  removeReaction,
}: CommentsContentProps) {
  useEffect(() => {
    if (replyingTo && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
        const replyElement = document.querySelector(`[data-comment-id="${replyingTo.id}"]`);
        if (replyElement) {
          const drawer = document.querySelector('[data-drawer-content]');
          if (drawer) {
            const drawerRect = drawer.getBoundingClientRect();
            const replyRect = replyElement.getBoundingClientRect();
            const offset = replyRect.top - drawerRect.top - 100;
            drawer.scrollTop = offset;
          }
        }
      }, 300);
    }
  }, [replyingTo]);

  return (
    <>
      <div 
        data-drawer-content
        className={`p-4 overflow-y-auto h-[calc(100%-140px)] ${className}`}
        onClick={handleBackdropClick}
      >
        {isLoading && (
          <div className="animate-pulse text-center">Loading comments...</div>
        )}
        {error && (
          <div className="text-red-500 text-center">Error loading comments</div>
        )}
        {!isLoading && !error && (
          <CommentList
            comments={comments}
            onReply={handleReply}
            focusedCommentId={replyingTo?.id}
            deleteComment={deleteComment}
            addReply={addReply}
            addReaction={addReaction}
            removeReaction={removeReaction}
          />
        )}
      </div>
      <div className="border-t p-4 bg-background w-full" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        {replyingTo && (
          <div className="p-2 bg-secondary rounded-t-lg flex items-center justify-between">
            <span className="text-sm text-secondary-foreground">
              Replying to {replyingTo.author}
            </span>
            <button onClick={cancelReply}>
              <X className="h-4 w-4 text-secondary-foreground" />
            </button>
          </div>
        )}
        <CommentInput
          ref={commentInputRef}
          entryId={entryId}
          addComment={handleComment}
          placeholder={replyingTo ? `@${replyingTo.author}...` : "Add a comment..."}
          onCancelReply={cancelReply}
        />
      </div>
    </>
  );
}

export function CommentsDrawer({ entryId }: CommentsDrawerProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    addReply,
    addReaction,
    removeReaction,
  } = useComments(entryId);

  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleComment = async (content: string): Promise<string> => {
    try {
      if (replyingTo) {
        const commentId = await addReply(content, replyingTo.id);
        setReplyingTo(null);
        return commentId;
      } else {
        const commentId = await addComment(content);
        return commentId;
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo({
      id: comment.id,
      author: comment.user_name,
      level: comment.level || 0
    });
    commentInputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    const isDrawerContent = (e.target as HTMLElement).closest('[data-drawer-content]');
    const isCommentItem = (e.target as HTMLElement).closest('[data-comment-item]');
    
    if (isDrawerContent && !isCommentItem) {
      setReplyingTo(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setReplyingTo(null);
  };

  const trigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-muted-foreground"
    >
      <MessageCircle className="mr-1 h-4 w-4" />
      {comments.length} {comments.length === 1 ? "comment" : "comments"}
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </DialogTitle>
            <DialogDescription>
              {comments.length === 0 ? "be the first to comment!" : "be nice!"}
            </DialogDescription>
          </DialogHeader>
          <CommentsContent
            comments={comments}
            isLoading={isLoading}
            error={error}
            replyingTo={replyingTo}
            commentInputRef={commentInputRef}
            handleComment={handleComment}
            handleReply={handleReply}
            cancelReply={cancelReply}
            handleBackdropClick={handleBackdropClick}
            onClose={handleClose}
            entryId={entryId}
            deleteComment={deleteComment}
            addReply={addReply}
            addReaction={addReaction}
            removeReaction={removeReaction}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="bg-gray-100 h-[80vh] flex flex-col overflow-hidden">
        <DrawerHeader className="bg-gray-100 border-b">
          <DrawerTitle>
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </DrawerTitle>
          <DrawerDescription>
            {comments.length === 0 ? "be the first to comment!" : "be nice!"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden">
          <CommentsContent
            comments={comments}
            isLoading={isLoading}
            error={error}
            replyingTo={replyingTo}
            commentInputRef={commentInputRef}
            handleComment={handleComment}
            handleReply={handleReply}
            cancelReply={cancelReply}
            handleBackdropClick={handleBackdropClick}
            onClose={handleClose}
            entryId={entryId}
            deleteComment={deleteComment}
            addReply={addReply}
            addReaction={addReaction}
            removeReaction={removeReaction}
            className="h-full"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
} 