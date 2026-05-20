import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hellware — Build Real. Ship Real. Get Recognized.",
  description: "Project-based engineering and experiential learning platform for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
