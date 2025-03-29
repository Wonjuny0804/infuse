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
}

export default GmailService;
