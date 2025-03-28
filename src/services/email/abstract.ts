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

  abstract refreshAccessToken(accountId: string): Promise<string>;
}

export default EmailService;
