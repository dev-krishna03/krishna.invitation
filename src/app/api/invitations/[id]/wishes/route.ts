import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadGuestWishPhoto } from "@/lib/supabase-storage";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const wishes = await prisma.guestWish.findMany({
      where: { invitation_id: id, is_approved: true },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ wishes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch wishes" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { author_name, message, photo_url, photo_base64, guest_id } = body;

    if (!author_name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }

    let finalPhotoUrl = photo_url || null;

    // Process photo upload to Supabase Storage Bucket if base64 provided
    if (photo_base64 && typeof photo_base64 === "string" && photo_base64.length > 50) {
      try {
        finalPhotoUrl = await uploadGuestWishPhoto({
          invitationId: id,
          base64OrBuffer: photo_base64,
        });
      } catch (err) {
        console.error("Photo upload error:", err);
      }
    }

    // Profanity / Abuse filtering
    const bannedWords = ["scam", "spam", "abuse", "hate", "fake"];
    const containsBanned = bannedWords.some((w) => message.toLowerCase().includes(w));

    const wish = await prisma.guestWish.create({
      data: {
        invitation_id: id,
        guest_id: guest_id || null,
        author_name,
        message,
        photo_url: finalPhotoUrl,
        is_approved: !containsBanned,
        is_flagged: containsBanned,
        flag_reason: containsBanned ? "Automated profanity / abuse dictionary match" : null,
      },
    });

    return NextResponse.json({
      ok: true,
      wish,
      moderated: containsBanned,
      message: containsBanned ? "Your wish is submitted and pending host review." : "Blessing posted!",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post wish" }, { status: 500 });
  }
}
