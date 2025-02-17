"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronsUpDown, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { mutate } from "swr";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const entrySchema = z.object({
    title: z.string().optional(),
    content: z.string().min(5, "Memory is too short!"),
    entry_date: z.string(),
    location: z.string().optional(),
    poster: z.enum(["abby", "sellers"]),
    image: z.any().optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

export default function AddEntryModal() {
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
                return;
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
            form.reset();
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex-1 rounded-xl bg-accent/30 border border-border border-opacity-5"
                >
                    <Plus className="h-6 w-6" />Entry
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Scrapbook Entry</DialogTitle>
                    <DialogDescription>
                        Я тебя люблю)
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Title</label>
                        <Input {...form.register("title")} placeholder="A memorable moment" />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Memory</label>
                        <Textarea {...form.register("content")} placeholder="Tell your story..." />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Location</label>
                        <Input {...form.register("location")} placeholder="City, Country" />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Poster</label>
                        <Controller
                            control={form.control}
                            name="poster"
                            render={({ field: { value, onChange } }) => (
                                <RadioGroup
                                    value={value}
                                    onValueChange={onChange}
                                    className="flex items-center space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="abby" id="poster-abby" />
                                        <Label htmlFor="poster-abby">Abby</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="sellers" id="poster-sellers" />
                                        <Label htmlFor="poster-sellers">Sellers</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Date</label>
                        <Controller
                            control={form.control}
                            name="entry_date"
                            render={({ field: { onChange, value } }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-[240px] justify-start text-left">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {value ? format(new Date(value), "PPP") : "Choose a date"}
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
                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Picture</label>
                        <Input type="file" {...form.register("image")} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">Add Entry</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
