import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-guard";
import path from "node:path";
import fs from "node:fs/promises";

export async function POST(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 20MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".mp3";
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase()
      .replace(ext, "");
    const fileName = `${Date.now()}-${safeName}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "audio", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/audio/uploads/${fileName}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      fileName,
      size: file.size,
      name: file.name,
    });
  } catch (err: unknown) {
    console.error("Audio upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload audio file" },
      { status: 500 }
    );
  }
}
