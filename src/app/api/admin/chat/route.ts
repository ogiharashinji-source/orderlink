import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rooms = await prisma.chatRoom.findMany({
    where: { companyId, messages: { some: {} } },
    orderBy: { lastMessageAt: "desc" },
    include: {
      customer: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const unreadCounts = await Promise.all(
    rooms.map((r) =>
      prisma.chatMessage.count({
        where: {
          roomId: r.id,
          senderType: "CUSTOMER",
          createdAt: { gt: r.adminLastReadAt ?? new Date(0) },
        },
      })
    )
  );

  return NextResponse.json(
    rooms.map((r, i) => ({
      customerId: r.customer.id,
      customerName: r.customer.name,
      lastMessage: r.messages[0]?.body ?? "",
      lastMessageAt: r.messages[0]?.createdAt ?? r.lastMessageAt,
      unreadCount: unreadCounts[i],
    }))
  );
}
