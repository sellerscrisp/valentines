export interface Reaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: '❤️' | '👍' | '👎' | '😁' | '😂' | '🥹' | '😉' | '😘' | '🥰' | '😍' | '😠' | '😜' | '🤓';
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  entry_id: string;
  parent_id: string | null;
  is_edited: boolean;
  reactions?: Reaction[];
  replies?: Comment[];
} 