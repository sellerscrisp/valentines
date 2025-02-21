"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, LoaderPinwheel } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { mutate } from "swr";
import { entrySchema, EntryFormData } from "@/types/form";
import { useSession } from "next-auth/react";
import { ImagePreview } from "./components/ImagePreview";

export default function AddEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultPoster = session?.user?.email?.includes("sellers") ? "sellers" : "abby";

  const form = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      content: "",
      entry_date: "",
      location: "",
      poster: defaultPoster,
      image: undefined,
    },
  });

  const onSubmit = async (data: EntryFormData) => {
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        const filePath = `entries/${Date.now()}-${file.name}`;

        // Upload image with timeout handling
        const uploadPromise = supabase.storage
          .from("scrapbook")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
          });

        const { error: uploadError } = await Promise.race([
          uploadPromise,
          new Promise<{ error: Error }>((_, reject) =>
            setTimeout(() => reject({ error: new Error("Upload timed out") }), 30000)
          )
        ]);

        if (uploadError) {
          throw new Error(`Upload Error: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("scrapbook")
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      // Insert entry with timeout handling
      const insertPromise = supabase.from("scrapbook_entries").insert([
        {
          title: data.title,
          content: data.content,
          entry_date: data.entry_date,
          image_url: imageUrl,
          location: data.location,
          poster: data.poster,
          submitted_by: null,
        },
      ]);

      const { error: insertError } = await Promise.race([
        insertPromise,
        new Promise<{ error: Error }>((_, reject) =>
          setTimeout(() => reject({ error: new Error("Database insertion timed out") }), 10000)
        )
      ]);

      if (insertError) {
        throw new Error(`Database Error: ${insertError.message}`);
      }

      toast({
        title: "Success",
        description: "Your scrapbook entry was added successfully.",
      });

      mutate("scrapbookEntries");
      router.push("/scrapbook");

    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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
                  ? `${form.watch("image").length} file(s) selected` 
                  : "No file chosen"}
              </span>
            </div>
            <ImagePreview
              files={form.watch("image")}
              onRemove={(index) => {
                const currentFiles = form.watch("image");
                if (!currentFiles) return;
                
                const dataTransfer = new DataTransfer();
                Array.from(currentFiles)
                  .filter((_, i) => i !== index)
                  .forEach(file => dataTransfer.items.add(file as File));
                
                form.setValue("image", dataTransfer.files);
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
                  <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
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
