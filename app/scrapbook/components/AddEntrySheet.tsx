"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
// import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { mutate } from "swr";
import { useToast } from "@/hooks/use-toast"

const entrySchema = z.object({
  title: z.string().optional(),
  content: z.string().min(5, "Memory is too short!"),
  entry_date: z.string(),
  location: z.string().optional(),
  poster: z.enum(["abby", "sellers"]),
  image: z.any().optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface AddEntrySheetProps {
  onClose: () => void;
}

export default function AddEntrySheet({ onClose }: AddEntrySheetProps) {
  const { toast } = useToast();
  const form = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      content: "",
      entry_date: "",
      location: "",
      poster: "abby",
      image: undefined,
    },
  });

  const onSubmit = async (data: EntryFormData) => {
    let imageUrl = null;
    if (data.image && data.image.length > 0) {
      const file = data.image[0];
      const filePath = `entries/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("scrapbook")
        .upload(filePath, file);
      if (uploadError) {
        console.error("Error uploading file:", uploadError.message);
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: uploadError.message,
        });
        return; // Exit early on upload error.
      } else {
        const { data: urlData } = supabase.storage
          .from("scrapbook")
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("scrapbook_entries").insert([
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

    if (error) {
      console.error("Error inserting entry:", error.message);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Scrapbook Entry Added",
        description: "Your scrapbook entry was added successfully.",
      });
      mutate("scrapbookEntries");
    }
    onClose();
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-full">
        <SheetHeader>
          <SheetTitle className="p-8 text-xl">Add Scrapbook Entry</SheetTitle>
          <SheetDescription>
            Share a memory with us. Fill out the details below.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-8 px-8">
          <div>
            <label className="block text-sm font-medium">Title (Optional)</label>
            <Input {...form.register("title")} placeholder="A memorable moment" />
          </div>
          <div>
            <label className="block text-sm font-medium">Memory</label>
            <Textarea {...form.register("content")} placeholder="Tell your story..." />
          </div>
          <div>
            <label className="block text-sm font-medium">Date</label>
            <Controller
              control={form.control}
              name="entry_date"
              render={({ field: { onChange, value } }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={value ? new Date(value) : undefined}
                      onSelect={(d) => onChange(d?.toISOString() || "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Location (Optional)</label>
            <Input {...form.register("location")} placeholder="City, Country" />
          </div>
          <div>
            <label className="block text-sm font-medium">Poster</label>
            <Controller
              control={form.control}
              name="poster"
              render={({ field: { value, onChange } }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-between">
                      {value === "abby" ? "Abby" : "Sellers"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <div className="flex flex-col">
                      <Button variant="ghost" onClick={() => onChange("abby")} className="justify-start">
                        Abby
                      </Button>
                      <Button variant="ghost" onClick={() => onChange("sellers")} className="justify-start">
                        Sellers
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Picture (Optional)</label>
            <Input type="file" {...form.register("image")} />
          </div>
          <SheetFooter className="grid grid-cols-2 gap-4">
            <SheetClose asChild>
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit">Add Entry</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
