import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const products = await prisma.product.findMany({
    where: q
      ? { companyId, deleted: false, OR: [{ name: { contains: q } }, { description: { contains: q } }] }
      : { companyId, deleted: false },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const product = await prisma.product.create({ data: { ...body, companyId } });
  return NextResponse.json(product, { status: 201 });
}
