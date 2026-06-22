import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ec-recommend-mcp",
  description: "楽天・Amazon・ヤフーの商品検索をMCP化するリモートMCPサーバー",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
