import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hellware Backend Admin",
  description: "Serverless backend and admin panel for Hellware"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
