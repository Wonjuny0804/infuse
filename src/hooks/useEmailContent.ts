import { useQuery } from "@tanstack/react-query";
import { EmailContent } from "@/types/email";

const fetchEmailContent = async (accountId: string, emailId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/emails/${accountId}/${emailId}`
  );
  if (!res.ok) throw new Error("Failed to fetch email");
  return res.json(); // { email }
};

export const useEmailContent = (accountId: string, emailId: string) =>
  useQuery<EmailContent>({
    queryKey: ["email", accountId, emailId],
    queryFn: () => fetchEmailContent(accountId, emailId),
    enabled: !!emailId && !!accountId, // avoid fetch if email or accountId isn't available
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
