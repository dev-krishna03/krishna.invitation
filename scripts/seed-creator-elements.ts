import { PrismaClient, ElementKind } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding creator elements across all requested formats...");

  // Find creators
  const rahul = await prisma.user.findFirst({ where: { email: "rahul.d@example.com" } });
  const pooja = await prisma.user.findFirst({ where: { email: "pooja.s@example.com" } });
  const aarav = await prisma.user.findFirst({ where: { email: "demo@krishnaweddings.com" } });

  if (!rahul || !pooja || !aarav) {
    console.error("Creators not found in DB! Ensure users exist.");
    return;
  }

  const sampleElements = [
    // SVG (Vector)
    {
      slug: "royal-mandap-vector",
      name: "Royal Mandap Arch Vector",
      kind: ElementKind.MOTIF,
      category: "vectors",
      description: "Handcrafted golden mandap architectural vector silhouette",
      file_url: "https://raw.githubusercontent.com/feathericons/feather/master/icons/sun.svg",
      file_format: "SVG",
      file_size: 4210,
      media_type: "VECTOR",
      owner_user_id: rahul.id,
      is_active: true,
      default_props: { color: "#d97706", width: 120, height: 120 },
    },
    {
      slug: "vedic-kalash-vector",
      name: "Sacred Vedic Kalash Vector",
      kind: ElementKind.MOTIF,
      category: "vectors",
      description: "Auspicious coconut and mango leaf kalash vector emblem",
      file_url: "https://raw.githubusercontent.com/feathericons/feather/master/icons/award.svg",
      file_format: "SVG",
      file_size: 3890,
      media_type: "VECTOR",
      owner_user_id: pooja.id,
      is_active: true,
      default_props: { color: "#881337", width: 100, height: 100 },
    },

    // PNG (Image)
    {
      slug: "marigold-garland-transparent",
      name: "Marigold Floral Garland PNG",
      kind: ElementKind.IMAGE,
      category: "florals",
      description: "High-resolution transparent PNG of vibrant yellow and orange marigolds",
      file_url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
      file_format: "PNG",
      file_size: 245000,
      media_type: "IMAGE",
      owner_user_id: aarav.id,
      is_active: true,
      default_props: { width: 300, height: 150 },
    },

    // JPG/JPEG (Image)
    {
      slug: "udaipur-palace-backdrop",
      name: "Udaipur Palace Courtyard JPG",
      kind: ElementKind.IMAGE,
      category: "backdrops",
      description: "Warm royal palace courtyard bathed in evening lighting",
      file_url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
      file_format: "JPG",
      file_size: 512000,
      media_type: "IMAGE",
      owner_user_id: rahul.id,
      is_active: true,
      default_props: { width: 800, height: 600 },
    },

    // GIF (Image / Animation)
    {
      slug: "sparkling-golden-dust-gif",
      name: "Sparkling Golden Dust Loop GIF",
      kind: ElementKind.IMAGE,
      category: "particles",
      description: "Looping gold dust sparkle animation overlay",
      file_url: "https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif",
      file_format: "GIF",
      file_size: 890000,
      media_type: "IMAGE",
      owner_user_id: pooja.id,
      is_active: true,
      default_props: { loop: true },
    },

    // MP4 (Video)
    {
      slug: "grand-baraat-cinematic-mp4",
      name: "Grand Baraat Cinematic Teaser MP4",
      kind: ElementKind.VIDEO,
      category: "videos",
      description: "4K royal baraat celebration video highlight teaser",
      file_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      file_format: "MP4",
      file_size: 4200000,
      media_type: "VIDEO",
      owner_user_id: aarav.id,
      is_active: true,
      default_props: { duration: 15, resolution: "1080p" },
    },

    // MOV (Video)
    {
      slug: "wedding-invitation-reveal-mov",
      name: "Golden Card Unfolding Reveal MOV",
      kind: ElementKind.VIDEO,
      category: "videos",
      description: "ProRes alpha wedding invitation box opening motion graphic",
      file_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
      file_format: "MOV",
      file_size: 6100000,
      media_type: "VIDEO",
      owner_user_id: rahul.id,
      is_active: true,
      default_props: { duration: 12, alpha: true },
    },

    // WEBM (Video)
    {
      slug: "rose-petals-falling-webm",
      name: "Rose Petals Shower Loop WebM",
      kind: ElementKind.VIDEO,
      category: "videos",
      description: "Transparent WebM shower of auspicious red rose petals",
      file_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      file_format: "WEBM",
      file_size: 1950000,
      media_type: "VIDEO",
      owner_user_id: pooja.id,
      is_active: true,
      default_props: { transparent: true, loop: true },
    },

    // MP3 (Audio)
    {
      slug: "kudmayi-shehnai-mp3",
      name: "Royal Shehnai & Dholki Beats MP3",
      kind: ElementKind.MUSIC,
      category: "audio",
      description: "Traditional live recorded shehnai melody with acoustic dholki rhythm",
      file_url: "/audio/presets/shehnai-wedding.wav",
      file_format: "MP3",
      file_size: 3100000,
      media_type: "AUDIO",
      owner_user_id: aarav.id,
      is_active: true,
      default_props: { duration: 180, bitrate: "320kbps" },
    },

    // M4A (Audio)
    {
      slug: "shubh-vivah-mantra-m4a",
      name: "Vedic Mangalashtak Chants M4A",
      kind: ElementKind.MUSIC,
      category: "audio",
      description: "Sacred Sanskrit wedding mantras chanted by Kashi priests in AAC audio",
      file_url: "/audio/presets/shubh-mangalam.wav",
      file_format: "M4A",
      file_size: 2600000,
      media_type: "AUDIO",
      owner_user_id: pooja.id,
      is_active: true,
      default_props: { duration: 140, bitrate: "256kbps" },
    },

    // WAV (Audio)
    {
      slug: "sacred-temple-chimes-wav",
      name: "Sacred Temple Chimes Lossless WAV",
      kind: ElementKind.MUSIC,
      category: "audio",
      description: "Uncompressed 24-bit 96kHz acoustic temple chimes and sitar strums",
      file_url: "/audio/presets/sacred-chimes.wav",
      file_format: "WAV",
      file_size: 7800000,
      media_type: "AUDIO",
      owner_user_id: rahul.id,
      is_active: true,
      default_props: { duration: 95, lossless: true },
    },
  ];

  for (const item of sampleElements) {
    const existing = await prisma.templateElement.findUnique({ where: { slug: item.slug } });
    if (!existing) {
      await prisma.templateElement.create({
        data: item,
      });
      console.log(`Created element: ${item.name} (${item.file_format}) by user ${item.owner_user_id}`);
    } else {
      await prisma.templateElement.update({
        where: { slug: item.slug },
        data: item,
      });
      console.log(`Updated element: ${item.name} (${item.file_format})`);
    }
  }

  console.log("Creator elements seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
