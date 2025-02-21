export type SortOption = "dateAdded" | "entryDate" | "poster";

export interface SortDropdownProps {
    sortOption: SortOption;
    onSortChange: (option: SortOption) => void;
  }