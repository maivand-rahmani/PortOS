import { NextResponse } from "next/server";

import type { ContactSubmission } from "@/shared/lib/app-data/app-logic";
import { validateContactSubmission } from "@/shared/lib/app-data/app-logic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { website, ...submission } = body;

    // Honeypot check: if the hidden field is filled, silently reject with fake success
    if (typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json({
        ok: true,
        submittedAt: new Date().toISOString(),
      });
    }

    const result = validateContactSubmission(submission as ContactSubmission);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submission failed." },
      { status: 400 },
    );
  }
}
