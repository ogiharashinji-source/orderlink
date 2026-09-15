import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

const PUBLISH_SCOPES = ["PRIVATE", "PUBLIC", "LIMITED"] as const;
type PublishScope = (typeof PUBLISH_SCOPES)[number];

// 指定した顧客IDのうち、この会社に承認済みで所属しているものだけを返す
// (プライマリ会員 + CustomerCompany経由の招待会員の両方をチェック)
async function filterApprovedCustomerIds(companyId: number, customerIds: number[]): Promise<number[]> {
  if (customerIds.length === 0) return [];

  const primary = await prisma.customer.findMany({
    where: { id: { in: customerIds }, companyId, deleted: false, approved: true },
    select: { id: true },
  });
  const secondary = await prisma.customerCompany.findMany({
    where: { companyId, approved: true, customerId: { in: customerIds } },
    select: { customerId: true },
  });

  const validIds = new Set<number>([...primary.map((c) => c.id), ...secondary.map((l) => l.customerId)]);
  return customerIds.filter((id) => validIds.has(id));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { visibleTo: { select: { customerId: true } } },
  });
  if (!product || product.companyId !== companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!existing || existing.companyId !== companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  // companyIdや公開範囲はこのエンドポイントでは変更させない(PATCHの専用ロジックを使う)
  const { companyId: _companyId, publishScope: _publishScope, ...rest } = body;
  const product = await prisma.product.update({ where: { id: existing.id }, data: rest });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!existing || existing.companyId !== companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const publishScope: PublishScope = body.publishScope;
  if (!PUBLISH_SCOPES.includes(publishScope)) {
    return NextResponse.json({ error: "publishScope must be PRIVATE, PUBLIC or LIMITED" }, { status: 400 });
  }

  if (publishScope === "LIMITED") {
    const requestedIds: number[] = Array.isArray(body.customerIds) ? body.customerIds.map(Number) : [];
    const validIds = await filterApprovedCustomerIds(companyId, requestedIds);

    await prisma.$transaction([
      prisma.product.update({ where: { id: existing.id }, data: { publishScope } }),
      prisma.productVisibility.deleteMany({ where: { productId: existing.id } }),
      ...(validIds.length > 0
        ? [
            prisma.productVisibility.createMany({
              data: validIds.map((customerId) => ({ productId: existing.id, customerId })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);
  } else {
    // 非公開/全体公開へ変更するだけ。ProductVisibilityの行は削除しない
    // (限定公開に戻したときに以前の選択先を復元するため)。
    await prisma.product.update({ where: { id: existing.id }, data: { publishScope } });
  }

  const updated = await prisma.product.findUnique({
    where: { id: existing.id },
    include: { visibleTo: { select: { customerId: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!existing || existing.companyId !== companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.product.update({ where: { id: existing.id }, data: { deleted: true } });
  return NextResponse.json({ ok: true });
}
