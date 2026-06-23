import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminCompanyId } from "@/lib/adminAuth";

type ImportCustomer = {
  memberNumber?: string | null;
  name: string;
  phone?: string;
  faxNumber?: string | null;
  email?: string | null;
};

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "認証エラー" }, { status: 401 });

  const { customers }: { customers: ImportCustomer[] } = await req.json();
  if (!customers?.length) return NextResponse.json({ error: "データがありません" }, { status: 400 });

  // 現在の最大連番パスワードを取得
  const existing = await prisma.customer.findMany({
    where: { password: { not: null } },
    select: { password: true },
  });
  let maxSeq = 0;
  for (const c of existing) {
    if (c.password && /^\d{6}$/.test(c.password)) {
      const n = parseInt(c.password, 10);
      if (n > maxSeq) maxSeq = n;
    }
  }

  const results = [];
  let seq = maxSeq + 1;

  for (const c of customers) {
    const loginId = (c.phone ?? "").replace(/\D/g, "");
    const password = String(seq).padStart(6, "0");
    seq++;

    try {
      if (!c.name || !loginId) {
        results.push({ ...c, loginId, password, status: "error", errorMsg: "会社名または電話番号が不足" });
        continue;
      }

      // 会員コード重複チェック
      if (c.memberNumber) {
        const dupMember = await prisma.customer.findFirst({
          where: { companyId, memberNumber: c.memberNumber, deleted: false },
          select: { id: true },
        });
        if (dupMember) {
          results.push({ ...c, loginId, password, status: "error", errorMsg: "この会員コードはすでに使用されています" });
          seq--;
          continue;
        }
      }

      const existingLogin = await prisma.customer.findUnique({ where: { loginId } });
      if (existingLogin) {
        results.push({ ...c, loginId, password, status: "error", errorMsg: "このログインIDは既に使用中" });
        seq--;
        continue;
      }

      if (c.email) {
        const existingEmail = await prisma.customer.findFirst({ where: { email: c.email } });
        if (existingEmail) {
          results.push({ ...c, loginId, password, status: "error", errorMsg: "このメールアドレスは既に登録済み" });
          seq--;
          continue;
        }
      }

      const customer = await prisma.customer.create({
        data: {
          companyId,
          memberNumber: c.memberNumber || null,
          name: c.name,
          phone: c.phone || null,
          faxNumber: c.faxNumber || null,
          email: c.email || null,
          loginId,
          password,
          approved: true,
        },
      });

      await prisma.customerCompany.create({
        data: { customerId: customer.id, companyId, approved: true },
      });

      results.push({ ...c, loginId, password, status: "done" });
    } catch {
      results.push({ ...c, loginId: loginId || "", password, status: "error", errorMsg: "登録エラー" });
    }
  }

  return NextResponse.json({ results });
}
