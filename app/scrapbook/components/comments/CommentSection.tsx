"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CommentList } from "./CommentList";
import { CommentInput } from "./CommentInput";
import { useComments } from "@/hooks/use-comments";

interface CommentSectionProps {
  entryId: string;
}

export function CommentSection({ entryId }: CommentSectionProps) {
  const { comments, isLoading, error, addComment, deleteComment, addReply, addReaction, removeReaction } = useComments(entryId);
  const [focusedCommentId, setFocusedCommentId] = useState<string | undefined>();

  if (isLoading) return <div className="animate-pulse">Loading comments...</div>;
  if (error) return <div className="text-destructive">Error loading comments</div>;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="comments">
        <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-4">
            <CommentInput 
              entryId={entryId}
              addComment={addComment}
              onCancelReply={() => {}}
            />
            <CommentList 
              comments={comments}
              deleteComment={deleteComment}
              addReply={addReply}
              addReaction={addReaction}
              removeReaction={removeReaction}
              onReply={(comment) => setFocusedCommentId(comment.id)}
              focusedCommentId={focusedCommentId}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 