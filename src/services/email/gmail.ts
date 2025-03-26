import { EmailService, EmailList, EmailContent } from "./types";
import { refreshGmailToken } from "@/utils/auth/refreshToken";

export default class GmailService implements EmailService {
  async refreshAccessToken(accountId: string): Promise<string> {
    try {
      const newToken = await refreshGmailToken(accountId);
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
    accountId,
    accessToken,
    pageToken,
    isRetry = false,
  }: {
    accountId: string;
    accessToken: string;
    pageToken?: string;
    isRetry?: boolean;
  }): Promise<EmailList> {
    try {
      const response = await fetch(
        `/api/gmail/list${pageToken ? `?pageToken=${pageToken}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Account-Id": accountId,
          },
        }
      );

      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshAccessToken(accountId);
        return this.listEmails({
          accountId,
          accessToken: newToken,
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
    accountId,
    accessToken,
    isRetry = false,
  }: {
    emailId: string;
    accountId: string;
    accessToken: string;
    isRetry?: boolean;
  }): Promise<EmailContent> {
    try {
      const response = await fetch(`/api/gmail/messages/${emailId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Account-Id": accountId,
        },
      });

      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshAccessToken(accountId);
        return this.getEmail({
          emailId,
          accountId,
          accessToken: newToken,
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
    accountId,
    isUnread,
    accessToken,
  }: {
    emailId: string;
    accountId: string;
    isUnread: boolean;
    accessToken: string;
  }): Promise<void> {
    try {
      const response = await fetch(`/api/gmail/messages/${emailId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Account-Id": accountId,
        },
        body: JSON.stringify({ isUnread }),
      });

      if (!response.ok) {
        throw new Error("Failed to update email status");
      }
    } catch (error) {
      console.error("Error in updateReadStatus:", error);
      throw error;
    }
  }
}
