import { NextResponse } from "next/server";

import { getProjectSections } from "@/shared/server/docs-data";

export async function GET() {
  return NextResponse.json({ sections: getProjectSections() });
}
