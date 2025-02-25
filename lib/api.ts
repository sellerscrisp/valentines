import { supabase } from "./supabaseClient";

export async function getEntriesByUserId(userId: string) {
  const { data: entries, error } = await supabase
    .from('scrapbook_entries')
    .select(`
      *,
      comments(*),
      image_url,
      images
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Log the first entry to see what we're getting
  if (entries?.[0]) {
    console.log('Sample entry images:', {
      image_url: entries[0].image_url,
      images: entries[0].images
    });
  }
  
  return entries;
} 