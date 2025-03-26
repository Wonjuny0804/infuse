export interface Email {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  isUnread: boolean;
  onReadStateChange?: (emailId: string, isUnread: boolean) => void;
}

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
}
