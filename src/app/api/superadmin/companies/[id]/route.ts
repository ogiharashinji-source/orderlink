import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = parseInt(id);

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      setting: true,
      admins: { select: { id: true, loginId: true, password: true } },
    },
  });
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(company);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = parseInt(id);
  const { companyName, address, phone, email, loginId, password } = await req.json();

  await prisma.adminSetting.updateMany({
    where: { companyId },
    data: {
      ...(companyName !== undefined && { companyName }),
      ...(address !== undefined && { address }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
    },
  });

  const admin = await prisma.admin.findFirst({ where: { companyId } });
  if (admin) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        ...(loginId && { loginId }),
        ...(password && { password }),
      },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = parseInt(id);

  const orders = await prisma.order.findMany({ where: { companyId }, select: { id: true } });
  const orderIds = orders.map((o) => o.id);
  await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });

  const requests = await prisma.orderRequest.findMany({ where: { companyId }, select: { id: true } });
  const requestIds = requests.map((r) => r.id);
  await prisma.requestItem.deleteMany({ where: { requestId: { in: requestIds } } });

  await prisma.orderLink.deleteMany({ where: { companyId } });
  await prisma.orderRequest.deleteMany({ where: { companyId } });
  await prisma.order.deleteMany({ where: { companyId } });
  await prisma.product.deleteMany({ where: { companyId } });
  await prisma.customer.deleteMany({ where: { companyId } });
  await prisma.customerCompany.deleteMany({ where: { companyId } });
  await prisma.companyInvite.deleteMany({ where: { companyId } });
  await prisma.admin.deleteMany({ where: { companyId } });
  await prisma.adminSetting.deleteMany({ where: { companyId } });
  await prisma.company.delete({ where: { id: companyId } });

  return NextResponse.json({ ok: true });
}
