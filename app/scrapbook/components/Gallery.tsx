// app/scrapbook/components/Gallery.tsx
"use client";

import { useEffect, useState } from "react";
import EntryCard from "./EntryCard";
import { supabase } from "@/lib/supabaseClient";
import { SkeletonCard } from "./SkeletonCard";

interface Entry {
  id: string;
  title?: string;
  content: string;
  entry_date: string;
  image_url?: string;
  location?: string;
}

export default function Gallery() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("scrapbook_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching entries:", error.message);
      } else if (data) {
        setEntries(data as Entry[]);
      }
      setLoading(false);
    };
    fetchEntries();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
