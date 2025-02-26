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
  const data = await res.json();
  console.log('Fetched comments:', data);
  return data as Comment[];
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
    console.log('New reply:', newReply);

    // Force a revalidation instead of optimistic update
    await mutate();
    
    return newReply.id;
  };

  const addReaction = async (commentId: string, reactionType: Reaction["reaction_type"]): Promise<void> => {
    await fetch('/api/comments/reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, reactionType }),
    });
    
    // Optimistically update reactions
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          reactions: [...(comment.reactions || []), {
            id: 'temp',
            comment_id: commentId,
            user_id: session?.user?.id || '',
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
                    user_id: session?.user?.id || '',
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
    
    await mutate(updatedComments, false);
  };

  const removeReaction = async (commentId: string, reactionType: Reaction["reaction_type"]): Promise<void> => {
    await fetch('/api/comments/reaction', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, reactionType }),
    });
    
    // Optimistically update reactions
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          reactions: (comment.reactions || []).filter(r => 
            !(r.user_id === session?.user?.id && r.reaction_type === reactionType)
          )
        };
      }
      if (comment.replies?.length) {
        return {
          ...comment,
          replies: comment.replies.map(reply =>
            reply.id === commentId
              ? {
                  ...reply,
                  reactions: (reply.reactions || []).filter(r => 
                    !(r.user_id === session?.user?.id && r.reaction_type === reactionType)
                  )
                }
              : reply
          )
        };
      }
      return comment;
    });
    
    await mutate(updatedComments, false);
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