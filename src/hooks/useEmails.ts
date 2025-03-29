import { useInfiniteQuery } from "@tanstack/react-query";
import { UnifiedEmailListResponse } from "@/types/email";

export function useEmails() {
  const fetchEmailsPage = async ({ pageParam = "" }) => {
    const response = await fetch(`/api/emails/list?cursor=${pageParam}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch emails");
    }

    const data: UnifiedEmailListResponse = await response.json();

    return {
      emails: data.emails || [],
      nextCursor: data.nextCursor,
      error: data.error,
    };
  };

  return useInfiniteQuery({
    queryKey: ["emails"] as const,
    queryFn: fetchEmailsPage,
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      emails: data.pages.flatMap((page) => page.emails),
    }),
  });
}
