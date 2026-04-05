import { NextResponse } from "next/server";

import type { ContactSubmission } from "@/shared/lib/app-data/app-logic";
import { validateContactSubmission } from "@/shared/lib/app-data/app-logic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactSubmission;
    const result = validateContactSubmission(payload);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submission failed." },
      { status: 400 },
    );
  }
}
