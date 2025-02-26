import useSWR, { mutate, Fetcher } from "swr";

const fetcher: Fetcher<{ entries: any[] }, string> = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch entries");
  return response.json();
};

export function useEntries() {
  const { data, error } = useSWR("/api/entries", fetcher);

  const deleteEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      // Optimistically remove the entry from the local state
      mutate(
        "/api/entries",
        (data: { entries: any[] } | undefined) => ({
          ...data,
          entries: data?.entries?.filter((entry) => entry.id !== entryId) || [],
        }),
        false
      );
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  };

  return {
    entries: data?.entries || [],
    isLoading: !error && !data,
    error,
    deleteEntry,
  };
} 