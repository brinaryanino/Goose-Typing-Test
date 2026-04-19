import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "GooseTyping | Minimalist Typing Test",
  description: "A strictly monochrome, high-performance typing test for zen-mode focus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="antialiased selection:bg-white/20">
        {children}
      </body>
    </html>
  );
}
