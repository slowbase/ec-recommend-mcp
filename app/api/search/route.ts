import { NextRequest, NextResponse } from "next/server";
import { searchRakutenItems } from "@/lib/rakuten";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword") ?? "";
  const hits = Math.min(parseInt(req.nextUrl.searchParams.get("hits") ?? "3"), 10);

  if (!keyword) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  try {
    const items = await searchRakutenItems({ keyword, hits });
    return NextResponse.json({ items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
