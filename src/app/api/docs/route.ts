import { NextResponse } from "next/server";

import { getDocsDocuments } from "@/shared/server/docs-data";

export async function GET() {
  return NextResponse.json({ documents: getDocsDocuments() });
}
