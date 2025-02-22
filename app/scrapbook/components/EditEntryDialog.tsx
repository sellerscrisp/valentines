"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { mutate } from "swr";
import { EditEntryDialogProps } from "@/types/entry";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { formatDateForForm } from "@/lib/date";

export function EditEntryDialog({ entry, open, onOpenChange }: EditEntryDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const form = useForm({
    defaultValues: {
      title: entry.title || "",
      content: entry.content,
      location: entry.location || "",
      entry_date: formatDateForForm(entry.entry_date),
    },
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let images = [...(entry.images || [])];

      if (data.image && data.image.length > 0) {
        // Upload new images
        const uploadPromises = Array.from(data.image as unknown as File[]).map(async (file, index) => {
          const filePath = `entries/${Date.now()}-${index}-${file.name}`;

          const { error: uploadError } = await Promise.race([
            supabase.storage
              .from("scrapbook")
              .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false
              }),
            new Promise<{ error: Error }>((_, reject) =>
              setTimeout(() => reject({ error: new Error("Upload timed out") }), 30000)
            )
          ]);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("scrapbook")
            .getPublicUrl(filePath);

          return {
            url: urlData.publicUrl,
            order: images.length + index // Add new images at the end
          };
        });

        const newImages = await Promise.all(uploadPromises);
        images = [...images, ...newImages];
      }

      const { error: updateError } = await supabase
        .from("scrapbook_entries")
        .update({
          title: data.title,
          content: data.content,
          entry_date: formatDateForForm(data.entry_date),
          images,
          location: data.location,
        })
        .eq("id", entry.id);

      if (updateError) throw updateError;

      toast({
        title: "Success!",
        description: (
          <span>
            <strong className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">
              {entry.title}
            </strong> updated successfully
          </span>
        ),
      });

      mutate("scrapbookEntries");
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: error instanceof Error ? error.message : "Failed to update entry",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete all images from storage
      if (entry.images?.length) {
        const deletePromises = entry.images.map(async (image) => {
          const imagePath = image.url.split('/').pop();
          if (imagePath) {
            const { error: storageError } = await supabase.storage
              .from("scrapbook")
              .remove([`entries/${imagePath}`]);
            if (storageError) throw storageError;
          }
        });
        await Promise.all(deletePromises);
      }

      const { error: dbError } = await supabase
        .from("scrapbook_entries")
        .delete()
        .eq("id", entry.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: (
          <span>
            <strong className="bg-gradient-to-r from-red-500 via-pink-500 to-red-300 text-transparent bg-clip-text">
              {entry.title}
            </strong> deleted successfully
          </span>
        ),
      });
      mutate("scrapbookEntries");
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete entry",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-background/70 backdrop-blur-lg border-none shadow-xl rounded-xl max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Edit Memory
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Make changes to your memory here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-foreground">Title</Label>
                <Input
                  {...form.register("title")}
                  className="bg-white/50 border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-foreground">Date</Label>
                <Input
                  type="date"
                  {...form.register("entry_date", {
                    required: "Date is required",
                    validate: (value) => {
                      const date = new Date(value);
                      return !isNaN(date.getTime()) || "Invalid date";
                    }
                  })}
                  className="bg-white/50 border-input text-foreground"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-foreground">Content</Label>
                <Textarea
                  {...form.register("content")}
                  className="bg-white/50 border-input text-foreground min-h-[100px] placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-foreground">Location</Label>
                <Input
                  {...form.register("location")}
                  className="bg-white/50 border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirmation(true)}
                className="bg-destructive/10 text-destructive hover:bg-destructive/20"
              >
                Delete Entry
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
} 