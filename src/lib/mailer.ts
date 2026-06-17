import nodemailer from "nodemailer";

const DEV = !process.env.SMTP_USER || process.env.SMTP_USER === "your-email@gmail.com";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendInviteEmail(to: string, inviteUrl: string) {
  if (DEV) {
    console.log("========== [招待メール] ==========");
    console.log(`宛先: ${to}`);
    console.log(`招待URL: ${inviteUrl}`);
    console.log("==================================");
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "ご登録のご案内",
    text: `以下のURLよりご登録をお願いいたします。\n\n${inviteUrl}`,
  });
}

export async function sendOrderLinkEmail({
  to,
  customerName,
  title,
  message,
  orderUrl,
  expiresAt,
  attachment,
}: {
  to: string;
  customerName: string;
  title: string | null;
  message: string | null;
  orderUrl: string;
  expiresAt: string | null;
  attachment?: { filename: string; content: Buffer; contentType: string } | null;
}) {
  const subject = title ? `【ご注文のご案内】${title}` : "【ご注文のご案内】発注書が届いています";

  const expireText = expiresAt
    ? `\n有効期限: ${new Date(expiresAt).toLocaleDateString("ja-JP")} まで`
    : "";

  const body = [
    `${customerName} 様`,
    "",
    message ?? "いつもお世話になっております。",
    "",
    "以下のURLより、スマートフォンでかんたんにご注文いただけます。",
    "",
    orderUrl,
    expireText,
    "",
    "ご不明な点はお問い合わせください。",
  ].join("\n");

  if (DEV) {
    console.log("========== [発注書メール] ==========");
    console.log(`宛先: ${to}`);
    console.log(`件名: ${subject}`);
    console.log(body);
    if (attachment) console.log(`添付: ${attachment.filename}`);
    console.log("====================================");
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text: body,
    attachments: attachment
      ? [{ filename: attachment.filename, content: attachment.content, contentType: attachment.contentType }]
      : [],
  });
}
