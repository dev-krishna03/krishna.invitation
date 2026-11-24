import { prisma } from "@/lib/prisma";
import { ElementsAdmin } from "./ElementsAdmin";

export default async function AdminElementsPage() {
  const elements = await prisma.templateElement.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ created_at: "desc" }],
  });

  return (
    <main className="p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#12042F]">All Elements &amp; Creator Uploads</h1>
        <p className="mt-1 text-sm text-[#7A7387]">
          Super Admin directory of all platform elements and creator-uploaded media across all formats:
          SVG, PNG, JPG/JPEG, GIF, MP4, MOV, WebM, MP3, M4A, WAV.
        </p>
      </div>
      <div className="mt-6">
        <ElementsAdmin
          initial={elements.map((e) => ({
            id: e.id,
            slug: e.slug,
            name: e.name,
            kind: e.kind,
            category: e.category,
            icon: e.icon,
            description: e.description,
            default_props: e.default_props as Record<string, unknown>,
            file_url: e.file_url,
            file_format: e.file_format,
            file_size: e.file_size,
            media_type: e.media_type,
            owner_user_id: e.owner_user_id,
            owner: e.owner,
            is_pro_only: e.is_pro_only,
            is_active: e.is_active,
            sort_order: e.sort_order,
            created_at: e.created_at.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}
