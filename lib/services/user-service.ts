import { supabase } from "@/lib/supabaseClient";
// import { uploadToCloudflare } from "@/lib/cloudflareClient";

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, data: {
  name?: string | null;
  avatar_url?: string | null;
}) {
  const { error } = await supabase
    .from("users")
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/user/avatar', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || 'Failed to upload avatar');
  }

  const data = await response.json() as { url: string };
  return data.url;
} 