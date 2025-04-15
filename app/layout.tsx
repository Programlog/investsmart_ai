import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import StoreProvider from "lib/store/StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvestSmart AI",
  description: "AI-Powered Investment Insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <StoreProvider>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </StoreProvider>
    </ClerkProvider>
  );
}
