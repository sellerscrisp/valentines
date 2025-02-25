import useSWR from "swr";

async function fetchAvatar(email: string) {
  const res = await fetch(`/api/user/avatar?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to fetch avatar");
  return (await res.json() as { avatarUrl: string | null }).avatarUrl;
}

export function useAvatar(email: string | undefined) {
  const key = email ? `avatar-${email}` : null;
  
  return useSWR(
    key,
    async () => {
      if (!email) return null;
      return fetchAvatar(email);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );
} 