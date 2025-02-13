"use client";

import { useEffect, useState } from "react";
import EntryCard from "./EntryCard";

// Sample data for demonstration; later, fetch from Supabase
const sampleEntries = [
  {
    id: "1",
    title: "Our First Date",
    content: "We had a magical time at the park.",
    entry_date: "2022-05-10",
    image_url: "https://via.placeholder.com/300",
    tags: ["romantic", "first-date"],
  },
  {
    id: "2",
    title: "Beach Day",
    content: "Spent a sunny day at the beach laughing and swimming.",
    entry_date: "2022-06-15",
    image_url: "https://via.placeholder.com/300",
    tags: ["fun", "sunny"],
  },
  // ... more entries
];

export default function Gallery() {
  const [entries, setEntries] = useState(sampleEntries);

  // Placeholder for infinite scroll (to be implemented)
  useEffect(() => {
    // Logic for dynamic loading goes here.
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
