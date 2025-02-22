"use client";

import { useState } from "react";
import useSWR from "swr";
import EntryCard from "./EntryCard";
import { supabase } from "@/lib/supabaseClient";
import { SkeletonCard } from "./SkeletonCard";
import SortDropdown from "./SortDropdown";
import { SortOption } from "@/types/sort";
import { formatDateForForm } from "@/lib/date";

interface Entry {
  id: string;
  title?: string;
  content: string;
  entry_date: string;
  date_added: string;
  images?: { url: string; order: number }[];
  location?: string;
  poster: string;
}

// Fetcher function to get entries from Supabase.
const fetchEntries = async () => {
  const { data, error } = await supabase
    .from("scrapbook_entries")
    .select("*")
    .order("date_added", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export default function Gallery() {
  const { data, error } = useSWR("scrapbookEntries", fetchEntries);
  const [sortOption, setSortOption] = useState<SortOption>("dateAdded");

  if (error) return <p>Error loading entries: {error.message}</p>;
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    );
  }

  // Cast data to Entry array.
  const entries = data as Entry[];

  // Sort the entries based on the selected sort option.
  const sortedEntries = [...entries];
  if (sortOption === "dateAdded") {
    sortedEntries.sort(
      (a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime()
    );
  } else if (sortOption === "entryDate") {
    sortedEntries.sort(
      (a, b) => 
        new Date(formatDateForForm(b.entry_date)).getTime() - 
        new Date(formatDateForForm(a.entry_date)).getTime()
    );
  } else if (sortOption === "poster") {
    sortedEntries.sort((a, b) => a.poster.localeCompare(b.poster));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SortDropdown sortOption={sortOption} onSortChange={setSortOption} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
