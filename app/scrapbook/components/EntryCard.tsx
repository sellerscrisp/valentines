"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { MapPin, Download } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";

interface Entry {
  id: string;
  title?: string;
  content: string; // This will serve as the "story"
  entry_date: string;
  image_url?: string;
  location?: string;
  poster: string;
}

interface EntryCardProps {
  entry: Entry;
}

function shortenString(text: any, maxLength: number): string {
  if (typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export default function EntryCard({ entry }: EntryCardProps) {
  // Format the date in UTC so it doesn't shift relative to the stored date.
  const formattedDate = formatInTimeZone(
    new Date(entry.entry_date),
    "UTC",
    "PPP"
  );

  return (
    <Card className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      {/* Image Section */}
      <div className="relative aspect-[3/4]">
        {entry.image_url && entry.image_url.trim() !== "" ? (
          <Image
            src={entry.image_url}
            alt={entry.title || "Scrapbook entry image"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        {/* Location Overlay */}
        <div className="absolute top-3 left-3 bg-white rounded-full px-3 py-1 text-xs font-semibold text-gray-700 flex items-center space-x-1">
          <MapPin className="w-3 h-3" />
          <span>{shortenString(entry.location, 25) || ""}</span>
        </div>

        {/* Hover Save Button */}
        {entry.image_url && entry.image_url.trim() !== "" && (
          <Link
            href={entry.image_url}
            download
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-3 hidden group-hover:flex items-center space-x-1 bg-primary px-3 py-1 rounded-full shadow text-sm font-medium text-white"
          >
            <Download className="h-4 w-4" />
            <span>Save</span>
          </Link>
        )}
      </div>

      {/* Card Content */}
      <CardContent className="p-4">
        <CardTitle>
          <p className="text-sm text-gray-600 text-medium">
            {entry.title}
          </p>
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {entry.content}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt={entry.poster} />
              <AvatarFallback>
                {entry.poster ? entry.poster.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-gray-700">
              {entry.poster}
            </span>
          </div>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
