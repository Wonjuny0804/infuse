import { useMutation } from "@tanstack/react-query";

interface ReplyEmailParams {
  email: string; // recipient email
  subject: string;
  message: string;
  accountId: string; // email account ID to send from
  emailId?: string; // optional original email ID being replied to
  provider?: string; // optional email provider (gmail, outlook, etc)
  cc?: string; // optional cc recipients
  bcc?: string; // optional bcc recipients
  isHtml?: boolean; // whether the message is HTML
}

const useReplyToMail = () => {
  return useMutation({
    mutationFn: async ({
      email,
      subject,
      message,
      accountId,
      emailId,
      provider,
      cc,
      bcc,
    }: ReplyEmailParams) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/emails/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            subject,
            message,
            accountId,
            emailId,
            provider,
            cc,
            bcc,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      return response.json();
    },
  });
};

export default useReplyToMail;
