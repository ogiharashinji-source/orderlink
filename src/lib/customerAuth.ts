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

export async function verifyCustomerToken(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;

  const [idStr, hmac] = token.split(".");
  const customerId = parseInt(idStr);
  if (!idStr || !hmac || isNaN(customerId)) return null;

  const expected = crypto.createHmac("sha256", SECRET).update(String(customerId)).digest("hex");
  if (expected !== hmac) return null;

  const exists = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });
  if (!exists) return null;

  return customerId;
}

export async function getCustomerSession() {
  const customerId = await verifyCustomerToken();
  if (!customerId) return null;
  return await prisma.customer.findUnique({ where: { id: customerId } });
}

export function makeSessionToken(customerId: number): string {
  const hmac = crypto.createHmac("sha256", SECRET).update(String(customerId)).digest("hex");
  return `${customerId}.${hmac}`;
}

export const CUSTOMER_COOKIE = COOKIE;
