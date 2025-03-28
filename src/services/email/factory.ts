import { EmailService } from "./types";
import GmailService from "./gmail";
import YahooService from "./yahoo";
import OutlookService from "./outlook";

export function createEmailService({
  type,
  accessToken,
  accountId,
}: {
  type: string;
  accessToken: string;
  accountId: string;
}): EmailService {
  switch (type.toLowerCase()) {
    case "gmail":
      return new GmailService(accessToken, accountId);
    case "yahoo":
      return new YahooService(accessToken, accountId);
    case "outlook":
      return new OutlookService(accessToken, accountId);
    // case 'outlook':
    //   return new OutlookService();
    default:
      throw new Error(`Unsupported email provider: ${type}`);
  }
}
