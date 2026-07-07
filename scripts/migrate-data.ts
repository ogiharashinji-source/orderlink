/**
 * SQLite (dev.db) → Neon PostgreSQL データ移行スクリプト
 *
 * 実行方法:
 *   npx tsx scripts/migrate-data.ts
 *
 * .env に DATABASE_URL が設定されている前提。
 * システムの sqlite3 コマンドを使用するため better-sqlite3 は不要。
 */

import "dotenv/config";
import { execSync } from "child_process";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

function query<T>(sql: string): T[] {
  const result = execSync(`sqlite3 -json "${DB_PATH}" "${sql.replace(/"/g, '\\"')}"`, {
    encoding: "utf8",
  }).trim();
  if (!result) return [];
  return JSON.parse(result) as T[];
}

function toDate(v: string | null | undefined): Date | null {
  if (!v) return null;
  return new Date(v);
}

async function resetSequence(table: string, column = "id") {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${table}"', '${column}'), COALESCE((SELECT MAX("${column}") FROM "${table}"), 0))`
  );
}

async function main() {
  console.log("=== SQLite → Neon PostgreSQL データ移行開始 ===\n");

  // ── 1. Company ──────────────────────────────────────
  const companies = query<{ id: number; name: string; code: string; createdAt: string }>(
    "SELECT id, name, code, createdAt FROM Company"
  );
  console.log(`Company: ${companies.length} 件`);
  for (const c of companies) {
    await prisma.company.upsert({
      where: { id: c.id },
      create: { id: c.id, name: c.name, code: c.code, createdAt: new Date(c.createdAt) },
      update: {},
    });
  }
  await resetSequence("Company");

  // ── 2. CompanyInvite ─────────────────────────────────
  const invites = query<{ id: number; token: string; companyId: number; createdAt: string; expiresAt: string | null }>(
    "SELECT id, token, companyId, createdAt, expiresAt FROM CompanyInvite"
  );
  console.log(`CompanyInvite: ${invites.length} 件`);
  for (const inv of invites) {
    await prisma.companyInvite.upsert({
      where: { id: inv.id },
      create: {
        id: inv.id,
        token: inv.token,
        companyId: inv.companyId,
        createdAt: new Date(inv.createdAt),
        expiresAt: toDate(inv.expiresAt),
      },
      update: {},
    });
  }
  await resetSequence("CompanyInvite");

  // ── 3. Admin ─────────────────────────────────────────
  const admins = query<{ id: number; loginId: string; password: string; name: string | null; companyId: number; createdAt: string }>(
    "SELECT id, loginId, password, name, companyId, createdAt FROM Admin"
  );
  console.log(`Admin: ${admins.length} 件`);
  for (const a of admins) {
    await prisma.admin.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        loginId: a.loginId,
        password: a.password,
        name: a.name ?? undefined,
        companyId: a.companyId,
        createdAt: new Date(a.createdAt),
      },
      update: {},
    });
  }
  await resetSequence("Admin");

  // ── 4. AdminSetting ──────────────────────────────────
  const settings = query<{
    id: number; companyId: number; companyName: string; companyUrl: string | null;
    address: string | null; phone: string | null; faxNumber: string | null; email: string | null;
  }>("SELECT id, companyId, companyName, companyUrl, address, phone, faxNumber, email FROM AdminSetting");
  console.log(`AdminSetting: ${settings.length} 件`);
  for (const s of settings) {
    await prisma.adminSetting.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        companyId: s.companyId,
        companyName: s.companyName,
        companyUrl: s.companyUrl,
        address: s.address,
        phone: s.phone,
        faxNumber: s.faxNumber,
        email: s.email,
      },
      update: {},
    });
  }
  await resetSequence("AdminSetting");

  // ── 5. Customer ──────────────────────────────────────
  const customers = query<{
    id: number; companyId: number; name: string; email: string | null; phone: string | null;
    address: string | null; company: string | null; notes: string | null; faxNumber: string | null;
    loginId: string | null; password: string | null; referralCode: string | null;
    inviteToken: string | null; inviteEmail: string | null; approved: number; deleted: number;
    passwordResetToken: string | null; passwordResetExpiry: string | null;
    createdAt: string; updatedAt: string;
  }>("SELECT * FROM Customer");
  console.log(`Customer: ${customers.length} 件`);
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        companyId: c.companyId,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        company: c.company,
        notes: c.notes,
        faxNumber: c.faxNumber,
        loginId: c.loginId,
        password: c.password,
        referralCode: c.referralCode,
        inviteToken: c.inviteToken,
        inviteEmail: c.inviteEmail,
        approved: c.approved === 1,
        deleted: c.deleted === 1,
        passwordResetToken: c.passwordResetToken,
        passwordResetExpiry: toDate(c.passwordResetExpiry),
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      },
      update: {},
    });
  }
  await resetSequence("Customer");

  // ── 6. CustomerCompany ───────────────────────────────
  const memberships = query<{
    id: number; customerId: number; companyId: number; inviteId: number | null;
    approved: number; joinedAt: string;
  }>("SELECT id, customerId, companyId, inviteId, approved, joinedAt FROM CustomerCompany");
  console.log(`CustomerCompany: ${memberships.length} 件`);
  for (const m of memberships) {
    await prisma.customerCompany.upsert({
      where: { id: m.id },
      create: {
        id: m.id,
        customerId: m.customerId,
        companyId: m.companyId,
        inviteId: m.inviteId,
        approved: m.approved === 1,
        joinedAt: new Date(m.joinedAt),
      },
      update: {},
    });
  }
  await resetSequence("CustomerCompany");

  // ── 7. Product ───────────────────────────────────────
  const products = query<{
    id: number; companyId: number; name: string; category: string | null;
    sakaMai: string | null; seimaiWari: string | null; alcohol: string | null;
    description: string | null; price1800: number | null; unit1800: string | null;
    stock1800: number | null; price720: number | null; unit720: string | null;
    stock720: number | null; price: number; unit: string; stock: number;
    deleted: number; createdAt: string; updatedAt: string;
  }>("SELECT * FROM Product");
  console.log(`Product: ${products.length} 件`);
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        companyId: p.companyId,
        name: p.name,
        category: p.category,
        sakaMai: p.sakaMai,
        seimaiWari: p.seimaiWari,
        alcohol: p.alcohol,
        description: p.description,
        price1800: p.price1800,
        unit1800: p.unit1800,
        stock1800: p.stock1800,
        price720: p.price720,
        unit720: p.unit720,
        stock720: p.stock720,
        price: p.price,
        unit: p.unit,
        stock: p.stock,
        deleted: p.deleted === 1,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      },
      update: {},
    });
  }
  await resetSequence("Product");

  // ── 8. Order ─────────────────────────────────────────
  const orders = query<{
    id: number; companyId: number; orderNumber: string; customerId: number | null;
    status: string; totalAmount: number; notes: string | null;
    customerName: string | null; customerCompany: string | null;
    customerAddress: string | null; customerPhone: string | null;
    customerFax: string | null; customerEmail: string | null;
    orderDate: string; deliveryDate: string | null; createdAt: string; updatedAt: string;
  }>("SELECT * FROM 'Order'");
  console.log(`Order: ${orders.length} 件`);
  for (const o of orders) {
    await prisma.order.upsert({
      where: { id: o.id },
      create: {
        id: o.id,
        companyId: o.companyId,
        orderNumber: o.orderNumber,
        customerId: o.customerId,
        status: o.status as never,
        totalAmount: o.totalAmount,
        notes: o.notes,
        customerName: o.customerName,
        customerCompany: o.customerCompany,
        customerAddress: o.customerAddress,
        customerPhone: o.customerPhone,
        customerFax: o.customerFax,
        customerEmail: o.customerEmail,
        orderDate: new Date(o.orderDate),
        deliveryDate: toDate(o.deliveryDate),
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
      },
      update: {},
    });
  }
  await resetSequence("Order");

  // ── 9. OrderRequest ──────────────────────────────────
  const requests = query<{
    id: number; companyId: number; requestNumber: string; customerId: number | null;
    status: string; notes: string | null; sellerName: string | null;
    sellerAddress: string | null; sellerPhone: string | null;
    sellerFax: string | null; sellerEmail: string | null;
    requestedAt: string; confirmedAt: string | null; orderId: number | null;
  }>("SELECT * FROM OrderRequest");
  console.log(`OrderRequest: ${requests.length} 件`);
  for (const r of requests) {
    await prisma.orderRequest.upsert({
      where: { id: r.id },
      create: {
        id: r.id,
        companyId: r.companyId,
        requestNumber: r.requestNumber,
        customerId: r.customerId,
        status: r.status as never,
        notes: r.notes,
        sellerName: r.sellerName,
        sellerAddress: r.sellerAddress,
        sellerPhone: r.sellerPhone,
        sellerFax: r.sellerFax,
        sellerEmail: r.sellerEmail,
        requestedAt: new Date(r.requestedAt),
        confirmedAt: toDate(r.confirmedAt),

      },
      update: {},
    });
  }
  await resetSequence("OrderRequest");

  // ── 10. RequestItem ──────────────────────────────────
  const reqItems = query<{
    id: number; requestId: number; productId: number | null;
    productName: string | null; productCategory: string | null;
    productSakaMai: string | null; productSeimaiWari: string | null;
    productAlcohol: string | null; volume: string | null;
    requestedQty: number; confirmedQty: number | null; unitPrice: number; createdAt: string;
  }>("SELECT * FROM RequestItem");
  console.log(`RequestItem: ${reqItems.length} 件`);
  for (const ri of reqItems) {
    await prisma.requestItem.upsert({
      where: { id: ri.id },
      create: {
        id: ri.id,
        requestId: ri.requestId,
        productId: ri.productId,
        productName: ri.productName,
        productCategory: ri.productCategory,
        productSakaMai: ri.productSakaMai,
        productSeimaiWari: ri.productSeimaiWari,
        productAlcohol: ri.productAlcohol,
        volume: ri.volume,
        requestedQty: ri.requestedQty,
        confirmedQty: ri.confirmedQty,
        unitPrice: ri.unitPrice,
        createdAt: new Date(ri.createdAt),
      },
      update: {},
    });
  }
  await resetSequence("RequestItem");

  // ── 11. OrderItem ────────────────────────────────────
  const orderItems = query<{
    id: number; orderId: number; productId: number | null;
    productName: string | null; productCategory: string | null;
    productSakaMai: string | null; productSeimaiWari: string | null;
    productAlcohol: string | null; quantity: number; unitPrice: number;
    volume: string | null; createdAt: string; updatedAt: string;
  }>("SELECT * FROM OrderItem");
  console.log(`OrderItem: ${orderItems.length} 件`);
  for (const oi of orderItems) {
    await prisma.orderItem.upsert({
      where: { id: oi.id },
      create: {
        id: oi.id,
        orderId: oi.orderId,
        productId: oi.productId,
        productName: oi.productName,
        productCategory: oi.productCategory,
        productSakaMai: oi.productSakaMai,
        productSeimaiWari: oi.productSeimaiWari,
        productAlcohol: oi.productAlcohol,
        quantity: oi.quantity,
        unitPrice: oi.unitPrice,
        volume: oi.volume,
        createdAt: new Date(oi.createdAt),
        updatedAt: new Date(oi.updatedAt),
      },
      update: {},
    });
  }
  await resetSequence("OrderItem");

  console.log("\n=== データ移行完了 ===");
}

main()
  .catch((e) => {
    console.error("移行エラー:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
