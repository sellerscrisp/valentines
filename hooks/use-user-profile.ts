import useSWR from "swr";

export function useUserProfile() {
  const { data, error, mutate } = useSWR(
    "/api/user",
    async () => {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return res.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000 // Cache for 10 seconds
    }
  );

  return {
    profile: data,
    isLoading: !error && !data,
    error,
    mutate
  };
} 