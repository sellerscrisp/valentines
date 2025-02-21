"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, CalendarDays, CalendarClock, Users } from "lucide-react";
import type { SortOption, SortDropdownProps } from "@/types/sort";

export default function SortDropdown({ sortOption, onSortChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: "dateAdded", label: "Date Added", icon: <CalendarDays className="mr-2 h-4 w-4" /> },
    { value: "entryDate", label: "Entry Date", icon: <CalendarClock className="mr-2 h-4 w-4" /> },
    { value: "poster", label: "Poster", icon: <Users className="mr-2 h-4 w-4" /> },
  ];

  const handleSort = (option: SortOption) => {
    onSortChange(option);
    setIsOpen(false);
    console.log(`Sorting by: ${option}`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="default" className="w-[200px] justify-between">
          <span className="flex items-center">
            {sortOptions.find((opt) => opt.value === sortOption)?.icon}
            {sortOptions.find((opt) => opt.value === sortOption)?.label}
          </span>
          {isOpen ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {sortOptions.map((option) => (
          <DropdownMenuItem 
            key={option.value} 
            onSelect={() => handleSort(option.value)} 
            className="flex items-center"
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
