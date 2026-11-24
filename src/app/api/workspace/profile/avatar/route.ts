import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { uploadElementFile } from "@/lib/element-storage";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar_url: true,
      role: true,
      created_at: true,
    },
  });

  return NextResponse.json({ ok: true, user: dbUser });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  try {
    const contentType = req.headers.get("content-type") || "";

    let avatarUrl: string | null = null;
    let displayName: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      displayName = formData.get("name") as string | null;
      const rawUrl = formData.get("avatar_url") as string | null;

      if (rawUrl) {
        avatarUrl = rawUrl.trim();
      } else if (file) {
        const originalName = file.name || "avatar.png";
        const ext = path.extname(originalName).toLowerCase() || ".png";
        const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"];
        if (!allowedExts.includes(ext)) {
          return NextResponse.json(
            { error: "Invalid format. Allowed: JPG, PNG, WebP, SVG, GIF" },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload using storage helper (Supabase or local public/uploads)
        try {
          avatarUrl = await uploadElementFile({
            userId: user.id,
            buffer,
            filename: `avatar-${originalName}`,
            mimeType: file.type || "image/png",
          });
        } catch {
          // Local fallback write directly to /public/uploads/avatars
          const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
          await fs.mkdir(uploadDir, { recursive: true });
          const filename = `${user.id}-${Date.now()}${ext}`;
          const filePath = path.join(uploadDir, filename);
          await fs.writeFile(filePath, buffer);
          avatarUrl = `/uploads/avatars/${filename}`;
        }
      }
    } else {
      const body = await req.json().catch(() => ({}));
      avatarUrl = body.avatar_url?.trim() || null;
      displayName = body.name?.trim() || null;
    }

    if (!avatarUrl && !displayName) {
      return NextResponse.json({ error: "No avatar image or name provided" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        ...(displayName ? { name: displayName } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar_url: true,
        role: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser,
      avatar_url: updatedUser.avatar_url,
      message: "Profile updated successfully!",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
