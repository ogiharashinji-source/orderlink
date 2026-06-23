import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      },
    },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminCompanyId = await getAdminCompanyId(req);
  const { password, ...body } = await req.json();
  const data: Record<string, unknown> = { ...body };
  if (password) data.password = password;

  const customerId = Number(id);

  // 会員コード重複チェック
  if (body.memberNumber && adminCompanyId) {
    const duplicate = await prisma.customer.findFirst({
      where: {
        companyId: adminCompanyId,
        memberNumber: body.memberNumber,
        id: { not: customerId },
        deleted: false,
      },
      select: { id: true, name: true },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: `この会員コードはすでに「${duplicate.name}」で使用されています` },
        { status: 409 }
      );
    }
  }

  if (body.approved === false) {
    const pendingRequests = await prisma.orderRequest.findMany({
      where: { customerId, status: "PENDING" },
      select: { id: true },
    });
    const pendingIds = pendingRequests.map((r) => r.id);
    if (pendingIds.length > 0) {
      await prisma.requestItem.deleteMany({ where: { requestId: { in: pendingIds } } });
      await prisma.orderRequest.deleteMany({ where: { id: { in: pendingIds } } });
    }
  }

  // CustomerCompany経由（招待）の場合はそちらのapprovedも更新
  if (adminCompanyId && typeof body.approved === "boolean") {
    const link = await prisma.customerCompany.findUnique({
      where: { customerId_companyId: { customerId, companyId: adminCompanyId } },
    });
    if (link) {
      await prisma.customerCompany.update({
        where: { customerId_companyId: { customerId, companyId: adminCompanyId } },
        data: { approved: body.approved },
      });
      // プライマリ会員でない場合はCustomer本体は更新しない
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (customer?.companyId !== adminCompanyId) {
        return NextResponse.json({ ...customer, approved: body.approved });
      }
    }
  }

  const customer = await prisma.customer.update({ where: { id: customerId }, data });
  return NextResponse.json(customer);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = Number(id);

  // PENDING注文依頼を削除
  const pendingRequests = await prisma.orderRequest.findMany({
    where: { customerId, status: "PENDING" },
    select: { id: true },
  });
  const pendingIds = pendingRequests.map((r) => r.id);
  if (pendingIds.length > 0) {
    await prisma.requestItem.deleteMany({ where: { requestId: { in: pendingIds } } });
    await prisma.orderRequest.deleteMany({ where: { id: { in: pendingIds } } });
  }

  // deletedフラグを立てる（セッションは維持したままプルダウン・商品を非表示にする）
  await prisma.customer.update({ where: { id: customerId }, data: { deleted: true, approved: false } });
  return NextResponse.json({ ok: true });
}
