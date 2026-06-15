import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "./prisma";
import { verifyAdminToken } from "./adminToken";

const SECRET = process.env.AUTH_SECRET ?? "sake-system-secret-2026";

export { verifyAdminToken } from "./adminToken";
export { signAdminId } from "./adminToken";

export function hashPassword(password: string) {
  return crypto.createHmac("sha256", SECRET).update(password).digest("hex");
}

export async function getAdminCompanyId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return null;
  const adminId = verifyAdminToken(token);
  if (!adminId) return null;
  const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { companyId: true } });
  return admin?.companyId ?? null;
}
