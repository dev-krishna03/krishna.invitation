import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

// GET: List open requests (for creators) or requests created by current user
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "mine" or "all"

    const where = filter === "mine" ? { host_user_id: user.id } : { status: "OPEN" };

    const requests = await prisma.customDesignRequest.findMany({
      where,
      include: {
        host: { select: { id: true, name: true, email: true } },
        bids: {
          include: { creator: { select: { id: true, name: true, email: true } } },
          orderBy: { created_at: "desc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch custom requests" }, { status: 500 });
  }
}

// POST: Host creates a new custom request
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    const { title, event_type, description, budget, deadline } = body;

    if (!title || !description || !budget) {
      return NextResponse.json({ error: "Title, description and budget are required" }, { status: 400 });
    }

    const request = await prisma.customDesignRequest.create({
      data: {
        host_user_id: user.id,
        title,
        event_type: event_type || "wedding",
        description,
        budget: Number(budget),
        currency: "INR",
        deadline: deadline ? new Date(deadline) : null,
        status: "OPEN",
      },
    });

    return NextResponse.json({ ok: true, request });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create custom request" }, { status: 500 });
  }
}
