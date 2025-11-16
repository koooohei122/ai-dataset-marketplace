import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIデータセットマーケットプレイス",
  description: "AI開発者、研究者、企業向けのデータセット販売・購入プラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

