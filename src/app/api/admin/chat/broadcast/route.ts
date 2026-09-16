import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";
import { getOrCreateChatRoom } from "@/lib/chatAccess";
import { sendChatMessageEmail } from "@/lib/mailer";

// 承認済みの全会員(プライマリ + CustomerCompany経由の招待会員)を取得
async function getApprovedCustomers(companyId: number) {
  const primary = await prisma.customer.findMany({
    where: { companyId, deleted: false, approved: true },
    select: { id: true, name: true, email: true },
  });
  const secondaryLinks = await prisma.customerCompany.findMany({
    where: { companyId, approved: true },
    select: { customerId: true },
  });
  const primaryIds = new Set(primary.map((c) => c.id));
  const extraIds = secondaryLinks.map((l) => l.customerId).filter((id) => !primaryIds.has(id));
  const secondary = extraIds.length > 0
    ? await prisma.customer.findMany({
        where: { id: { in: extraIds }, deleted: false },
        select: { id: true, name: true, email: true },
      })
    : [];
  return [...primary, ...secondary];
}

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body, customerIds } = await req.json();
  const text = typeof body === "string" ? body.trim() : "";
  if (!text) return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "メッセージが長すぎます" }, { status: 400 });

  const approved = await getApprovedCustomers(companyId);
  const customers = Array.isArray(customerIds) && customerIds.length > 0
    ? approved.filter((c) => customerIds.includes(c.id))
    : approved;
  if (customers.length === 0) {
    return NextResponse.json({ error: "送信先の会員がいません" }, { status: 400 });
  }

  const setting = await prisma.adminSetting.findUnique({ where: { companyId }, select: { companyName: true } });
  const now = new Date();

  await Promise.all(customers.map(async (c) => {
    const room = await getOrCreateChatRoom(companyId, c.id);
    await prisma.chatMessage.create({ data: { roomId: room.id, senderType: "ADMIN", body: text } });
    await prisma.chatRoom.update({ where: { id: room.id }, data: { lastMessageAt: now, adminLastReadAt: now } });
    if (c.email) {
      sendChatMessageEmail(
        c.email,
        c.name,
        setting?.companyName ?? "蔵元",
        text,
        "https://www.orderlink.jp/portal/login"
      ).catch((e) => console.error("[一斉送信メール] 送信エラー:", e));
    }
  }));

  return NextResponse.json({ ok: true, count: customers.length }, { status: 201 });
}
