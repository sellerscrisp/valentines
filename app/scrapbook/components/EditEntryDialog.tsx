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
import { CalendarIcon, Edit } from "lucide-react";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

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
      entry_date: format(new Date(entry.entry_date + "T00:00:00Z"), "yyyy-MM-dd"),
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
          entry_date: format(data.entry_date, "yyyy-MM-dd"),
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
        <DialogContent className="bg-white/70 backdrop-blur-lg border-none shadow-xl rounded-xl max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">
              Edit Memory
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Make changes to your memory here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-gray-700">Title</Label>
                <Input 
                  {...form.register("title")} 
                  className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-gray-700">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-none text-white hover:bg-white/20 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("entry_date") ? 
                        format(new Date(form.watch("entry_date")), "PPP") : 
                        "Pick a date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black/40 backdrop-blur-lg border-none">
                    <Calendar
                      mode="single"
                      selected={form.watch("entry_date") ? new Date(form.watch("entry_date") + "T00:00:00") : undefined}
                      onSelect={(date) => {
                        form.setValue("entry_date", date ? format(date, "yyyy-MM-dd") : "");
                      }}
                      initialFocus
                      className="bg-transparent text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label className="text-gray-700">Content</Label>
                <Textarea 
                  {...form.register("content")} 
                  className="bg-white/50 border-gray-200 text-gray-900 min-h-[100px] placeholder:text-gray-400"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-gray-700">Location</Label>
                <Input 
                  {...form.register("location")} 
                  className="bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirmation(true)}
                className="bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700"
              >
                Delete Entry
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:opacity-90"
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