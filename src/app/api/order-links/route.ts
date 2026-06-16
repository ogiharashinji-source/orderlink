import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendOrderLinkEmail } from "@/lib/mailer";

export async function GET() {
  const links = await prisma.orderLink.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      request: { select: { id: true, requestNumber: true, status: true } },
    },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerId, title, message, productIds, expiresAt, attachmentPath } = body;

  const token = randomBytes(16).toString("hex");

  const link = await prisma.orderLink.create({
    data: {
      token,
      customerId: Number(customerId),
      title: title || null,
      message: message || null,
      productIds: JSON.stringify(productIds ?? []),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      attachmentPath: attachmentPath || null,
    },
    include: { customer: true },
  });

  if (link.customer?.email) {
    const origin = req.nextUrl.origin;
    const orderUrl = `${origin}/order/${token}`;
    sendOrderLinkEmail({
      to: link.customer.email,
      customerName: link.customer?.name ?? "",
      title: link.title,
      message: link.message,
      orderUrl,
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
    }).catch((err) => console.error("[sendOrderLinkEmail]", err));
  }

  return NextResponse.json(link, { status: 201 });
}
