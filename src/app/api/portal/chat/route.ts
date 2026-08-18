import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCustomerToken } from "@/lib/customerAuth";
import { isCustomerApprovedForCompany, getOrCreateChatRoom } from "@/lib/chatAccess";

export async function GET(req: NextRequest) {
  const customerId = await verifyCustomerToken();
  if (!customerId) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const companyId = Number(req.nextUrl.searchParams.get("companyId"));
  if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });

  const allowed = await isCustomerApprovedForCompany(customerId, companyId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const room = await getOrCreateChatRoom(companyId, customerId);
  const [messages, setting] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "asc" },
      take: 200,
    }),
    prisma.adminSetting.findUnique({ where: { companyId }, select: { companyName: true } }),
  ]);

  await prisma.chatRoom.update({ where: { id: room.id }, data: { customerLastReadAt: new Date() } });

  return NextResponse.json({
    companyName: setting?.companyName ?? "",
    messages: messages.map((m) => ({ id: m.id, senderType: m.senderType, body: m.body, createdAt: m.createdAt })),
  });
}

export async function POST(req: NextRequest) {
  const customerId = await verifyCustomerToken();
  if (!customerId) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const { companyId, body } = await req.json();
  const companyIdNum = Number(companyId);
  const text = typeof body === "string" ? body.trim() : "";
  if (!companyIdNum) return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  if (!text) return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "メッセージが長すぎます" }, { status: 400 });

  const allowed = await isCustomerApprovedForCompany(customerId, companyIdNum);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const room = await getOrCreateChatRoom(companyIdNum, customerId);
  const now = new Date();
  const message = await prisma.chatMessage.create({
    data: { roomId: room.id, senderType: "CUSTOMER", body: text },
  });
  await prisma.chatRoom.update({
    where: { id: room.id },
    data: { lastMessageAt: now, customerLastReadAt: now },
  });

  return NextResponse.json(
    { id: message.id, senderType: message.senderType, body: message.body, createdAt: message.createdAt },
    { status: 201 }
  );
}
