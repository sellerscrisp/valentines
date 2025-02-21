import { z } from 'zod';

export const entrySchema = z.object({
  title: z.string().optional(),
  content: z.string().min(5, "Memory is too short!"),
  entry_date: z.string(),
  location: z.string().optional(),
  poster: z.enum(["abby", "sellers"]),
  image: z.any().optional(),
});

export type EntryFormData = z.infer<typeof entrySchema>;

export interface ImageData {
  url: string;
  order: number;
}

export interface Entry {
  id: string;
  title?: string;
  content: string;
  entry_date: string;
  date_added: string;
  images: ImageData[];
  location?: string;
  poster: string;
} 