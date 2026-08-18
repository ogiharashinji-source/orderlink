import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCustomerToken } from "@/lib/customerAuth";

export async function GET() {
  const customerId = await verifyCustomerToken();
  if (!customerId) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const rooms = await prisma.chatRoom.findMany({
    where: { customerId, messages: { some: {} } },
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const settings = await prisma.adminSetting.findMany({
    where: { companyId: { in: rooms.map((r) => r.companyId) } },
    select: { companyId: true, companyName: true },
  });
  const nameMap = Object.fromEntries(settings.map((s) => [s.companyId, s.companyName]));

  const unreadCounts = await Promise.all(
    rooms.map((r) =>
      prisma.chatMessage.count({
        where: {
          roomId: r.id,
          senderType: "ADMIN",
          createdAt: { gt: r.customerLastReadAt ?? new Date(0) },
        },
      })
    )
  );

  return NextResponse.json(
    rooms.map((r, i) => ({
      companyId: r.companyId,
      companyName: nameMap[r.companyId] ?? "",
      lastMessage: r.messages[0]?.body ?? "",
      lastMessageAt: r.messages[0]?.createdAt ?? r.lastMessageAt,
      unreadCount: unreadCounts[i],
    }))
  );
}
