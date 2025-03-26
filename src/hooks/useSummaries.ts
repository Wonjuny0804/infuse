import { useQuery } from "@tanstack/react-query";
import createClient from "@/lib/supabase/client";
import { EmailSummary } from "@/types/summary";

const useSummaries = () => {
  return useQuery({
    queryKey: ["emailSummaries"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // this point we use the serverside route to get the summaries
      const response = await fetch("/api/summaries/audio", {
        headers: {
          "X-User-Id": user?.id || "",
        },
      });

      if (!response.ok) {
        console.log("response", response);
        throw new Error("Failed to fetch summaries");
      }

      return response.json() as Promise<EmailSummary[]>;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
  });
};

export default useSummaries;
