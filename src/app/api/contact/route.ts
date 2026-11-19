import { NextResponse } from "next/server";
import { z } from "zod";
import { getSetting } from "@/lib/settings";
import { sendEmail } from "@/lib/email";

const Body = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const supportEmail = (await getSetting<string>("support_email")) ?? "support@invites.local";

  await sendEmail({
    to: supportEmail,
    templateId: "CONTACT_FORM",
    params: parsed.data,
    subject: `Contact form: ${parsed.data.name}`,
    htmlContent: `<p><b>${parsed.data.name}</b> (${parsed.data.email}) says:</p><p>${parsed.data.message}</p>`,
  });
  return NextResponse.json({ ok: true });
}
