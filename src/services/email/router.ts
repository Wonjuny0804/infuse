import GmailService from "./gmail";
// import { getEmail as getNaverEmail } from './naver';
// import OutlookService from "./outlook";
import { getAccountById } from "../db/account";

const providerClassMap = {
  gmail: GmailService,
  //   naver: getNaverEmail,
  //   outlook: getOutlookEmail,
};

export async function emailContentRouter({
  accountId,
  emailId,
}: {
  accountId: string;
  emailId: string;
}) {
  const account = await getAccountById(accountId); // Includes provider + auth tokens
  const ServiceClass =
    providerClassMap[account.provider as keyof typeof providerClassMap];

  if (!ServiceClass)
    throw new Error(`Unsupported provider: ${account.provider}`);

  const accessToken = account.accessToken;

  const service = new ServiceClass(accessToken, accountId);
  return await service.getEmail({ emailId });
}
