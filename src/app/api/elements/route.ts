import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbUserId: string | null = null;
  if (user) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    const dbUser = await prisma.user.findFirst({
      where: isUuid ? { OR: [{ id: user.id }, { email: user.email }] } : { email: user.email },
      select: { id: true },
    });
    if (dbUser) dbUserId = dbUser.id;
  } else {
    const demo = await prisma.user.findFirst({
      where: {
        OR: [
          { email: "demo@krishnaweddings.com" },
          { email: "demo@invites.local" },
        ],
      },
      select: { id: true },
    });
    if (demo) dbUserId = demo.id;
  }

  const elements = await prisma.templateElement.findMany({
    where: {
      is_active: true,
      OR: [
        { owner_user_id: null }, // Platform default elements
        ...(dbUserId ? [{ owner_user_id: dbUserId }] : []), // Creator's own elements
      ],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ category: "asc" }, { sort_order: "asc" }],
  });

  return NextResponse.json({ elements });
}
