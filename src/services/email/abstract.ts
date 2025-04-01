abstract class EmailService {
  accessToken: string;
  accountId: string;

  constructor(accessToken: string, accountId: string) {
    this.accessToken = accessToken;
    this.accountId = accountId;
  }

  abstract listEmails(params: { pageToken?: string }): Promise<unknown>;

  abstract getEmail(params: { emailId: string }): Promise<unknown>;

  abstract updateReadStatus(params: {
    emailId: string;
    isUnread: boolean;
  }): Promise<unknown>;

  abstract refreshAccessToken(): Promise<string>;

  abstract replyToEmail(params: {
    emailId: string;
    content: string;
    isHtml?: boolean;
    attachments?: Array<{
      filename: string;
      content: Blob | string;
      contentType?: string;
    }>;
    to?: string;
    subject?: string;
    cc?: string;
    bcc?: string;
    isRetry?: boolean;
  }): Promise<void>;

  abstract sendEmail(params: {
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
  }): Promise<void>;
}

export default EmailService;
