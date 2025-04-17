import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import StoreProvider from "@/store/StoreProvider";
import { Analytics } from "@vercel/analytics/react"

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
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          </head>
          <body className={inter.className}>
            {children}
            <Analytics />
          </body>
        </html>
      </StoreProvider>
    </ClerkProvider>
  );
}
