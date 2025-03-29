import { emailContentRouter } from "@/services/email/router";

export async function GET(
  _req: Request,
  { params }: { params: { accountId: string; emailId: string } }
) {
  const { accountId, emailId } = await params;

  const email = await emailContentRouter({ accountId, emailId });
  return Response.json({ ...email });
}
