"use client";

import { useState } from "react";
import Gallery from "./components/Gallery";
import AddEntryModal from "./components/AddEntryModal";
import BookView from "./components/BookView";
import { Button } from "@/components/ui/button";
import { Home, Book } from "lucide-react";
import Link from "next/link";

export default function ScrapbookPage() {
  const [showBookView, setShowBookView] = useState(false);

  return (
    <div className="relative min-h-screen bg-background p-4">
      {/* Main Gallery */}
      <Gallery />
      <p className="text-background">I</p>
      <p className="text-background">Love</p>
      <p className="text-background">You</p>

      {/* Full-width Floating Nav */}
      <nav className="fixed bottom-4 left-4 right-4">
        <div className="bg-card/25 backdrop-blur-lg rounded-xl p-4 shadow-lg border">
          <div className="flex items-center justify-between space-x-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="rounded-xl">
                <Home />
              </Button>
            </Link>
            <Button
              onClick={() => setShowBookView(true)}
              variant="ghost"
              className="flex-1 rounded-xl bg-accent/30 border border-border border-opacity-5"
            >
              <Book className="h-6 w-6" />
              Scrapbook
            </Button>
            {/* The AddEntryModal includes its own DialogTrigger internally */}
            <AddEntryModal />
          </div>
        </div>
      </nav>

      {/* Overlay for BookView */}
      {showBookView && <BookView onClose={() => setShowBookView(false)} />}
    </div>
  );
}
