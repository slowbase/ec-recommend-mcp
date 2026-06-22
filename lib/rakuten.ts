/**
 * 楽天市場 商品検索API (IchibaItem/Search) のラッパー。
 * @see https://webservice.rakuten.co.jp/documentation/ichiba-item-search
 */

// 楽天市場商品検索APIは 2026-04-01 版で applicationId に加え accessKey が必須になり、
// エンドポイントも openapi.rakuten.co.jp に変更された。
const ENDPOINT =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";

/** MCPツールが返す、整形済みの商品データ。 */
export type RakutenItem = {
  itemName: string;
  itemPrice: number;
  /** アフィリエイトIDがあればアフィリエイトリンク、なければ通常の商品URL。 */
  affiliateUrl: string;
  imageUrl: string | null;
  shopName: string;
};

export type SearchRakutenItemsParams = {
  keyword: string;
  /** 取得件数 (1-30)。デフォルト10。 */
  hits?: number;
};

/** 楽天APIの生レスポンス（必要なフィールドのみ）。 */
type RakutenApiResponse = {
  Items?: { Item: RakutenApiItem }[];
  error?: string;
  error_description?: string;
};

type RakutenApiItem = {
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  affiliateUrl: string;
  shopName: string;
  mediumImageUrls?: { imageUrl: string }[];
};

export async function searchRakutenItems({
  keyword,
  hits = 10,
}: SearchRakutenItemsParams): Promise<RakutenItem[]> {
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  // 2026-04-01版APIは Origin/Referer が登録Application URLと一致することを要求する。
  const appUrl = process.env.RAKUTEN_APP_URL;

  if (!appId) {
    throw new Error("環境変数 RAKUTEN_APP_ID が設定されていません。");
  }
  if (!accessKey) {
    throw new Error("環境変数 RAKUTEN_ACCESS_KEY が設定されていません。");
  }
  if (!appUrl) {
    throw new Error(
      "環境変数 RAKUTEN_APP_URL（楽天に登録したApplication URL）が設定されていません。"
    );
  }

  const params = new URLSearchParams({
    applicationId: appId,
    accessKey,
    keyword,
    hits: String(Math.min(Math.max(hits, 1), 30)),
    format: "json",
  });
  if (affiliateId) {
    params.set("affiliateId", affiliateId);
  }

  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: {
      Origin: appUrl,
      Referer: appUrl.endsWith("/") ? appUrl : `${appUrl}/`,
    },
  });
  const data = (await res.json()) as RakutenApiResponse;

  if (!res.ok || data.error) {
    const detail = data.error_description ?? data.error ?? `HTTP ${res.status}`;
    throw new Error(`楽天APIエラー: ${detail}`);
  }

  return (data.Items ?? []).map(({ Item }) => ({
    itemName: Item.itemName,
    itemPrice: Item.itemPrice,
    affiliateUrl: Item.affiliateUrl || Item.itemUrl,
    imageUrl: Item.mediumImageUrls?.[0]?.imageUrl ?? null,
    shopName: Item.shopName,
  }));
}
