"use client";

import { useState } from "react";
import Gallery from "./components/Gallery";
import AddEntrySheet from "./components/AddEntrySheet";
import BookView from "./components/BookView";
import { Button } from "@/components/ui/button";
import { BookHeart, CirclePlus, House } from "lucide-react";
import Link from "next/link";

export default function ScrapbookPage() {
    const [showAddEntry, setShowAddEntry] = useState(false);
    const [showBookView, setShowBookView] = useState(false);

    return (
        <div className="relative min-h-screen bg-romanticPink p-4">
            {/* Main Gallery */}
            <Gallery />

            {/* Sticky Floating Buttons */}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <Link href="/">
                    <Button variant="ghost">
                        <House />
                    </Button>
                </Link>
                <Button onClick={() => setShowBookView(true)} variant="outline">
                    <BookHeart />
                    View Scrapbook
                </Button>
                <Button onClick={() => setShowAddEntry(true)} variant="outline">
                    <CirclePlus />
                    Add Entry
                </Button>
            </div>

            {/* Overlay: Add Entry Sheet */}
            {showAddEntry && <AddEntrySheet onClose={() => setShowAddEntry(false)} />}

            {/* Overlay: Digital Book View */}
            {showBookView && <BookView onClose={() => setShowBookView(false)} />}
        </div>
    );
}
