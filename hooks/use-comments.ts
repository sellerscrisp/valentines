import useSWR from "swr";
import { Comment, Reaction } from "@/types/comments";
import { useSession } from "next-auth/react";

// Helper function to update nested comments
const updateNestedComment = (comments: Comment[], parentId: string, newReply: Comment): Comment[] => {
  return comments.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply]
      };
    }
    // Recursively check replies
    if (comment.replies?.length) {
      return {
        ...comment,
        replies: updateNestedComment(comment.replies, parentId, newReply)
      };
    }
    return comment;
  });
};

// Fetcher function
const fetchComments = async (url: string): Promise<Comment[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch comments');
  const data = (await res.json()) as Array<{
    comment_reactions: Reaction[];
    replies?: Array<{ comment_reactions: Reaction[] }>;
    [key: string]: any;
  }>;
  
  const transformedData = data.map(comment => ({
    ...comment,
    reactions: comment.comment_reactions || [],
    replies: (comment.replies || []).map(reply => ({
      ...reply,
      reactions: reply.comment_reactions || []
    }))
  }));

  // console.log('Transformed comments:', transformedData);
  return transformedData as unknown as Comment[];
};

export function useComments(entryId: string) {
  const { data: session } = useSession();
  const { data: comments = [], mutate } = useSWR<Comment[]>(
    entryId ? `/api/comments?entryId=${entryId}` : null,
    fetchComments as (url: string) => Promise<Comment[]>
  );

  const addComment = async (content: string): Promise<string> => {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, content }),
    });
    const data = await response.json() as Comment;
    await mutate([...comments, data], false);
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

    if (!response.ok) {
      throw new Error('Failed to add reply');
    }

    const newReply = await response.json() as Comment;
    // console.log('New reply:', newReply);

    // Force a revalidation instead of optimistic update
    await mutate();
    
    return newReply.id;
  };

  const addReaction = async (commentId: string, reactionType: Reaction["reaction_type"]): Promise<void> => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/comments/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, reactionType }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      // Transform the current comments to include the new reaction
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            reactions: [...(comment.reactions || []), {
              id: 'temp', // Will be replaced on next fetch
              comment_id: commentId,
              user_id: session?.user?.id,
              reaction_type: reactionType,
              created_at: new Date().toISOString()
            }]
          };
        }
        if (comment.replies?.length) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId
                ? {
                    ...reply,
                    reactions: [...(reply.reactions || []), {
                      id: 'temp',
                      comment_id: commentId,
                      user_id: session?.user?.id,
                      reaction_type: reactionType,
                      created_at: new Date().toISOString()
                    }]
                  }
                : reply
            )
          };
        }
        return comment;
      });

      // Update optimistically
      await mutate(updatedComments as Comment[], false);
      // Then revalidate to get the real data
      await mutate();

    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  const removeReaction = async (commentId: string, reactionType: Reaction["reaction_type"]): Promise<void> => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/comments/reaction', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, reactionType }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove reaction');
      }

      // Force a revalidation to get fresh data from the server
      await mutate();

    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
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