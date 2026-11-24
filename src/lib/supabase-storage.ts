import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { uniqueSuffix } from "./slug";

const BUCKET_NAME = "guest-wishes";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("placeholder.supabase.co")) {
    return null;
  }
  return createSupabaseClient(url, key);
}

export async function uploadGuestWishPhoto({
  invitationId,
  base64OrBuffer,
  mimeType = "image/jpeg",
}: {
  invitationId: string;
  base64OrBuffer: string | Buffer;
  mimeType?: string;
}): Promise<string> {
  let buffer: Buffer;
  let ext = "jpg";

  if (typeof base64OrBuffer === "string") {
    // Handle data:image/png;base64,...
    const match = base64OrBuffer.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (match) {
      ext = match[1] === "jpeg" ? "jpg" : match[1];
      buffer = Buffer.from(match[2], "base64");
    } else {
      buffer = Buffer.from(base64OrBuffer, "base64");
    }
  } else {
    buffer = base64OrBuffer;
  }

  const filename = `${invitationId}/${Date.now()}-${uniqueSuffix()}.${ext}`;

  // Try Supabase Storage CDN first
  const supabase = getAdminClient();
  if (supabase) {
    try {
      // Ensure bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.some((b) => b.name === BUCKET_NAME)) {
        await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      }

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filename);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (e) {
      console.warn("Supabase Storage upload warning, falling back to local:", e);
    }
  }

  // Fallback to local storage in public/uploads/guest-wishes
  const localDir = path.join(process.cwd(), "public", "uploads", "guest-wishes", invitationId);
  fs.mkdirSync(localDir, { recursive: true });
  const localFileName = `${Date.now()}-${uniqueSuffix()}.${ext}`;
  const localFilePath = path.join(localDir, localFileName);
  fs.writeFileSync(localFilePath, buffer);

  return `/uploads/guest-wishes/${invitationId}/${localFileName}`;
}
