import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "AEO Platform",
  description: "Answer Engine Optimization diagnostics and execution plans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 antialiased text-zinc-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
