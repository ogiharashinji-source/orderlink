import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendOrderLinkEmail } from "@/lib/mailer";
import { getAdminCompanyId } from "@/lib/adminAuth";
import { put } from "@vercel/blob";

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

  // ファイルをVercel Blobにアップロード
  let storedUrl: string | null = null;
  if (fileData && fileName && process.env.BLOB_READ_WRITE_TOKEN) {
    const buffer = Buffer.from(fileData as string, "base64");
    const blob = await put(`attachments/${token}/${fileName}`, buffer, {
      access: "public",
      contentType: (fileType as string) ?? "application/octet-stream",
    });
    storedUrl = blob.url;
  }

  const link = await prisma.orderLink.create({
    data: {
      token,
      companyId,
      customerId: Number(customerId),
      title: title || null,
      message: message || null,
      productIds: JSON.stringify(productIds ?? []),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      attachmentPath: storedUrl || fileName || attachmentPath || null,
    },
    include: { customer: true },
  });

  if (link.customer?.email) {
    const origin = req.nextUrl.origin;
    const orderUrl = `${origin}/portal/login`;
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
      attachmentUrl: storedUrl,
      attachmentName: fileName ?? null,
    }).catch((err) => console.error("[sendOrderLinkEmail]", err));
  }

  return NextResponse.json(link, { status: 201 });
}
