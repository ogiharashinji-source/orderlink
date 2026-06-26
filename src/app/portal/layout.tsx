import type { Viewport } from "next";
import PortalLayoutClient from "@/components/PortalLayoutClient";

export const viewport: Viewport = {
  width: 1280,
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>;
}
