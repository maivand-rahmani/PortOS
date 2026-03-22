import { NextResponse } from "next/server";

import { blogPosts } from "@/shared/lib/app-logic";

export async function GET() {
  return NextResponse.json({ posts: blogPosts });
}
