import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Northstar PM Copilot",
  description: "Selector-first portfolio copilot for stock, portfolio, and options decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
