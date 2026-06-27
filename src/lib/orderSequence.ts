import { prisma } from "@/lib/prisma";

export async function nextOrderSequence(): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { id: "order" },
    create: { id: "order", value: 1 },
    update: { value: { increment: 1 } },
  });
  return String(counter.value).padStart(4, "0");
}

export function datePrefix(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
}

export function seqFromRequestNumber(requestNumber: string): string {
  return requestNumber.split("-")[2] ?? "0000";
}
