import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GCSE Past Paper Tracker",
  description: "Track GCSE past paper completion, marks, and review topics.",
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
