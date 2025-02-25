import useSWR from "swr";
import { Comment, Reaction } from "@/types/comments";
import { useSession } from "next-auth/react";

export function useComments(entryId: string) {
  const { data: session } = useSession();
  const { data: comments = [], mutate } = useSWR<Comment[]>(
    entryId ? `/api/comments?entryId=${entryId}` : null
  );

  const addComment = async (content: string): Promise<string> => {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, content }),
    });
    const data = await response.json() as Comment;
    await mutate();
    return data.id;
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    await mutate();
  };

  const addReply = async (content: string, parentId: string): Promise<string> => {
    const response = await fetch('/api/comments/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, content, parentId }),
    });
    const data = await response.json() as Comment;
    await mutate();
    return data.id;
  };

  const addReaction = async (commentId: string, reactionType: Reaction["reaction_type"]): Promise<void> => {
    await fetch('/api/comments/reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, reactionType }),
    });
    await mutate();
  };

  const removeReaction = async (commentId: string, reactionType: Reaction["reaction_type"]): Promise<void> => {
    await fetch('/api/comments/reaction', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, reactionType }),
    });
    await mutate();
  };

  return {
    comments,
    isLoading: !comments,
    error: null,
    addComment,
    deleteComment,
    addReply,
    addReaction,
    removeReaction,
  };
} 