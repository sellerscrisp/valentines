"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, LoaderCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { mutate } from "swr";
import { useSession } from "next-auth/react";
import { ImagePreview } from "./components/ImagePreview";
import { formatDateForForm } from "@/lib/date";
// import { uploadToCloudflare } from "@/lib/cloudflareClient";

interface FormValues {
  title: string;
  content: string;
  entry_date: string;
  location: string;
  poster?: string;
  image?: FileList;
}

type ImageData = {
  url: string;
  order: number;
};

export default function AddEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultPoster = session?.user?.email?.includes("sellers") ? "sellers" : "abby";

  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      content: "",
      entry_date: "",
      location: "",
      poster: defaultPoster,
      image: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      let images: ImageData[] = [];
      
      if (data.image && data.image.length > 0) {
        // Upload all images in parallel
        const uploadPromises = Array.from(data.image as unknown as File[]).map(async (file, index) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('path', 'entries');

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const result = await response.json() as { url: string };
          return {
            url: result.url,
            order: index
          };
        });

        images = await Promise.all(uploadPromises);
      }

      const { error: insertError } = await supabase
        .from("scrapbook_entries")
        .insert([{
          title: data.title,
          content: data.content,
          entry_date: formatDateForForm(data.entry_date),
          images: images.map(img => ({
            url: img.url,
            order: img.order
          })),
          location: data.location,
          poster: data.poster || 'anonymous',
          date_added: new Date().toISOString(),
          user_id: session.user.id
        }])
        .select();

      if (insertError) {
        console.error("Insert Error:", insertError);
        throw insertError;
      }

      toast({
        title: "Success",
        description: "Entry added successfully",
      });
      
      mutate("scrapbookEntries");
      router.push("/scrapbook");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add entry",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-red-300 to-red-200 animate-gradient-xy p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold mb-4">Add Scrapbook Entry</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-1">
            <Label>Title</Label>
            <Input {...form.register("title")} placeholder="A memorable moment" />
          </div>

          <div className="grid gap-1">
            <Label>Memory</Label>
            <Textarea {...form.register("content")} placeholder="Tell your story..." />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="grid gap-1">
            <Label>Location</Label>
            <Input {...form.register("location")} placeholder="City, Country" />
          </div>

          <div className="grid gap-1">
            <Label>Date</Label>
            <Controller
              control={form.control}
              name="entry_date"
              render={({ field }) => (
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
              )}
            />
          </div>

          <div className="grid gap-1">
            <Label>Picture</Label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background">
              <Input
                type="file"
                accept="image/*"
                multiple
                {...form.register("image")}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md cursor-pointer text-sm font-medium"
              >
                Choose Files
              </label>
              <span className="text-muted-foreground text-sm">
                {form.watch("image")?.length 
                  ? `${form.watch("image")?.length} file(s) selected` 
                  : "No file chosen"}
              </span>
            </div>
            <ImagePreview
              files={form.watch("image") || null}
              onRemove={(index: number) => {
                const currentFiles = form.watch("image");
                if (!currentFiles) return;
                
                const dataTransfer = new DataTransfer();
                Array.from(currentFiles as FileList)
                  .filter((_, i) => i !== index)
                  .forEach(file => dataTransfer.items.add(file));
                
                form.setValue("image", dataTransfer.files);
              }}
              onReorder={(files) => {
                form.setValue("image", files);
              }}
            />
          </div>

          <div className="flex justify-between space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/scrapbook")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <span className="text-center text-pink-700/60 text-sm mt-2">
              posting as {defaultPoster}
            </span>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Entry"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
