import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { uniqueSuffix } from "./slug";

export const SUPPORTED_ELEMENT_FORMATS = [
  "SVG",
  "PNG",
  "JPG",
  "JPEG",
  "GIF",
  "MP4",
  "MOV",
  "WEBM",
  "MP3",
  "M4A",
  "WAV",
] as const;

export type SupportedElementFormat = (typeof SUPPORTED_ELEMENT_FORMATS)[number];

const BUCKET_NAME = "elements";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("placeholder.supabase.co")) {
    return null;
  }
  return createSupabaseClient(url, key);
}

export function detectMediaType(ext: string): {
  format: string;
  mediaType: "VECTOR" | "IMAGE" | "VIDEO" | "AUDIO";
  kind: "MOTIF" | "IMAGE" | "VIDEO" | "MUSIC";
  mimeType: string;
} {
  const cleanExt = ext.toLowerCase().replace(/^\./, "");
  switch (cleanExt) {
    case "svg":
      return { format: "SVG", mediaType: "VECTOR", kind: "MOTIF", mimeType: "image/svg+xml" };
    case "png":
      return { format: "PNG", mediaType: "IMAGE", kind: "IMAGE", mimeType: "image/png" };
    case "jpg":
    case "jpeg":
      return { format: "JPG", mediaType: "IMAGE", kind: "IMAGE", mimeType: "image/jpeg" };
    case "gif":
      return { format: "GIF", mediaType: "IMAGE", kind: "IMAGE", mimeType: "image/gif" };
    case "mp4":
      return { format: "MP4", mediaType: "VIDEO", kind: "VIDEO", mimeType: "video/mp4" };
    case "mov":
      return { format: "MOV", mediaType: "VIDEO", kind: "VIDEO", mimeType: "video/quicktime" };
    case "webm":
      return { format: "WEBM", mediaType: "VIDEO", kind: "VIDEO", mimeType: "video/webm" };
    case "mp3":
      return { format: "MP3", mediaType: "AUDIO", kind: "MUSIC", mimeType: "audio/mpeg" };
    case "m4a":
      return { format: "M4A", mediaType: "AUDIO", kind: "MUSIC", mimeType: "audio/mp4" };
    case "wav":
      return { format: "WAV", mediaType: "AUDIO", kind: "MUSIC", mimeType: "audio/wav" };
    default:
      throw new Error(`Unsupported element format: .${cleanExt}. Supported: SVG, PNG, JPG/JPEG, GIF, MP4, MOV, WebM, MP3, M4A, WAV`);
  }
}

export async function uploadElementFile({
  userId,
  buffer,
  filename,
  mimeType,
}: {
  userId: string;
  buffer: Buffer;
  filename: string;
  mimeType: string;
}): Promise<string> {
  const ext = path.extname(filename).toLowerCase().replace(/^\./, "") || "png";
  const uniqueName = `${userId}/${Date.now()}-${uniqueSuffix()}.${ext}`;

  // Try Supabase Storage first
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.some((b) => b.name === BUCKET_NAME)) {
        await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      }

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uniqueName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(uniqueName);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (e) {
      console.warn("Supabase Storage upload warning, falling back to local:", e);
    }
  }

  // Fallback to local persistent storage: public/uploads/elements/<userId>/
  const localDir = path.join(process.cwd(), "public", "uploads", "elements", userId);
  fs.mkdirSync(localDir, { recursive: true });
  const localFileName = `${Date.now()}-${uniqueSuffix()}.${ext}`;
  const localFilePath = path.join(localDir, localFileName);
  fs.writeFileSync(localFilePath, buffer);

  return `/uploads/elements/${userId}/${localFileName}`;
}
