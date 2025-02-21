"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Download, Edit } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useSession } from "next-auth/react";
import { EditEntryDialog } from "./EditEntryDialog";
import { EntryCardProps } from "@/types/entry";

function shortenString(text: any, maxLength: number): string {
  if (typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export default function EntryCard({ entry }: EntryCardProps) {
  const { data: session } = useSession();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Mobile detection hook
  useEffect(() => {
    const checkIsMobile = () => {
      const mq = window.matchMedia("(hover: none)");
      setIsMobile(mq.matches);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleCardClick = () => {
    if (isMobile) {
      setShowActions(prev => !prev);
    }
  };

  // Format the date using UTC so the stored date is shown as entered.
  const formattedDate = formatInTimeZone(
    new Date(entry.entry_date),
    "UTC",
    "PPP"
  );

  // Action buttons component
  const ActionButtons = () => (
    <div className={`absolute bottom-3 right-3 flex gap-2 items-center
      ${isMobile ? (showActions ? 'flex' : 'hidden') : 'hidden group-hover:flex'}`}
    >
      {entry.image_url && entry.image_url.trim() !== "" && (
        <Link
          href={entry.image_url}
          download
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center space-x-1 bg-primary px-3 py-1 rounded-full shadow text-sm font-medium text-white"
        >
          <Download className="h-4 w-4" />
          <span>Save</span>
        </Link>
      )}
      {session?.user?.email && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 bg-primary px-3 py-1 rounded-full shadow text-sm font-medium text-white border-none"
          onClick={(e) => {
            e.stopPropagation();
            setEditDialogOpen(true);
          }}
        >
          <Edit className="h-4 w-4" />
          <span>Edit</span>
        </Button>
      )}
    </div>
  );

  return (
    <Card
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
    >
      {/* Image Section */}
      <div className="relative aspect-[3/4]">
        {entry.image_url && entry.image_url.trim() !== "" ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
            <Image
              src={entry.image_url}
              alt={entry.title || "Scrapbook entry image"}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoadingComplete={() => setImageLoading(false)}
              priority={false}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
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
        <ActionButtons />
      </div>

      {/* Card Content */}
      <CardContent className="p-4">
        <CardTitle>
          <p className="text-sm text-gray-600">{entry.title}</p>
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {entry.content}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt={entry.poster}
              />
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
      <EditEntryDialog 
        entry={entry}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </Card>
  );
}