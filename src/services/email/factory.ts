import { EmailService, EmailServiceConfig } from "./types";
import GmailService from "./gmail";

export function createEmailService(config: EmailServiceConfig): EmailService {
  switch (config.type) {
    case "gmail":
      return new GmailService();
    // case 'outlook':
    //   return new OutlookService();
    default:
      throw new Error(`Unsupported email service type: ${config.type}`);
  }
}
