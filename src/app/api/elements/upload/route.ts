import { NextResponse } from "next/server";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { detectMediaType, uploadElementFile } from "@/lib/element-storage";
import { slugify } from "@/lib/slug";
import { ElementKind } from "@prisma/client";

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customName = formData.get("name") as string | null;
    const category = (formData.get("category") as string | null) || "my-uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const originalFilename = file.name;
    const ext = path.extname(originalFilename);
    const mediaInfo = detectMediaType(ext);

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileSize = buffer.length;

    // Upload to Supabase Storage or local fallback
    const fileUrl = await uploadElementFile({
      userId: user.id,
      buffer,
      filename: originalFilename,
      mimeType: mediaInfo.mimeType,
    });

    const displayName = (customName?.trim() || path.basename(originalFilename, ext))
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const baseSlug = slugify(displayName);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create element owned by this creator
    const element = await prisma.templateElement.create({
      data: {
        slug,
        name: displayName,
        kind: mediaInfo.kind as ElementKind,
        category: category.toLowerCase(),
        description: `Uploaded ${mediaInfo.format} element by ${user.name || user.email}`,
        default_props: {
          url: fileUrl,
          format: mediaInfo.format,
          mediaType: mediaInfo.mediaType,
          originalName: originalFilename,
        },
        file_url: fileUrl,
        file_format: mediaInfo.format,
        file_size: fileSize,
        media_type: mediaInfo.mediaType,
        owner_user_id: user.id,
        is_active: true,
        is_pro_only: false,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      element,
      message: `${mediaInfo.format} element uploaded successfully!`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to upload element";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
