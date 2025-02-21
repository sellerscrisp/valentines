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
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

export function EditEntryDialog({ entry, open, onOpenChange }: EditEntryDialogProps) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const form = useForm({
        defaultValues: {
            title: entry.title || "",
            content: entry.content,
            location: entry.location || "",
        },
    });

    const onSubmit = async (data: any) => {
        const { error } = await supabase
            .from("scrapbook_entries")
            .update({
                title: data.title,
                content: data.content,
                location: data.location,
            })
            .eq("id", entry.id);

        if (error) {
            console.error("Update error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update entry",
            });
        } else {
            toast({
                title: "Success",
                description: "Entry updated successfully",
            });
            mutate("scrapbookEntries");
            onOpenChange(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Delete image from storage if it exists
            if (entry.image_url) {
                const imagePath = entry.image_url.split('/').pop();
                if (imagePath) {
                    await supabase.storage
                        .from("scrapbook")
                        .remove([`entries/${imagePath}`]);
                }
            }

            // Delete entry from database
            const { error } = await supabase
                .from("scrapbook_entries")
                .delete()
                .eq("id", entry.id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Entry deleted successfully",
            });
            mutate("scrapbookEntries");
            onOpenChange(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete entry",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirmation(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Entry</DialogTitle>
                        <DialogDescription>
                            Make changes to your scrapbook entry here. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    {...form.register("title")}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right">
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    {...form.register("location")}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="content" className="text-right">
                                    Content
                                </Label>
                                <Textarea
                                    id="content"
                                    {...form.register("content")}
                                    className="col-span-3"
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter className="flex justify-between items-center gap-4 sm:gap-0">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                Save changes
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