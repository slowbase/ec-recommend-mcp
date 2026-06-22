import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchRakutenItems } from "@/lib/rakuten";
import { searchRakutenTravel } from "@/lib/rakuten-travel";

/**
 * MCPサーバーにツールを登録する。
 * mcp-handler の createMcpHandler から呼ばれる。
 */
export function registerTools(server: McpServer) {
  server.tool(
    "search_rakuten_items",
    "楽天市場の商品検索APIでキーワードに合う商品を検索する。キャンプ道具などのレコメンドに使う。商品名・価格・アフィリエイトリンク・画像URLを返す。",
    {
      keyword: z
        .string()
        .min(1)
        .describe("検索キーワード（例: 焚き火台, ファミリーテント）"),
      hits: z
        .number()
        .int()
        .min(1)
        .max(30)
        .optional()
        .describe("取得件数（1〜30、デフォルト10）"),
    },
    async ({ keyword, hits }) => {
      try {
        const items = await searchRakutenItems({ keyword, hits });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ keyword, count: items.length, items }, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text", text: `検索に失敗しました: ${message}` }],
        };
      }
    }
  );

  server.tool(
    "search_rakuten_travel_campsites",
    "楽天トラベルでキャンプ場・グランピング施設を検索する。施設名・住所・最安料金・レビュー平均・予約ページのアフィリエイトリンクを返す。",
    {
      keyword: z
        .string()
        .min(1)
        .describe("検索キーワード（例: キャンプ場, グランピング, オートキャンプ）"),
      prefectureCode: z
        .string()
        .regex(/^\d{2}$/)
        .optional()
        .describe("都道府県コード2桁（例: \"13\" = 東京都, \"27\" = 大阪府）。省略可。"),
      hits: z
        .number()
        .int()
        .min(1)
        .max(30)
        .optional()
        .describe("取得件数（1〜30、デフォルト10）"),
    },
    async ({ keyword, prefectureCode, hits }) => {
      try {
        const hotels = await searchRakutenTravel({ keyword, prefectureCode, hits });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ keyword, count: hotels.length, hotels }, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text", text: `検索に失敗しました: ${message}` }],
        };
      }
    }
  );
}
