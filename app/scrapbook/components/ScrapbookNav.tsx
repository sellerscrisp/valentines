"use client";

import { Button } from "@/components/ui/button";
import { Home, Book, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ScrapbookNavProps {
  onShowBook: () => void;
}

export function ScrapbookNav({ onShowBook }: ScrapbookNavProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <nav className={`${isMobile ? 'fixed bottom-4' : 'fixed top-4'} left-4 right-4 z-10`}>
      <div className="bg-card/25 backdrop-blur-lg rounded-xl p-4 shadow-lg border">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            onClick={onShowBook}
            variant="ghost"
            className="rounded-xl bg-accent/30 border border-border border-opacity-5"
          >
            <Book className="h-6 w-6 mr-2" />
            Scrapbook
          </Button>
          <Link href="/scrapbook/add">
            <Button variant="ghost" className="w-full rounded-xl bg-accent/30 border border-border border-opacity-5">
              <PlusCircle className="h-6 w-6 mr-2" />
              Entry
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
} 