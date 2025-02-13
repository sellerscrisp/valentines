"use client";

import { useState } from "react";
import Gallery from "./components/Gallery";
import AddEntrySheet from "./components/AddEntrySheet";
import BookView from "./components/BookView";
import { Button } from "@/components/ui/button";

export default function ScrapbookPage() {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showBookView, setShowBookView] = useState(false);

  return (
    <div className="relative min-h-screen bg-romanticPink p-4">
      {/* Main Gallery */}
      <Gallery />

      {/* Sticky Floating Buttons */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <Button onClick={() => setShowBookView(true)} variant="secondary">
          View Scrapbook
        </Button>
        <Button onClick={() => setShowAddEntry(true)} variant="default">
          Add Photo/Entry
        </Button>
      </div>

      {/* Overlays */}
      {showAddEntry && <AddEntrySheet onClose={() => setShowAddEntry(false)} />}
      {showBookView && <BookView onClose={() => setShowBookView(false)} />}
    </div>
  );
}
