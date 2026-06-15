import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET ?? "sake-system-secret-2026";
const COOKIE = "superadmin_token";

export { COOKIE as SUPERADMIN_COOKIE };

export function signSuperAdmin(): string {
  const sig = crypto.createHmac("sha256", SECRET).update("superadmin").digest("hex");
  return `superadmin:${sig}`;
}

export function verifySuperAdminToken(token: string): boolean {
  const [id, sig] = token.split(":");
  if (id !== "superadmin" || !sig) return false;
  const expected = crypto.createHmac("sha256", SECRET).update("superadmin").digest("hex");
  return sig === expected;
}
