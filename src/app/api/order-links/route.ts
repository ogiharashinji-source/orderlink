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
  const { customerId, title, message, productIds, expiresAt, attachmentPath, fileData, fileName, fileType, batchId, sendMode, attachmentBlobUrl, attachmentBlobName } = body;

  const token = randomBytes(16).toString("hex");

  // attachmentBlobUrl が渡された場合はアップロード済み → そのまま使用
  // fileData が渡された場合は個別アップロード（フォールバック）
  let storedUrl: string | null = attachmentBlobUrl ?? null;
  const storedName: string | null = attachmentBlobName ?? fileName ?? null;
  if (!storedUrl && fileData && fileName) {
    try {
      const buffer = Buffer.from(fileData as string, "base64");
      const blob = await put(`attachments/${token}/${fileName}`, buffer, {
        access: "public",
        contentType: (fileType as string) ?? "application/octet-stream",
      });
      storedUrl = blob.url;
    } catch (err) {
      console.error("[Blob] アップロード失敗:", err);
    }
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
      attachmentPath: storedUrl || storedName || attachmentPath || null,
      batchId: batchId || null,
      sendMode: sendMode || null,
    },
    include: { customer: true },
  });

  if (link.customer?.email) {
    const origin = req.nextUrl.origin;
    const orderUrl = `${origin}/portal/login`;
    const setting = await prisma.adminSetting.findUnique({ where: { companyId } });
    const senderName = setting?.companyName ?? "";
    const attachment = fileData && fileName
      ? { filename: fileName, content: Buffer.from(fileData as string, "base64"), contentType: (fileType as string) ?? "application/octet-stream" }
      : null;
    sendOrderLinkEmail({
      to: link.customer.email,
      customerName: link.customer?.name ?? "",
      senderName,
      title: link.title,
      message: link.message,
      orderUrl,
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
      attachment,
      attachmentUrl: storedUrl,
      attachmentName: storedName,
    }).catch((err) => console.error("[sendOrderLinkEmail]", err));
  }

  return NextResponse.json(link, { status: 201 });
}
