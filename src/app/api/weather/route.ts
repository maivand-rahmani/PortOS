import { NextResponse } from "next/server";

import { createWeatherSnapshot } from "@/shared/lib/app-logic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "Berlin";

  return NextResponse.json({ weather: createWeatherSnapshot(city) });
}
