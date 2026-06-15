import { cookies } from "next/headers";
import { prisma } from "./prisma";
import crypto from "crypto";

const COOKIE = "customer_auth";
const SECRET = process.env.AUTH_SECRET ?? "sake-system-secret-2026";

export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SECRET).update(password).digest("hex");
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  const customer = await prisma.customer.findFirst({
    where: { passwordResetToken: null, loginId: { not: null } },
    select: { id: true },
  });
  // トークンはloginIdとcustomer idのHMAC
  const customers = await prisma.customer.findMany({
    where: { loginId: { not: null } },
    select: { id: true, loginId: true },
  });
  for (const c of customers) {
    const expected = crypto.createHmac("sha256", SECRET).update(String(c.id)).digest("hex");
    if (expected === token) {
      return await prisma.customer.findUnique({ where: { id: c.id } });
    }
  }
  return null;
}

export function makeSessionToken(customerId: number): string {
  return crypto.createHmac("sha256", SECRET).update(String(customerId)).digest("hex");
}

export const CUSTOMER_COOKIE = COOKIE;
