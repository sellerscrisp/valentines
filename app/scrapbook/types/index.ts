export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_email: string;
  user_name: string;
  replies: Comment[];
} 