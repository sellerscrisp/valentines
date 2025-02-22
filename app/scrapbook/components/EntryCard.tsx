"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Download, Edit, MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { EditEntryDialog } from "./EditEntryDialog";
import { EntryCardProps } from "@/types/entry";
import { EntryCardGallery } from "./EntryCardGallery";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateForDisplay } from "@/lib/date";
import { CommentsDrawer } from "./comments/CommentsDrawer";

function shortenString(text: any, maxLength: number): string {
  if (typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export default function EntryCard({ entry }: EntryCardProps) {
  const { data: session } = useSession();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Format the date using UTC so the stored date is shown as entered.
  const formattedDate = formatDateForDisplay(entry.entry_date);

  const ActionMenu = ({ currentImageIndex }: { currentImageIndex: number }) => (
    <div className="absolute top-2 right-2 z-30">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-xl bg-black/20 hover:bg-black/40">
            <MoreHorizontal className="h-5 w-5 text-white" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-50 bg-black/20 backdrop-blur-lg border-none rounded-xl shadow-lg" align="end" alignOffset={0} sideOffset={8}>
          {(entry.images?.length ?? 0) > 0 && (
            <Button
              variant="default"
              className="w-full justify-start"
              onClick={(e) => {
                e.stopPropagation();
                window.open(entry.images?.[currentImageIndex]?.url, '_blank');
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Save Image
            </Button>
          )}
          {session?.user?.email && (
            <Button
              variant="secondary"
              className="w-full justify-start mt-2 backdrop-blur-lg"
              onClick={(e) => {
                e.stopPropagation();
                setEditDialogOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Entry
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Card
      className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out h-full"
    >
      {/* Image Section - Make sure this div takes up the correct space */}
      <div className="relative w-full aspect-[3/4]">
        <EntryCardGallery
          images={entry.images || []}
          onCurrentIndexChange={setCurrentImageIndex}
        />

        {/* Location Overlay */}
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-700 flex items-center space-x-1">
          <MapPin className="w-3 h-3" />
          <span>{shortenString(entry.location, 25) || ""}</span>
        </div>
        <ActionMenu currentImageIndex={currentImageIndex} />
      </div>

      {/* Card Content */}
      <CardContent className="p-4">
        <h1 className="text-md font-bold text-gray-600 mb-1 mt-2">{entry.title}</h1>


        {/* Memory content with expand/collapse */}
        <div className="relative">
          <p className={`text-sm text-gray-600 ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {entry.content}
          </p>
          {entry.content.length > 100 && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              more
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
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

        {/* Comments section using Drawer */}
        <div className="mt-2">
          <CommentsDrawer entryId={entry.id} />
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