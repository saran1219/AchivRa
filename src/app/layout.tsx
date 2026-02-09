import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Achievement System",
  description: "Digitally record, verify, and manage student achievements",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
