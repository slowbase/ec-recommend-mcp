# ec-recommend-mcp

Next.js + TypeScript で構築するリモートMCPサーバー。
楽天・Amazon・ヤフーショッピングの商品検索APIをMCP化し、キャンプ道具のレコメンドをAIが動的に生成できるようにする。

現在は **楽天市場 商品検索API** に対応。

## 技術スタック

- Next.js (App Router) + TypeScript
- [`mcp-handler`](https://github.com/vercel/mcp-handler) + [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk)
- デプロイ先: Vercel
- トランスポート: **Streamable HTTP**（MCPの現行標準）

> SSEについて: Vercel等のサーバーレスではSSEのセッション維持にRedisが必須のため、
> 最小構成では Streamable HTTP のみ有効化しています。SSEを使う場合は `REDIS_URL` を設定し、
> [app/api/[transport]/route.ts](app/api/[transport]/route.ts) の `disableSse: true` を外してください。

## MCPツール

### `search_rakuten_items`

| 項目 | 内容 |
| --- | --- |
| 入力 | `keyword` (必須), `hits` (任意, 1〜30, 既定10) |
| 処理 | 楽天市場 商品検索APIを呼び出す |
| 出力 | 商品名・価格・アフィリエイトリンク・画像URL・店舗名のJSON |

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # 既に .env.local があれば不要
```

`.env.local` に楽天の認証情報を設定:

```
RAKUTEN_APP_ID=取得済みのアプリID
RAKUTEN_AFFILIATE_ID=取得済みのアフィリエイトID
```

## ローカル起動

```bash
npm run dev
```

MCPエンドポイント: `http://localhost:3000/api/mcp`

### 動作確認 (curl)

```bash
# ツール一覧
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# 商品検索
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_rakuten_items","arguments":{"keyword":"焚き火台","hits":3}}}'
```

## デプロイ (Vercel)

1. GitHubにpushして Vercel にインポート
2. Vercelの環境変数に `RAKUTEN_APP_ID` と `RAKUTEN_AFFILIATE_ID` を設定
3. デプロイ後のエンドポイント: `https://<your-app>.vercel.app/api/mcp`

## ディレクトリ構成

```
app/
  api/
    [transport]/
      route.ts      ← MCPエンドポイント (Streamable HTTP)
  layout.tsx
  page.tsx
lib/
  rakuten.ts        ← 楽天API呼び出し
  mcp-server.ts     ← MCPツール定義
```
