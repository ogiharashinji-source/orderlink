export async function sendInviteEmail(to: string, inviteUrl: string) {
  // 開発モード: メール送信をスキップしてURLをコンソールに出力
  console.log("========== [招待メール] ==========");
  console.log(`宛先: ${to}`);
  console.log(`招待URL: ${inviteUrl}`);
  console.log("==================================");
}
