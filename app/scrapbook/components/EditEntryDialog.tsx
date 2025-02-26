"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDateForForm } from "@/lib/date";
import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/lib/supabaseClient";
import { mutate } from "swr";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";
// import { CalendarIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface EditEntryDialogProps {
  entry: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  title: string;
  content: string;
  entry_date: string;
  location: string;
  image?: FileList;
}

export function EditEntryDialog({ entry, open, onOpenChange }: EditEntryDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      title: entry.title || "",
      content: entry.content || "",
      entry_date: entry.entry_date || "",
      location: entry.location || "",
      image: undefined,
    },
  });

  console.log('Form state:', form.formState);

  const handleSubmit = async (values: FormValues) => {
    console.log('Form submitted with values:', values);
    setIsSubmitting(true);
    try {
      let images = [...(entry.images || [])];

      if (values.image && values.image.length > 0) {
        console.log('New images to upload:', values.image);
        // Upload new images
        const uploadPromises = Array.from(values.image as unknown as File[]).map(async (file, index) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('path', 'entries');

          console.log('Uploading file:', file.name);
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            console.error('Upload failed response:', response);
            throw new Error('Upload failed');
          }

          const result = await response.json() as { url: string };
          console.log('Upload success:', result);
          return {
            url: result.url,
            order: images.length + index
          };
        });

        const newImages = await Promise.all(uploadPromises);
        console.log('New images uploaded:', newImages);
        images = [...images, ...newImages];
      }

      // Use the API endpoint instead of direct Supabase call
      const response = await fetch('/api/entries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: entry.id,
          title: values.title,
          content: values.content,
          entry_date: formatDateForForm(values.entry_date),
          images,
          location: values.location,
        }),
      });

      if (!response.ok) {
        const error = await response.json() as { message: string };
        throw new Error(error.message || 'Failed to update entry');
      }

      toast({
        title: "Success!",
        description: "Entry updated successfully",
      });

      mutate("scrapbookEntries");
      onOpenChange(false);
    } catch (error) {
      console.error('Submit error:', error);
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
      // Delete all images from Cloudflare R2
      if (entry.images?.length) {
        const deletePromises = entry.images.map(async (image: any) => {
          // Extract the path from the URL
          const filePath = image.url.split(process.env.CLOUDFLARE_URL + '/').pop();
          
          if (filePath) {
            try {
              await fetch('/api/upload', {
                method: 'DELETE',
                body: JSON.stringify({ filePath }),
                headers: {
                  'Content-Type': 'application/json',
                }
              });
            } catch (error) {
              console.error(`Failed to delete image ${filePath}:`, error);
            }
          }
        });
        await Promise.all(deletePromises);
      }

      // Use the API endpoint instead of direct Supabase call
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error || 'Failed to delete entry');
      }

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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form 
              onSubmit={(e) => {
                console.log('Form submit event triggered');
                form.handleSubmit(handleSubmit)(e);
              }} 
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="A memorable moment" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memory</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Tell your story..." />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City, Country" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value), "PPP") : "Choose a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString() || "")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </FormItem>
                )}
              /> */}

              <div className="flex justify-between pt-3">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                </div>
                <Button type="submit" disabled={isSubmitting} variant="secondary">
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Pencil className="mr-1 h-3 w-3" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete &quot;{entry.title}&quot; and all associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 