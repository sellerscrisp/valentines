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
import { CalendarIcon } from "lucide-react";

// Extend the schema to include an image field.
// Using z.any() because file inputs return a FileList; you can add refinement if needed.
const entrySchema = z.object({
    title: z.string().optional(),
    content: z.string().min(5, "Memory is too short!"),
    // We'll store the date as a string (ISO format)
    entry_date: z.string(),
    tags: z.string().optional(),
    image: z.any().optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface AddEntrySheetProps {
    onClose: () => void;
}

export default function AddEntrySheet({ onClose }: AddEntrySheetProps) {
    const form = useForm<EntryFormData>({
        resolver: zodResolver(entrySchema),
        defaultValues: {
            title: "",
            content: "",
            entry_date: "",
            tags: "",
            image: undefined,
        },
    });

    const onSubmit = (data: EntryFormData) => {
        // TODO: Process the file (data.image) if present, then call your API route to insert a new entry in Supabase.
        console.log("Submitting entry:", data);
        onClose();
    };

    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent side="bottom">
                <SheetHeader>
                    <SheetTitle className="p-8 text-xl">Add Scrapbook Entry</SheetTitle>
                </SheetHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <label className="block text-sm font-medium">Tags</label>
                        <Input {...form.register("tags")} placeholder="romantic, fun, travel" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Picture</label>
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
