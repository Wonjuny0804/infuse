import { Email } from "@/types/email";

export interface EmailList {
  emails: Email[];
  nextPageToken?: string;
}

export interface EmailContent {
  headers?: {
    from?: string;
    to?: string;
    cc?: string;
    date?: string;
  };
  html?: string;
  text?: string;
  attachments?: Array<{
    id: string;
    filename: string;
    size: number;
  }>;
}

export interface EmailService {
  // List emails with pagination
  listEmails: (params: {
    accountId: string;
    accessToken: string;
    pageToken?: string;
  }) => Promise<EmailList>;

  // Get single email content
  getEmail: (params: {
    emailId: string;
    accountId: string;
    accessToken: string;
  }) => Promise<EmailContent>;

  // Update email read/unread status
  updateReadStatus: (params: {
    emailId: string;
    accountId: string;
    isUnread: boolean;
    accessToken: string;
  }) => Promise<void>;

  // Add other email operations here as needed
  // fetchEmails: (params) => Promise<EmailList>;
  // fetchEmailContent: (params) => Promise<EmailContent>;
  // etc.
}

export interface EmailServiceConfig {
  type: "gmail" | "outlook" | "other"; // Add more providers as needed
  accessToken: string;
}
