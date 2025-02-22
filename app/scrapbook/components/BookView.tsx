"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatDateForDisplay } from "@/lib/date";

interface Entry {
  id: string;
  title?: string;
  content: string;
  entry_date: string;
  images?: { url: string; order: number }[];
  location?: string;
}

interface BookViewProps {
  onClose: () => void;
}

export default function BookView({ onClose }: BookViewProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch entries from Supabase on mount.
  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("scrapbook_entries")
        .select("*")
        .order("entry_date", { ascending: false });
      if (error) {
        console.error("Error fetching entries:", error);
      } else if (data) {
        setEntries(data as Entry[]);
      }
    };
    fetchEntries();
  }, []);

  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, entries.length - 1));
  const prevPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 0));

  if (entries.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <p className="text-white">Loading entries...</p>
      </div>
    );
  }

  const currentEntry = entries[currentPage];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative bg-white w-full h-full p-4 overflow-hidden">
        <motion.div
          key={currentEntry.id}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 h-full flex flex-col items-center justify-center"
        >
          {currentEntry.images?.[0]?.url && (
            <img
              src={currentEntry.images[0].url}
              alt={currentEntry.title || "Scrapbook entry image"}
              className="w-full h-1/2 object-cover rounded mb-4"
            />
          )}
          <h2 className="text-3xl font-bold mb-2">
            {currentEntry.title || "Untitled Memory"}
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            {formatDateForDisplay(currentEntry.entry_date)}{" "}
            {currentEntry.location && `- ${currentEntry.location}`}
          </p>
          <p className="text-lg text-center max-w-md">{currentEntry.content}</p>
        </motion.div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            <ArrowLeft />
          </Button>
          <Button onClick={onClose} variant="destructive">
            Close
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={currentPage === entries.length - 1}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}