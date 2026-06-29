import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "noreply@orderlink.jp";
const DEV = !process.env.RESEND_API_KEY;

const getResend = () => new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail(to: string, inviteUrl: string, senderName = "") {
  const subject = senderName
    ? `【OrderLink】${senderName}よりポータル登録のご案内`
    : "【OrderLink】ポータル登録のご案内";

  const company = senderName || "OrderLink";
  const shortCompany = company.replace(/^株式会社\s*/, "").replace(/\s*株式会社$/, "").replace(/^有限会社\s*/, "").replace(/\s*有限会社$/, "");

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- ヘッダー -->
        <tr>
          <td style="background:#1e3a5f;padding:28px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;">OrderLink</span>
          </td>
        </tr>

        <!-- 本文 -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.9;">
              ${company}様より OrderLink ポータルへご招待されました。
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#333333;line-height:1.9;">
              OrderLinkにご登録いただくことで、商品をオンラインで簡単にご発注いただけるようになります。下記のボタンよりアカウントを作成し、ご利用を開始してください。
            </p>

            <!-- ボタン -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 32px;">
                  <a href="${inviteUrl}"
                     style="display:inline-block;background:#1e3a5f;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 40px;border-radius:6px;letter-spacing:0.5px;">
                    アカウントを登録する
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#666666;line-height:1.7;">
              ボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください。
            </p>
            <p style="margin:0 0 28px;font-size:12px;color:#888888;word-break:break-all;">
              <a href="${inviteUrl}" style="color:#1e3a5f;">${inviteUrl}</a>
            </p>

            <!-- 注意事項 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:6px;">
              <tr>
                <td style="padding:16px 20px;font-size:13px;color:#666666;line-height:1.8;">
                  なお、本メールにお心当たりがない場合は、お手数ですが本メールを削除いただきますようお願いいたします。
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- フッター -->
        <tr>
          <td style="background:#f4f6f8;padding:20px 40px;text-align:center;border-top:1px solid #e8eaed;">
            <p style="margin:0;font-size:12px;color:#999999;">
              このメールはOrderLinkから自動送信されています。返信はお受けできません。
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `${company}様より OrderLink ポータルへご招待されました。`,
    "",
    "OrderLinkにご登録いただくことで、商品をオンラインで簡単にご発注いただけるようになります。下記のボタンよりアカウントを作成し、ご利用を開始してください。",
    "",
    inviteUrl,
    "",
    "なお、本メールにお心当たりがない場合は、お手数ですが本メールを削除いただきますようお願いいたします。",
  ].join("\n");

  if (DEV) {
    console.log("========== [招待メール] ==========");
    console.log(`宛先: ${to}`);
    console.log(`件名: ${subject}`);
    console.log(`招待URL: ${inviteUrl}`);
    console.log("==================================");
    return;
  }

  await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
  });
}

export async function sendBreweryNotificationEmail(to: string, customerName: string, breweryName: string) {
  const subject = `【OrderLink】${customerName}様が登録しました`;
  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1e3a5f;padding:28px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;">OrderLink</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.9;">
              <strong>${customerName}</strong>様がOrderLinkへ登録しました。
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#333333;line-height:1.9;">
              管理画面から承認してください。
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 32px;">
                  <a href="https://www.orderlink.jp/customers"
                     style="display:inline-block;background:#1e3a5f;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 40px;border-radius:6px;letter-spacing:0.5px;">
                    管理画面で確認する
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f4f6f8;padding:20px 40px;text-align:center;border-top:1px solid #e8eaed;">
            <p style="margin:0;font-size:12px;color:#999999;">
              このメールはOrderLinkから自動送信されています。返信はお受けできません。
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${customerName}様がOrderLinkへ登録しました。管理画面から承認してください。\nhttps://www.orderlink.jp/customers`;

  if (DEV) {
    console.log("========== [登録通知メール] ==========");
    console.log(`宛先: ${to}`);
    console.log(`件名: ${subject}`);
    console.log(text);
    console.log("=====================================");
    return;
  }

  await getResend().emails.send({ from: FROM, to, subject, html, text });
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderNumber,
  breweryName,
  items,
  adminReply,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  breweryName: string;
  items: { productName: string; category: string | null; sakaMai: string | null; volume: string | null; qty: number }[];
  adminReply?: string | null;
}) {
  const subject = `【OrderLink】ご注文が確定しました（${orderNumber}）`;

  const itemRows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#333;">${i.productName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:center;">${i.category ?? "—"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:center;">${i.sakaMai ?? "—"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:center;">${i.volume ?? "—"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:center;">${i.qty}ケース</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1e3a5f;padding:28px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;">OrderLink</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:16px;color:#222;">${customerName} 様</p>
            <p style="margin:0 0 24px;font-size:15px;color:#333;line-height:1.9;">
              ${breweryName}よりご注文が確定しました。
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;margin-bottom:24px;">
              <thead>
                <tr style="background:#f8f9fb;">
                  <th style="padding:8px 12px;font-size:12px;color:#666;text-align:left;">商品名</th>
                  <th style="padding:8px 12px;font-size:12px;color:#666;text-align:center;">種別</th>
                  <th style="padding:8px 12px;font-size:12px;color:#666;text-align:center;">酒米</th>
                  <th style="padding:8px 12px;font-size:12px;color:#666;text-align:center;">容量</th>
                  <th style="padding:8px 12px;font-size:12px;color:#666;text-align:center;">数量</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
            ${adminReply ? `<div style="background:#f8f9fb;border-radius:6px;padding:16px 20px;margin-bottom:24px;"><p style="margin:0 0 4px;font-size:12px;color:#888;">メッセージ</p><p style="margin:0;font-size:14px;color:#333;line-height:1.8;white-space:pre-wrap;">${adminReply}</p></div>` : ""}
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 16px;">
                  <a href="https://orderlink.jp/portal/orders"
                     style="display:inline-block;background:#1e3a5f;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 40px;border-radius:6px;">
                    発注履歴を確認する
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f4f6f8;padding:20px 40px;text-align:center;border-top:1px solid #e8eaed;">
            <p style="margin:0;font-size:12px;color:#999;">このメールはOrderLinkから自動送信されています。返信はお受けできません。</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `${breweryName}よりご注文が確定しました。`,
    `受注番号：${orderNumber}`,
    "",
    ...items.map((i) => `・${i.productName} ${i.category ?? ""} ${i.sakaMai ?? ""} ${i.volume ?? ""} ${i.qty}ケース`),
    ...(adminReply ? ["", "【メッセージ】", adminReply] : []),
    "",
    "https://orderlink.jp/portal/orders",
  ].join("\n");

  if (DEV) {
    console.log("========== [注文確定メール] ==========");
    console.log(`宛先: ${to}`);
    console.log(`件名: ${subject}`);
    console.log(text);
    console.log("======================================");
    return;
  }

  await getResend().emails.send({ from: FROM, to, subject, html, text });
}

export async function sendOrderLinkEmail({
  to,
  customerName,
  title,
  message,
  orderUrl,
  expiresAt,
  attachment,
  attachmentUrl,
  attachmentName,
  senderName,
}: {
  to: string;
  customerName: string;
  senderName?: string;
  title: string | null;
  message: string | null;
  orderUrl: string;
  expiresAt: string | null;
  attachment?: { filename: string; content: Buffer; contentType: string } | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
}) {
  const subject = senderName ? `${senderName}様からお連絡が届いています` : "お連絡が届いています";
  const bodyMessage = message ?? "";

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- ヘッダー -->
        <tr>
          <td style="background:#1e3a5f;padding:28px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;">OrderLink</span>
          </td>
        </tr>

        <!-- 本文 -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 16px;font-size:16px;font-weight:bold;color:#222222;">${customerName} 様</p>
            ${title ? `<p style="margin:0 0 12px;font-size:16px;font-weight:bold;color:#1e3a5f;">${title}</p>` : ""}
            ${bodyMessage ? `<p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.8;white-space:pre-wrap;">${bodyMessage}</p>` : ""}

            ${attachmentUrl ? `
            <!-- 添付ファイル -->
            <p style="margin:0 0 16px;font-size:13px;color:#555555;">
              📎 添付資料：<a href="${attachmentUrl}" style="color:#1e3a5f;">${attachmentName ?? "ファイルを開く"}</a>
            </p>` : ""}

            <!-- ログインボタン -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 16px;">
                  <a href="${orderUrl}"
                     style="display:inline-block;background:#1e3a5f;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 40px;border-radius:6px;letter-spacing:0.5px;">
                    ログインはこちら
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- フッター -->
        <tr>
          <td style="background:#f4f6f8;padding:20px 40px;text-align:center;border-top:1px solid #e8eaed;">
            <p style="margin:0;font-size:12px;color:#999999;">
              このメールはOrderLinkから自動送信されています。返信はお受けできません。
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `${customerName} 様`,
    ...(title ? ["", title] : []),
    ...(bodyMessage ? ["", bodyMessage] : []),
    "",
    orderUrl,
    ...(attachmentUrl ? ["", `添付資料: ${attachmentUrl}`] : []),
  ].join("\n");

  if (DEV) {
    console.log("========== [発注書メール] ==========");
    console.log(`宛先: ${to}`);
    console.log(`件名: ${subject}`);
    console.log(text);
    if (attachment) console.log(`添付: ${attachment.filename}`);
    console.log("====================================");
    return;
  }

  await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
    attachments: attachment
      ? [{ filename: attachment.filename, content: attachment.content }]
      : [],
  });
}
