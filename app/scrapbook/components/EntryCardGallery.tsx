"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface EntryCardGalleryProps {
  images: { url: string; order: number; }[];
  onImageLoad?: () => void;
  onCurrentIndexChange?: (index: number) => void;
}

export function EntryCardGallery({ images, onImageLoad, onCurrentIndexChange }: EntryCardGalleryProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      const index = api.selectedScrollSnap();
      setCurrent(index);
      onCurrentIndexChange?.(index);
    });
  }, [api, onCurrentIndexChange]);

  if (!images?.length) {
    return (
      <div className="bg-gray-200 w-full aspect-[3/4] flex items-center justify-center">
        <span className="text-gray-500">No Image</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent className="h-full">
          {images.map((image, index) => (
            <CarouselItem key={index} className="aspect-[13/16] w-full">
              <div className="relative w-full h-full">
                <Image
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                  onLoad={onImageLoad}
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {count > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === current ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 