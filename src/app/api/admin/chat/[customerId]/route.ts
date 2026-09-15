import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";
import { isCustomerApprovedForCompany, getOrCreateChatRoom } from "@/lib/chatAccess";
import { sendChatMessageEmail } from "@/lib/mailer";

export async function GET(req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerId: customerIdStr } = await params;
  const customerId = Number(customerIdStr);
  if (!customerId) return NextResponse.json({ error: "Invalid customerId" }, { status: 400 });

  const allowed = await isCustomerApprovedForCompany(customerId, companyId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true, name: true } });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const room = await getOrCreateChatRoom(companyId, customerId);
  const messages = await prisma.chatMessage.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  await prisma.chatRoom.update({ where: { id: room.id }, data: { adminLastReadAt: new Date() } });

  return NextResponse.json({
    customer,
    messages: messages.map((m) => ({ id: m.id, senderType: m.senderType, body: m.body, createdAt: m.createdAt })),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerId: customerIdStr } = await params;
  const customerId = Number(customerIdStr);
  if (!customerId) return NextResponse.json({ error: "Invalid customerId" }, { status: 400 });

  const { body } = await req.json();
  const text = typeof body === "string" ? body.trim() : "";
  if (!text) return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "メッセージが長すぎます" }, { status: 400 });

  const allowed = await isCustomerApprovedForCompany(customerId, companyId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const room = await getOrCreateChatRoom(companyId, customerId);
  const now = new Date();
  const message = await prisma.chatMessage.create({
    data: { roomId: room.id, senderType: "ADMIN", body: text },
  });
  await prisma.chatRoom.update({
    where: { id: room.id },
    data: { lastMessageAt: now, adminLastReadAt: now },
  });

  const [customer, setting] = await Promise.all([
    prisma.customer.findUnique({ where: { id: customerId }, select: { email: true, name: true } }),
    prisma.adminSetting.findUnique({ where: { companyId }, select: { companyName: true } }),
  ]);
  if (customer?.email) {
    sendChatMessageEmail(
      customer.email,
      customer.name,
      setting?.companyName ?? "蔵元",
      text,
      "https://www.orderlink.jp/portal/login"
    ).catch((e) => console.error("[チャット通知メール] 送信エラー:", e));
  }

  return NextResponse.json(
    { id: message.id, senderType: message.senderType, body: message.body, createdAt: message.createdAt },
    { status: 201 }
  );
}
