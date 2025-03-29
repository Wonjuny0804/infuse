// this is used for the emails list, which will probably contain only the metadata of the email.
export interface Email {
  id: string;
  subject: string;
  from: string;
  sender: string;
  senderEmail: string;
  snippet: string;
  date: string;
  isUnread: boolean;
  onReadStateChange?: (emailId: string, isUnread: boolean) => void;
  provider: string;
  read: boolean;
  preview: string;
  accountId: string;
}

// this is used for the email content, which will contain the full email content.
export interface EmailContent {
  html?: string;
  text?: string;
  headers?: {
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    date: string;
  };
  attachments?: Array<{
    id: string;
    filename: string;
    contentType: string;
    size: number;
  }>;
  threadId?: string;
  labelIds?: string[];
}

export interface InfiniteEmailsResponse {
  pages: Array<{
    emails: Email[];
    nextPageToken?: string;
  }>;
  pageParams: unknown[];
}

export interface EmailAccount {
  id: string;
  provider: string;
  email_address: string;
  oauth_token: string;
  created_at: string;
  imap_settings: string | null;
  refresh_token: string;
  token_expires_at: string;
  user_id: string;
}

export interface EmailMessage {
  id: string;
  provider: string;
  subject: string;
  from: string;
  to: string[];
  body: string;
  date: Date;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

export type EmailProvider = "gmail" | "outlook" | "yahoo" | "naver" | "other";

export interface UnifiedEmailListResponse {
  provider: string;
  emails: Email[];
  nextCursor?: string;
  error?: {
    provider: string;
    message: string;
  }[];
}

export interface EmailList {
  emails?: Email[];
  messages?: Email[];
  nextCursor?: string;
}
