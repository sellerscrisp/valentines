"use client";

import Image from "next/image";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useMemo } from "react";

interface Entry {
    id: string;
    title?: string;
    content: string;
    entry_date: string;
    image_url?: string;
    location?: string;
    poster: string;
}

interface EntryCardProps {
    entry: Entry;
}

export default function EntryCard({ entry }: EntryCardProps) {
    // Generate random values for likes, comments, and time.
    const randomLikes = useMemo(() => Math.floor(Math.random() * 4901) + 100, []);
    const randomComments = useMemo(() => Math.floor(Math.random() * 101), []);
    const randomTime = useMemo(() => {
        const hours = Math.floor(Math.random() * 24);
        return hours === 0 ? "Just now" : `${hours} HOURS AGO`;
    }, []);

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={entry.title || "User"} />
                        <AvatarFallback>{entry.title ? entry.title.charAt(0) : "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">{entry.poster || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{entry.location || "Unknown location"}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                {entry.image_url && entry.image_url.trim() !== "" && (
                    <Image
                        src={entry.image_url}
                        alt="Scrapbook entry image"
                        width={480}
                        height={480}
                        className="w-full h-auto"
                    />
                )}
            </CardContent>
            <CardFooter className="flex flex-col items-start p-4 space-y-3">
                <div className="flex justify-between items-center w-full">
                    <div className="flex space-x-4">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Heart className="h-6 w-6" />
                            <span className="sr-only">Like</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <MessageCircle className="h-6 w-6" />
                            <span className="sr-only">Comment</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Send className="h-6 w-6" />
                            <span className="sr-only">Share</span>
                        </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bookmark className="h-6 w-6" />
                        <span className="sr-only">Save</span>
                    </Button>
                </div>
                <p className="text-sm font-medium">{randomLikes.toLocaleString()} likes</p>
                <div className="text-sm">
                    <span className="font-medium">{entry.poster || "Anonymous"}</span> {entry.content}
                </div>
                <div className="text-sm text-muted-foreground">View all {randomComments} comments</div>
                <div className="text-xs text-muted-foreground">{randomTime}</div>
            </CardFooter>
        </Card>
    );
}
