/**
 * 楽天トラベル 簡易宿泊施設検索API のラッパー。
 * @see https://webservice.rakuten.co.jp/documentation/simple-hotel-search
 */

const ENDPOINT =
  "https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426";

export type RakutenTravelHotel = {
  hotelName: string;
  hotelKanaName: string | null;
  address: string;
  /** アフィリエイトIDがあればアフィリエイトリンク、なければ通常URL。 */
  affiliateUrl: string;
  hotelImageUrl: string | null;
  /** 最安料金（1泊あたり）。取得できない場合はnull。 */
  hotelMinCharge: number | null;
  reviewAverage: number | null;
};

export type SearchRakutenTravelParams = {
  keyword: string;
  /** 都道府県コード (例: "13" = 東京都)。省略可。 */
  prefectureCode?: string;
  /** 取得件数 (1-30)。デフォルト10。 */
  hits?: number;
};

type RakutenTravelApiResponse = {
  hotels?: { hotel: RakutenTravelApiHotel[] }[];
  error?: string;
  error_description?: string;
};

type RakutenTravelApiHotel = {
  hotelBasicInfo?: {
    hotelName: string;
    hotelKanaName: string;
    address1: string;
    address2: string;
    hotelInformationUrl: string;
    affiliateUrl: string;
    hotelImageUrl: string | null;
    hotelMinCharge: number | null;
    reviewAverage: number | null;
  };
};

export async function searchRakutenTravel({
  keyword,
  prefectureCode,
  hits = 10,
}: SearchRakutenTravelParams): Promise<RakutenTravelHotel[]> {
  const appId = process.env.RAKUTEN_APP_ID;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!appId) {
    throw new Error("環境変数 RAKUTEN_APP_ID が設定されていません。");
  }

  const params = new URLSearchParams({
    applicationId: appId,
    keyword,
    hits: String(Math.min(Math.max(hits, 1), 30)),
    format: "json",
    formatVersion: "2",
  });
  if (affiliateId) {
    params.set("affiliateId", affiliateId);
  }
  if (prefectureCode) {
    params.set("prefectureCode", prefectureCode);
  }

  const res = await fetch(`${ENDPOINT}?${params.toString()}`);
  const data = (await res.json()) as RakutenTravelApiResponse;

  if (!res.ok || data.error) {
    const detail = data.error_description ?? data.error ?? `HTTP ${res.status}`;
    throw new Error(`楽天トラベルAPIエラー: ${detail}`);
  }

  return (data.hotels ?? []).flatMap(({ hotel }) =>
    hotel
      .map((h) => h.hotelBasicInfo)
      .filter((info): info is NonNullable<typeof info> => info != null)
      .map((info) => ({
        hotelName: info.hotelName,
        hotelKanaName: info.hotelKanaName || null,
        address: `${info.address1}${info.address2}`,
        affiliateUrl: info.affiliateUrl || info.hotelInformationUrl,
        hotelImageUrl: info.hotelImageUrl,
        hotelMinCharge: info.hotelMinCharge,
        reviewAverage: info.reviewAverage,
      }))
  );
}
