"use client";

import { useState } from "react";
import useSWR from "swr";
import EntryCard from "./EntryCard";
import { SkeletonCard } from "./SkeletonCard";
import SortDropdown from "./SortDropdown";
import { SortOption } from "@/types/sort";
import { formatDateForForm } from "@/lib/date";
import { Entry } from "@/types/entry";

// Fetcher function to get entries from API
const fetchEntries = async () => {
  const res = await fetch('/api/entries');
  if (!res.ok) {
    throw new Error('Failed to fetch entries');
  }
  return res.json();
};

export default function Gallery() {
  const { data, error } = useSWR("scrapbookEntries", fetchEntries);
  const [sortOption, setSortOption] = useState<SortOption>("dateAdded");

  if (error) return <p>Error loading entries: {error.message}</p>;
  if (!data) {
    return (
      <div className="flex flex-col gap-4 px-4 md:px-0">
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    );
  }

  // Cast data to Entry array
  const entries = data as Entry[];

  // Sort the entries based on the selected sort option
  const sortedEntries = [...entries];
  if (sortOption === "dateAdded") {
    sortedEntries.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
    <div className="flex flex-col gap-4 w-9/10 mx-auto">
      <div className="flex flex-col gap-4">
        <div className="relative z-1 pt-6">
          <SortDropdown sortOption={sortOption} onSortChange={setSortOption} />
        </div>
        {sortedEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
