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

interface ImagePreviewProps {
  files: FileList | null;
  onRemove: (index: number) => void;
  onReorder: (files: FileList) => void;
}

interface SortableImageProps {
  url: string;
  index: number;
  onRemove: () => void;
}

function SortableImage({ url, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
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
          className="object-cover rounded-lg"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ImagePreview({ files, onRemove, onReorder }: ImagePreviewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Array.from(files!).findIndex(
      (_, i) => URL.createObjectURL(files![i]) === active.id
    );
    const newIndex = Array.from(files!).findIndex(
      (_, i) => URL.createObjectURL(files![i]) === over.id
    );

    const newFiles = arrayMove(Array.from(files as ArrayLike<File>), oldIndex, newIndex);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    onReorder(dataTransfer.files);
  };

  if (!files || files.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={Array.from(files).map(file => URL.createObjectURL(file))}
        strategy={rectSortingStrategy}
      >
        <div className="flex gap-4 mt-4 flex-wrap">
          {Array.from(files).map((file, index) => (
            <SortableImage
              key={URL.createObjectURL(file)}
              url={URL.createObjectURL(file)}
              index={index}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 