import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCustomerToken } from "@/lib/customerAuth";

export async function GET() {
  const customerId = await verifyCustomerToken();
  if (!customerId) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const rooms = await prisma.chatRoom.findMany({
    where: { customerId },
    select: { id: true, customerLastReadAt: true },
  });

  const counts = await Promise.all(
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

  return NextResponse.json({ unread: counts.reduce((a, b) => a + b, 0) });
}
