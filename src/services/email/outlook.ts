import { EmailList, EmailContent } from "./types";
import { refreshOutlookToken } from "@/lib/auth/refreshToken";
import EmailService from "./abstract";

export default class OutlookService extends EmailService {
  constructor(accessToken: string, accountId: string) {
    super(accessToken, accountId);
  }

  async refreshAccessToken(accountId: string): Promise<string> {
    try {
      const newToken = await refreshOutlookToken(accountId);
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
        `/api/outlook/list${pageToken ? `?pageToken=${pageToken}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "X-Account-Id": this.accountId,
          },
        }
      );

      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshAccessToken(this.accountId);
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
      const response = await fetch(`/api/outlook/messages/${emailId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "X-Account-Id": this.accountId,
        },
      });

      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshAccessToken(this.accountId);
        this.accessToken = newToken;
        return this.getEmail({
          emailId,
          isRetry: true,
        });
      }

      if (!response.ok) {
        throw new Error("Failed to fetch email content");
      }

      return response.json();
    } catch (error) {
      console.error("Error in getEmail:", error);
      throw error;
    }
  }

  async updateReadStatus({
    emailId,
    isUnread,
    isRetry = false,
  }: {
    emailId: string;
    isUnread: boolean;
    isRetry?: boolean;
  }): Promise<void> {
    try {
      const response = await fetch(`/api/outlook/messages/${emailId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "X-Account-Id": this.accountId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isUnread }),
      });

      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshAccessToken(this.accountId);
        this.accessToken = newToken;
        return this.updateReadStatus({
          emailId,
          isUnread,
          isRetry: true,
        });
      }

      if (!response.ok) {
        throw new Error("Failed to update read status");
      }
    } catch (error) {
      console.error("Error updating read status:", error);
      throw error;
    }
  }

  async replyToEmail({
    emailId,
    content,
    isHtml = false,
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
      // Implementation for Outlook email service
      // This would use Outlook specific APIs to send a reply

      // Use the parameters to construct appropriate reply
      console.log("Replying to email via Outlook", {
        emailId,
        to,
        cc,
        bcc,
        subject,
      });

      if (isRetry) {
        console.log("This is a retry attempt");
      }

      // Handle retry logic if token expired
      if (false /* check for auth error */ && !isRetry) {
        const newToken = await this.refreshAccessToken(this.accountId);
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

      // More implementation details...
    } catch (error) {
      console.error("Error in replyToEmail:", error);
      throw error;
    }
  }
}
