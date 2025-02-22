import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Comment, Reaction } from "@/types/comments";

export async function fetchComments(entryId: string): Promise<Comment[]> {
  const res = await fetch(`/api/comments?entryId=${entryId}`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export function useComments(entryId: string) {
  const { data: session } = useSession();
  const { data, error, mutate } = useSWR<Comment[]>(
    entryId ? `comments-${entryId}` : null,
    () => fetchComments(entryId)
  );

  const addComment = async (content: string, parentId?: string) => {
    if (!session) throw new Error("Must be logged in to comment");

    const res = await fetch(`/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, content, parentId }),
    });

    if (!res.ok) throw new Error("Failed to add comment");

    mutate();
  };

  const deleteComment = async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete comment");

    mutate();
  };

  const addReply = async (content: string, parentId: string) => {
    await addComment(content, parentId);
  };

  const addReaction = async (commentId: string, reactionType: Reaction['reaction_type']) => {
    if (!session) throw new Error("Must be logged in to react");

    const res = await fetch(`/api/comments/${commentId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reactionType }),
    });

    if (!res.ok) throw new Error("Failed to add reaction");
    mutate();
  };

  const removeReaction = async (commentId: string, reactionType: Reaction['reaction_type']) => {
    const res = await fetch(`/api/comments/${commentId}/reactions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reactionType }),
    });

    if (!res.ok) throw new Error("Failed to remove reaction");
    mutate();
  };

  return {
    comments: data || [],
    isLoading: !error && !data,
    error,
    addComment,
    deleteComment,
    addReply,
    addReaction,
    removeReaction,
  };
} 