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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__FIREBASE_API_KEY__ = "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}";
              window.__FIREBASE_AUTH_DOMAIN__ = "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}";
              window.__FIREBASE_PROJECT_ID__ = "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}";
              window.__FIREBASE_STORAGE_BUCKET__ = "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}";
              window.__FIREBASE_MESSAGING_SENDER_ID__ = "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}";
              window.__FIREBASE_APP_ID__ = "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}";
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
