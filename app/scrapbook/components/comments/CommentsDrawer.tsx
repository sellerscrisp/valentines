"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CommentList } from "./CommentList";
import { CommentInput } from "./CommentInput";
import { useComments } from "@/hooks/use-comments";
import { MessageCircle } from "lucide-react";

interface CommentsDrawerProps {
  entryId: string;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({ entryId }) => {
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
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const handleReplyClick = (commentId: string | null) => {
    setActiveReplyId(commentId);
  };

  return (
    <Drawer >
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
        >
          <MessageCircle className="mr-1 h-4 w-4" />
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-lg bg-gray-100">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold">Comments</DrawerTitle>
          <DrawerDescription className="text-sm text-gray-500">
            {comments.length === 0 ? "be the first to comment!" : "be nice!"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto h-full">
          {isLoading && (
            <div className="animate-pulse text-center">Loading comments...</div>
          )}
          {error && (
            <div className="text-red-500 text-center">Error loading comments</div>
          )}
          {!isLoading && !error && (
            <>
              <CommentList
                comments={comments}
                deleteComment={deleteComment}
                addReply={addReply}
                addReaction={addReaction}
                removeReaction={removeReaction}
                onReplyClick={handleReplyClick}
                activeReplyId={activeReplyId}
              />
              <CommentInput entryId={entryId} addComment={addComment} />
            </>
          )}
        </div>
        <DrawerFooter className="border-t">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}; 