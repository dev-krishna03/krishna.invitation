export type EmailType =
  | "WELCOME"
  | "EMAIL_VERIFICATION"
  | "PASSWORD_RESET"
  | "PAYMENT_RECEIPT"
  | "INVITATION_PUBLISHED"
  | "RSVP_RECEIVED"
  | "SUBSCRIPTION_ACTIVATED"
  | "SUBSCRIPTION_EXPIRING"
  | "SUBSCRIPTION_EXPIRED"
  | "TEAM_INVITE"
  | "TEAM_REMOVED";

type BrevoCreds = { api_key: string; sender_email?: string; sender_name?: string };

export async function testBrevo(creds: BrevoCreds, toEmail: string): Promise<void> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": creds.api_key,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: creds.sender_email ?? "no-reply@example.com", name: creds.sender_name ?? "Test" },
      to: [{ email: toEmail }],
      subject: "Test email from your Invitation Platform",
      htmlContent: "<p>This confirms your Brevo integration works.</p>",
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Brevo test failed: ${txt}`);
  }
}
