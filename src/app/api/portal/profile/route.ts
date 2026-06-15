import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const customerData = await prisma.customer.findUnique({
    where: { id: customer.id },
    select: { companyId: true },
  });
  const setting = customerData
    ? await prisma.adminSetting.findUnique({
        where: { companyId: customerData.companyId },
        select: { companyName: true },
      })
    : null;

  return NextResponse.json({ ...customer, sellerName: setting?.companyName ?? "" });
}

export async function PUT(req: NextRequest) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const { name, company, phone, faxNumber, email, address, password } = await req.json();
  const data: Record<string, unknown> = {
    name: name || customer.name,
    company: company || null,
    phone: phone || null,
    faxNumber: faxNumber || null,
    email: email || null,
    address: address || null,
  };
  if (password) data.password = password;
  const updated = await prisma.customer.update({ where: { id: customer.id }, data });
  return NextResponse.json(updated);
}
