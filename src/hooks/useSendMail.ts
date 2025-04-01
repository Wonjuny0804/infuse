import { useMutation } from "@tanstack/react-query";

interface Attachment {
  filename: string;
  content: Blob | string;
  contentType?: string;
}

interface SendEmailParams {
  email: string; // recipient email
  subject: string;
  message: string;
  accountId: string; // email account ID to send from
  emailId?: string; // optional original email ID being replied to
  provider?: string; // optional email provider (gmail, outlook, etc)
  cc?: string; // optional cc recipients
  bcc?: string; // optional bcc recipients
  isHtml?: boolean; // whether the message is HTML
  attachments?: Attachment[]; // optional attachments
}

const useSendMail = () => {
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
      isHtml,
      attachments = [],
    }: SendEmailParams) => {
      // If we have attachments, use FormData to send multipart request
      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("subject", subject);
        formData.append("message", message);
        formData.append("accountId", accountId);
        if (emailId) formData.append("emailId", emailId);
        if (provider) formData.append("provider", provider);
        if (cc) formData.append("cc", cc);
        if (bcc) formData.append("bcc", bcc);
        if (isHtml !== undefined) formData.append("isHtml", String(isHtml));

        // Append attachments
        attachments.forEach((attachment, index) => {
          if (attachment.content instanceof Blob) {
            formData.append(
              `attachment_${index}`,
              attachment.content,
              attachment.filename
            );
          } else {
            // Handle string content (base64 or other)
            const blob = new Blob([attachment.content], {
              type: attachment.contentType || "application/octet-stream",
            });
            formData.append(`attachment_${index}`, blob, attachment.filename);
          }

          formData.append(`attachment_${index}_filename`, attachment.filename);
          if (attachment.contentType) {
            formData.append(
              `attachment_${index}_contentType`,
              attachment.contentType
            );
          }
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/emails/send`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to send email");
        }

        return response.json();
      } else {
        // No attachments, use regular JSON request
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/emails/send`,
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
              isHtml,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to send email");
        }

        return response.json();
      }
    },
  });
};

export default useSendMail;
