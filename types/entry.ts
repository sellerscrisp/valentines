export interface Entry {
  id: string;
  title?: string;
  content: string;
  created_at: string;
  user_id: string;
  images: { url: string; order: number; }[];
  image_url?: string;
  entry_date: string;
  date_added: string;
  location?: string;
  poster: string;
  submitted_by?: string | null;
  comment_count?: number;
  posterEmail: string;
}

export interface EntryCardProps {
  entry: Entry;
}

export interface EditEntryDialogProps {
  entry: Entry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface AddEntrySheetProps {
  onClose: () => void;
}

export interface BookViewProps {
  onClose: () => void;
} 