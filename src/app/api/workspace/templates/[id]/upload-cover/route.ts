import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { uploadElementFile } from "@/lib/element-storage";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const template = await prisma.template.findUnique({ where: { id } });

  // Only the creator owner or admin can update the template cover
  if (!template || (template.owner_user_id !== user.id && user.role !== "COMPANY_ADMIN")) {
    return NextResponse.json({ error: "Template not found or unauthorized" }, { status: 404 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let coverUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const directUrl = formData.get("thumbnail_url") as string | null;

      if (directUrl) {
        coverUrl = directUrl.trim();
      } else if (file) {
        const originalName = file.name || "cover.png";
        const ext = path.extname(originalName).toLowerCase() || ".png";
        const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".webm"];
        if (!allowedExts.includes(ext)) {
          return NextResponse.json(
            { error: "Invalid format. Supported: PNG, JPG, JPEG, SVG, WebP, GIF, WebM" },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        try {
          coverUrl = await uploadElementFile({
            userId: user.id,
            buffer,
            filename: `template-cover-${id}-${originalName}`,
            mimeType: file.type || "image/png",
          });
        } catch {
          // Local fallback write directly to /public/uploads/templates
          const uploadDir = path.join(process.cwd(), "public", "uploads", "templates");
          await fs.mkdir(uploadDir, { recursive: true });
          const filename = `${id}-${Date.now()}${ext}`;
          const filePath = path.join(uploadDir, filename);
          await fs.writeFile(filePath, buffer);
          coverUrl = `/uploads/templates/${filename}`;
        }
      }
    } else {
      const body = await req.json().catch(() => ({}));
      coverUrl = body.thumbnail_url?.trim() || body.preview_url?.trim() || null;
    }

    if (!coverUrl) {
      return NextResponse.json({ error: "No image file or URL provided" }, { status: 400 });
    }

    const updated = await prisma.template.update({
      where: { id },
      data: {
        thumbnail_url: coverUrl,
        preview_url: coverUrl,
      },
    });

    return NextResponse.json({
      ok: true,
      thumbnail_url: updated.thumbnail_url,
      preview_url: updated.preview_url,
      template: updated,
      message: "Template view image updated successfully!",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to upload template view image";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
