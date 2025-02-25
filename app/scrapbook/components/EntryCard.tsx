"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
// import { useSession } from "next-auth/react";
import { EditEntryDialog } from "./EditEntryDialog";
import { EntryCardProps } from "@/types/entry";
import { EntryCardGallery } from "./EntryCardGallery";
import { formatDateForDisplay } from "@/lib/date";
import { CommentsDrawer } from "./comments/CommentsDrawer";
// import { useAvatar } from "@/hooks/use-avatar";
import { ActionMenu } from "./ActionMenu";

function shortenString(text: any, maxLength: number): string {
  if (typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

function UserAvatar({ userId }: { userId: string }) {
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    fetch(`/api/user/avatar?userId=${userId}`)
      .then(res => res.json() as Promise<{ avatarUrl: string }>)
      .then(data => {
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      });
  }, [userId]);

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={avatarUrl} />
      <AvatarFallback>{userId[0]?.toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

export default function EntryCard({ entry }: EntryCardProps) {
  // const { data: session } = useSession();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Format the date using UTC so the stored date is shown as entered.
  const formattedDate = formatDateForDisplay(entry.entry_date);

  // Add avatar hook
  // const { data: avatarUrl } = useAvatar(entry.posterEmail);

  const formattedImages = Array.isArray(entry.images) && entry.images.length > 0
    ? entry.images.map(img => {
        if (typeof img === 'string') {
          return { url: img, order: 0 };
        }
        return img;
      })
    : [];

  return (
    <Card className="w-full border-x-0 border-t first:border-t-0 md:border md:rounded-lg md:mx-auto md:max-w-2xl">
      {/* Image Section - Make sure this div takes up the correct space */}
      <div className="relative w-full aspect-[3/4]">
        <EntryCardGallery
          images={formattedImages}
          onCurrentIndexChange={setCurrentImageIndex}
        />

        {/* Location Overlay */}
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-700 flex items-center space-x-1">
          <MapPin className="w-3 h-3" />
          <span>{shortenString(entry.location, 25) || ""}</span>
        </div>

        <ActionMenu 
          hasImages={formattedImages.length > 0}
          currentImageUrl={formattedImages[currentImageIndex]?.url}
          onEdit={() => setEditDialogOpen(true)}
        />
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
            <UserAvatar userId={entry.poster} />
            <span className="text-xs font-medium text-gray-700">
              {entry.poster}
            </span>
          </div>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>

        {/* Comments section using Drawer */}
        <div className="mt-2 right-0">
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