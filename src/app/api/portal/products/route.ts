import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const customer = await getCustomerSession();
  if (!customer) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

  const customerData = await prisma.customer.findUnique({ where: { id: customer.id } });
  if (!customerData || customerData.deleted || !customerData.approved)
    return NextResponse.json({ error: "未承認" }, { status: 403 });

  // クエリパラメータで会社ID指定可能（複数発注先対応）
  const url = new URL(req.url);
  const requestedCompanyId = url.searchParams.get("companyId");
  let companyId = customerData.companyId;

  if (requestedCompanyId) {
    const cid = parseInt(requestedCompanyId);
    // 本人が所属する会社かチェック
    if (cid === customerData.companyId) {
      companyId = cid;
    } else {
      const membership = await prisma.customerCompany.findUnique({
        where: { customerId_companyId: { customerId: customer.id, companyId: cid } },
      });
      if (membership) companyId = cid;
    }
  }

  const products = await prisma.product.findMany({
    where: { companyId, deleted: false, published: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}
