import { NextResponse } from "next/server";

import { blogPosts } from "@/shared/lib/app-data/app-logic";

export async function GET() {
  return NextResponse.json({ posts: blogPosts });
}
