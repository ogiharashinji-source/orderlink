import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const announcements = await prisma.announcement.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reads: true } } },
  });

  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body } = await req.json();
  const t = typeof title === "string" ? title.trim() : "";
  const b = typeof body === "string" ? body.trim() : "";
  if (!t) return NextResponse.json({ error: "タイトルを入力してください" }, { status: 400 });
  if (!b) return NextResponse.json({ error: "内容を入力してください" }, { status: 400 });
  if (t.length > 200) return NextResponse.json({ error: "タイトルが長すぎます" }, { status: 400 });
  if (b.length > 5000) return NextResponse.json({ error: "内容が長すぎます" }, { status: 400 });

  const announcement = await prisma.announcement.create({
    data: { companyId, title: t, body: b },
  });

  return NextResponse.json(announcement, { status: 201 });
}
