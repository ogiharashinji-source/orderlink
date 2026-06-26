import type { Viewport } from "next";

export const viewport: Viewport = {
  width: 1280,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
