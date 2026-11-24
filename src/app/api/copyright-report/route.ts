import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { template_id, reporter_name, reporter_email, proof_url, description } = body;

    if (!reporter_name || !reporter_email || !proof_url || !description) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const report = await prisma.copyrightReport.create({
      data: {
        template_id: template_id || null,
        reporter_name,
        reporter_email,
        proof_url,
        description,
        status: "PENDING",
        action_taken: "Submitted via public DMCA report portal. Under review by Super Admin.",
      },
    });

    return NextResponse.json({ ok: true, report });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit copyright report" }, { status: 500 });
  }
}
