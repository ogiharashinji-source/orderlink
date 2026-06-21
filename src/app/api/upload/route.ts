import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomBytes } from "crypto";
import { getAdminCompanyId } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const companyId = await getAdminCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });

  const id = randomBytes(12).toString("hex");
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const blob = await put(`attachments/${id}/${file.name}`, buffer, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });
    return NextResponse.json({ url: blob.url, name: file.name });
  } catch (err) {
    console.error("[Upload] Blob upload failed:", err);
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}
