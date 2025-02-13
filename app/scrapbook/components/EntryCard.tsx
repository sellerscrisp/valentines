"use client";

import { Card } from "@/components/ui/card";

interface Entry {
  id: string;
  title?: string;
  content: string;
  entry_date: string;
  image_url?: string;
  tags?: string[];
}

interface EntryCardProps {
  entry: Entry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  return (
    <Card className="p-4">
      {entry.image_url && (
        <img
          src={entry.image_url}
          alt={entry.title || "Scrapbook entry"}
          className="w-full h-40 object-cover rounded"
        />
      )}
      <h3 className="text-lg font-bold mt-2">{entry.title}</h3>
      <p className="text-sm text-gray-600">{entry.entry_date}</p>
      <p className="mt-2 text-gray-800">{entry.content}</p>
    </Card>
  );
}
