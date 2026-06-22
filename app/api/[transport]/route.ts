import { createMcpHandler } from "mcp-handler";
import { registerTools } from "@/lib/mcp-server";

/**
 * リモートMCPエンドポイント。
 * basePath "/api" により、Streamable HTTP は /api/mcp で待ち受ける。
 *
 * SSEを使いたい場合は REDIS_URL を設定し、disableSse を外すと /api/sse が有効になる。
 * （Vercelのようなサーバーレス環境ではSSEのセッション維持にRedisが必須のため、
 *   最小構成では Streamable HTTP のみ有効化している）
 */
const handler = createMcpHandler(
  (server) => {
    registerTools(server);
  },
  {
    serverInfo: {
      name: "ec-recommend-mcp",
      version: "0.1.0",
    },
  },
  {
    basePath: "/api",
    disableSse: true,
    verboseLogs: true,
  }
);

export { handler as GET, handler as POST };
