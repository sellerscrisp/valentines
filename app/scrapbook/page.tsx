"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Gallery from "./components/Gallery";
import BookView from "./components/BookView";
import { Button } from "@/components/ui/button";
import { Home, Book, PlusCircle } from "lucide-react";
import Link from "next/link";
import { AuthModal } from "@/components/auth-modal";

export default function ScrapbookPage() {
  const { data: session, status } = useSession();
  const [showBookView, setShowBookView] = useState(false);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    // If no session exists, show the login modal.
    return <AuthModal />;
  }

  return (
    <div className="relative min-h-screen bg-background p-4">
      {/* Main Gallery */}
      <Gallery />
      
      <p className="bg-background">mo</p>
      <p className="bg-background">moo</p>
      <p className="bg-background">mooo</p>

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
            <Link href="/scrapbook/add" className="flex-1">
              <Button variant="ghost" className="rounded-xl bg-accent/30 border border-border border-opacity-5">
                <PlusCircle className="h-6 w-6" />
                Entry
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Overlay for BookView */}
      {showBookView && <BookView onClose={() => setShowBookView(false)} />}
    </div>
  );
}
