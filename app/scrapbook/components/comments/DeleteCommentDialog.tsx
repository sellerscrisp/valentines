import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteCommentDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting
}: DeleteCommentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-primary/20 backdrop-blur-lg rounded-xl shadow-xl border-primary/60">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-white">
            Delete comment?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/70">
            This action cannot be undone. This will permanently delete your comment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:gap-0">
          <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-none md:mr-2">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive/50 text-white hover:bg-red-500/40 transition-all duration-300"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 