export type EmailSendResult =
  | { status: "sent"; messageId: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

const DEFAULT_FROM_EMAIL = "Saskia Cleaning <referrals@saskiaservices.com>";

function getFromEmail(): string {
  return process.env.FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
}

export async function sendEmail(input: SendEmailInput): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return {
      status: "skipped",
      reason: "RESEND_API_KEY not configured",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from: getFromEmail(),
      to: input.to,
      subject: input.subject,
      text: input.text,
    });

    if (response.error) {
      return {
        status: "failed",
        error: response.error.message || "Failed to send email.",
      };
    }

    const messageId = response.data?.id;
    if (!messageId) {
      return {
        status: "failed",
        error: "Email provider did not return a message ID.",
      };
    }

    return { status: "sent", messageId };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Failed to send email.",
    };
  }
}
