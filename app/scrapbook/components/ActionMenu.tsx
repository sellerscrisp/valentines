"use client";

import ScaleIn from "@/components/animations/scale-in";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal, Download, Edit } from "lucide-react";
import { useSession } from "next-auth/react";

interface ActionMenuProps {
  hasImages: boolean;
  currentImageUrl?: string;
  onEdit: () => void;
}

export function ActionMenu({ hasImages, currentImageUrl, onEdit }: ActionMenuProps) {
  const { data: session } = useSession();

  return (
    <div className="absolute top-2 right-2 z-20">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 active:bg-black/60 border-none shadow-lg"
          >
            <MoreHorizontal className="h-4 w-4 text-white" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-fit bg-transparent border-none p-0 shadow-none"
          align="end"
          sideOffset={4}
        >
          <div className="flex flex-col gap-1">
            {hasImages && currentImageUrl && (
              <ScaleIn delay={0.1}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-primary/60 hover:bg-black/40 border-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(currentImageUrl, '_blank');
                  }}
                >
                  <Download className="h-4 w-4 text-white" />
                </Button>
              </ScaleIn>
            )}
            {session?.user?.email && (
              <ScaleIn delay={0.2}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-slate-600/60 hover:bg-black/40 border-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit className="h-4 w-4 text-white" />
                </Button>
              </ScaleIn>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 