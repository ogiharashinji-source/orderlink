import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendOrderLinkEmail } from "@/lib/mailer";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.orderLink.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      request: { select: { id: true, requestNumber: true, status: true } },
    },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { customerId, title, message, productIds, expiresAt, attachmentPath, fileData, fileName, fileType } = body;

  const token = randomBytes(16).toString("hex");

  const link = await prisma.orderLink.create({
    data: {
      token,
      companyId,
      customerId: Number(customerId),
      title: title || null,
      message: message || null,
      productIds: JSON.stringify(productIds ?? []),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      attachmentPath: fileName || attachmentPath || null,
    },
    include: { customer: true },
  });

  if (link.customer?.email) {
    const origin = req.nextUrl.origin;
    const orderUrl = `${origin}/order/${token}`;
    const attachment = fileData && fileName
      ? { filename: fileName, content: Buffer.from(fileData as string, "base64"), contentType: (fileType as string) ?? "application/octet-stream" }
      : null;
    sendOrderLinkEmail({
      to: link.customer.email,
      customerName: link.customer?.name ?? "",
      title: link.title,
      message: link.message,
      orderUrl,
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
      attachment,
    }).catch((err) => console.error("[sendOrderLinkEmail]", err));
  }

  return NextResponse.json(link, { status: 201 });
}
