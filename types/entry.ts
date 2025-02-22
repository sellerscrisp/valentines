export interface Entry {
  id: string;
  title?: string;
  content: string;
  entry_date: string;
  date_added: string;
  images?: { url: string; order: number; }[];
  location?: string;
  poster: string;
  submitted_by?: string | null;
  comment_count?: number;
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