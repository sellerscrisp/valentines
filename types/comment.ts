export interface Reaction {
  id: string;
  user_id: string;
  comment_id: string;
  reaction_type: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  entry_id: string;
  reactions: Reaction[];
  is_edited?: boolean;
} 