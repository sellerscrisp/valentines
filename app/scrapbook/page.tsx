"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Gallery from "./components/Gallery";
import BookView from "./components/BookView";
import { AuthModal } from "@/components/auth-modal";
import { ScrapbookNav } from "./components/ScrapbookNav";

export default function ScrapbookPage() {
  const { data: session, status } = useSession();
  const [showBookView, setShowBookView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    // If no session exists, show the login modal.
    return <AuthModal />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <ScrapbookNav onShowBook={() => setShowBookView(true)} />
      <div className={`p-4 ${!isMobile ? 'mt-24' : ''}`}>
        <Gallery />
      </div>
      
      <p className="bg-background">mo</p>
      <p className="bg-background">moo</p>
      <p className="bg-background">mooo</p>

      {/* Overlay for BookView */}
      {showBookView && <BookView onClose={() => setShowBookView(false)} />}
    </div>
  );
}
