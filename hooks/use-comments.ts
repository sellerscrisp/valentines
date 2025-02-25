import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Comment, Reaction } from "@/types/comments";
import { supabase } from "@/lib/supabaseClient";

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

  const addComment = async (content: string, parentId?: string, level: number = 0): Promise<string> => {
    if (!session) throw new Error("Must be logged in to comment");

    const res = await fetch(`/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, content, parentId, level }),
    });

    if (!res.ok) throw new Error("Failed to add comment");
    const data = await res.json() as { id: string };
    mutate();
    return data.id;
  };

  const deleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized to delete this comment");
        }
        throw new Error("Failed to delete comment");
      }

      mutate();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  const addReply = async (content: string, parentId: string): Promise<string> => {
    const { data: comment } = await supabase
      .from('comments')
      .select('parent_id')
      .eq('id', parentId)
      .single();

    const actualParentId = comment?.parent_id || parentId;
    return addComment(content, actualParentId);
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

  const removeReaction = async (commentId: string, reactionType: string) => {
    try {
      const response = await fetch(
        `/api/comments/${commentId}/reactions?type=${encodeURIComponent(reactionType)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to remove reaction');
      
      // Update local state
      mutate();
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
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