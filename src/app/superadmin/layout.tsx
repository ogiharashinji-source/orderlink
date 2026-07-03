import { headers } from "next/headers";
import { AdminPathProvider } from "@/components/AdminPathProvider";

export default async function SuperAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const adminPath = h.get("x-admin-path") ?? "";
  return <AdminPathProvider adminPath={adminPath}>{children}</AdminPathProvider>;
}
