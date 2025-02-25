"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, CalendarDays, CalendarClock, Users } from "lucide-react";

type SortOption = "dateAdded" | "entryDate" | "poster";

interface SortDropdownProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export default function SortDropdown({ sortOption, onSortChange }: SortDropdownProps) {
  const sortOptions = [
    { value: "dateAdded", label: "Date Added", icon: CalendarDays },
    { value: "entryDate", label: "Entry Date", icon: CalendarClock },
    { value: "poster", label: "Poster", icon: Users },
  ];

  const currentOption = sortOptions.find(option => option.value === sortOption);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[180px] justify-between bg-white"
        >
          <div className="flex items-center gap-2">
            {currentOption && <currentOption.icon className="h-4 w-4" />}
            <span>{currentOption?.label || "Sort by"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[180px] p-0" 
        align="end"
      >
        <div className="flex flex-col">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              className={`justify-start gap-2 rounded-none ${
                option.value === sortOption ? "bg-accent/50" : ""
              }`}
              onClick={() => onSortChange(option.value as SortOption)}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
