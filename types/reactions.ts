export type ReactionType = '❤️' | '👍' | '👎' | '😁' | '😂' | '🥹' | '😉' | '😘' | '🥰' | '😍' | '😠' | '😜' | '🤓';

export interface Reaction {
  id: string;
  reaction_type: ReactionType;
  user_id: string;
  created_at: string;
} 