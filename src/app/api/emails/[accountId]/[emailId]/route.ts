import { emailContentRouter } from "@/services/email/router";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string; emailId: string }> }
) {
  const { accountId, emailId } = await params;

  const email = await emailContentRouter({ accountId, emailId });
  return Response.json({ ...email });
}
