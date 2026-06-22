export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", lineHeight: 1.7 }}>
      <h1>ec-recommend-mcp</h1>
      <p>キャンプ道具レコメンド向けのリモートMCPサーバーです。</p>
      <p>
        MCPエンドポイント（Streamable HTTP）: <code>/api/mcp</code>
      </p>
      <p>
        利用可能なツール: <code>search_rakuten_items</code>
      </p>
    </main>
  );
}
