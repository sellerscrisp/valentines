"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface ImagePreviewProps {
  files: FileList | null;
  onRemove: (index: number) => void;
  onReorder: (files: FileList) => void;
}

interface SortableImageProps {
  url: string;
  index: number;
  id: string;
  onRemove: () => void;
  isDragging: boolean;
}

function SortableImage({ url, index, id, onRemove, isDragging }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id,
    disabled: false 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="relative group">
      <div 
        ref={setNodeRef}
        style={style}
        className="relative touch-none"
        {...attributes}
        {...listeners}
      >
        <div className="relative w-24 h-24">
          <Image
            src={url}
            alt={`Preview ${index + 1}`}
            fill
            quality={50}
            sizes="96px"
            className="object-cover rounded-lg"
          />
        </div>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className={`absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 ${
          isDragging ? 'hidden' : ''
        }`}
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ImagePreview({ files, onRemove, onReorder }: ImagePreviewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Create stable IDs for the files
  const fileIds = Array.from(files || []).map((file, index) => `file-${index}`);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id || !files) return;

    const oldIndex = fileIds.indexOf(active.id as string);
    const newIndex = fileIds.indexOf(over.id as string);

    const newFiles = arrayMove(Array.from(files), oldIndex, newIndex);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    onReorder(dataTransfer.files);
  };

  if (!files || files.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fileIds}
        strategy={rectSortingStrategy}
      >
        <div className="flex gap-4 mt-4 flex-wrap">
          {Array.from(files).map((file, index) => (
            <SortableImage
              key={fileIds[index]}
              url={URL.createObjectURL(file)}
              index={index}
              id={fileIds[index]}
              onRemove={() => onRemove(index)}
              isDragging={isDragging}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 