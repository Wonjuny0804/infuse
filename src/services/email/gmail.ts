import { EmailList, EmailContent } from "./types";
import { refreshGmailToken } from "@/lib/auth/refreshToken";
import EmailService from "./abstract";

class GmailService extends EmailService {
  constructor(accessToken: string, accountId: string) {
    super(accessToken, accountId);
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const newToken = await refreshGmailToken(this.accountId);
      if (!newToken) {
        throw new Error("Failed to refresh token");
      }
      return newToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }

  async listEmails({
    pageToken,
    isRetry = false,
  }: {
    pageToken?: string;
    isRetry?: boolean;
  }): Promise<EmailList> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/list${
          pageToken ? `?pageToken=${pageToken}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "X-Account-Id": this.accountId,
          },
        }
      );

      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshAccessToken();
        this.accessToken = newToken;
        return this.listEmails({
          pageToken,
          isRetry: true,
        });
      }

      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }

      return response.json();
    } catch (error) {
      console.error("Error in listEmails:", error);
      throw error;
    }
  }

  async getEmail({
    emailId,
    isRetry = false,
  }: {
    emailId: string;
    isRetry?: boolean;
  }): Promise<EmailContent> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/messages/${emailId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "X-Account-Id": this.accountId,
          },
        }
      );

      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshAccessToken();
        this.accessToken = newToken;
        return this.getEmail({
          emailId,
          isRetry: true,
        });
      }

      if (!response.ok) {
        throw new Error("Failed to fetch email content");
      }

      // data has data.html and data.text
      const data = await response.json();

      // Transform the content array into html/text content
      const html = data.html;
      const text = data.text;

      return {
        headers: data.headers,
        html: html || undefined,
        text: text || undefined,
        attachments: data.attachments,
        labelIds: data.labelIds,
      };
    } catch (error) {
      console.error("Error in getEmail:", error);
      throw error;
    }
  }

  async updateReadStatus({
    emailId,
    isUnread,
  }: {
    emailId: string;
    isUnread: boolean;
  }): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/messages/${emailId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
            "X-Account-Id": this.accountId,
          },
          body: JSON.stringify({ isUnread }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update email status");
      }
    } catch (error) {
      console.error("Error in updateReadStatus:", error);
      throw error;
    }
  }

  async replyToEmail({
    emailId,
    content,
    isHtml = true,
    attachments = [],
    isRetry = false,
    to,
    subject,
    cc,
    bcc,
  }: {
    emailId: string;
    content: string;
    isHtml?: boolean;
    attachments?: Array<{
      filename: string;
      content: Blob | string;
      contentType?: string;
    }>;
    isRetry?: boolean;
    to?: string;
    subject?: string;
    cc?: string;
    bcc?: string;
  }): Promise<void> {
    try {
      // Prepare form data if there are attachments
      let body;

      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("isHtml", String(isHtml));

        // Add recipient info to form data
        if (to) formData.append("to", to);
        if (subject) formData.append("subject", subject);
        if (cc) formData.append("cc", cc);
        if (bcc) formData.append("bcc", bcc);

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

        body = formData;
      } else {
        // No attachments, use JSON
        body = JSON.stringify({
          content,
          isHtml,
          to,
          subject,
          cc,
          bcc,
        });
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.accessToken}`,
        "X-Account-Id": this.accountId,
      };

      // Only set Content-Type for JSON requests
      if (attachments.length === 0) {
        headers["Content-Type"] = "application/json";
      }

      console.log("Sending Gmail reply request", {
        hasAttachments: attachments.length > 0,
        contentType:
          attachments.length === 0 ? "application/json" : "multipart/form-data",
        endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/messages/${emailId}/reply`,
      });

      // Send the request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/messages/${emailId}/reply`,
        {
          method: "POST",
          headers,
          body,
        }
      );

      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshAccessToken();
        this.accessToken = newToken;
        return this.replyToEmail({
          emailId,
          content,
          isHtml,
          attachments,
          isRetry: true,
          to,
          subject,
          cc,
          bcc,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gmail reply failed:", response.status, errorText);
        throw new Error(
          `Failed to reply to email: ${response.status} ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error in replyToEmail:", error);
      throw error;
    }
  }

  async sendEmail({
    to,
    subject,
    content,
    isHtml = true,
    attachments = [],
    cc,
    bcc,
    isRetry = false,
  }: {
    to: string;
    subject: string;
    content: string;
    isHtml?: boolean;
    attachments?: Array<{
      filename: string;
      content: Blob | string;
      contentType?: string;
    }>;
    cc?: string;
    bcc?: string;
    isRetry?: boolean;
  }): Promise<void> {
    try {
      // Prepare form data if there are attachments
      let body;

      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append("to", to);
        formData.append("subject", subject);
        formData.append("content", content);
        formData.append("isHtml", String(isHtml));

        // Add optional recipient info to form data
        if (cc) formData.append("cc", cc);
        if (bcc) formData.append("bcc", bcc);

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

        body = formData;
      } else {
        // No attachments, use JSON
        body = JSON.stringify({
          to,
          subject,
          content,
          isHtml,
          cc,
          bcc,
        });
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.accessToken}`,
        "X-Account-Id": this.accountId,
      };

      // Only set Content-Type for JSON requests
      if (attachments.length === 0) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/messages/send`,
        {
          method: "POST",
          headers,
          body,
        }
      );

      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshAccessToken();
        this.accessToken = newToken;
        return this.sendEmail({
          to,
          subject,
          content,
          isHtml,
          attachments,
          cc,
          bcc,
          isRetry: true,
        });
      }

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error in sendEmail:", error);
      throw error;
    }
  }
}

export default GmailService;
