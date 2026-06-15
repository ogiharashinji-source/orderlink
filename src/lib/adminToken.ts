// Node.js crypto — API routes のみで使用（Edge runtime 不可）
import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET ?? "sake-system-secret-2026";

export function signAdminId(adminId: number): string {
  const sig = crypto.createHmac("sha256", SECRET).update(String(adminId)).digest("hex");
  return `${adminId}:${sig}`;
}

export function verifyAdminToken(token: string): number | null {
  const [idStr, sig] = token.split(":");
  if (!idStr || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(idStr).digest("hex");
  if (sig !== expected) return null;
  return parseInt(idStr);
}
