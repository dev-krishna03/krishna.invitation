import { getSetting } from "@/lib/settings";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Sparkles, Heart, Globe, Award, ShieldCheck, TreePine, Music } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us • Krishna Invitations",
  description: "Learn how Krishna Invitations helps families and event creators craft immersive, eco-friendly digital celebrations.",
};

export default async function AboutPage() {
  const name = (await getSetting<string>("site_name")) ?? "Krishna Invitations";
  const customAbout = await getSetting<string>("about_content");

  return (
    <PublicPageShell>
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Our Vision & Heritage</span>
            </div>
            <h1 className="mt-4 font-serif text-3xl font-bold sm:text-5xl text-stone-900">
              Honoring Sacred Traditions with Modern Elegance
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              We believe every Indian celebration—from a sacred Gruh Vastu to a magnificent Big Fat
              Indian Wedding—deserves an invitation that feels as heartfelt, joyful, and regal as the
              celebration itself.
            </p>
          </div>
        </Reveal>

        {/* Stats Grid */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 text-center shadow-sm">
            <div className="font-serif text-3xl font-bold text-rose-700">50,000+</div>
            <div className="mt-1 text-xs text-stone-500 font-medium">Invites Sent</div>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 text-center shadow-sm">
            <div className="font-serif text-3xl font-bold text-amber-600">1.2M+</div>
            <div className="mt-1 text-xs text-stone-500 font-medium">RSVPs Tracked</div>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 text-center shadow-sm">
            <div className="font-serif text-3xl font-bold text-emerald-700">100%</div>
            <div className="mt-1 text-xs text-stone-500 font-medium">Paper Saved</div>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 text-center shadow-sm">
            <div className="font-serif text-3xl font-bold text-stone-800">14+</div>
            <div className="mt-1 text-xs text-stone-500 font-medium">Languages</div>
          </div>
        </div>

        {/* Story Section */}
        <div className="mt-14 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed rounded-3xl border border-stone-200/80 bg-white p-8 sm:p-12 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Why We Built {name}
          </h2>
          <p>
            {customAbout ??
              "For generations, Indian wedding and festive invitations were mailed on intricate paper cards with mithai boxes. While beautiful, they often got lost in transit, lacked interactive maps, and left hosts in the dark about how many guests were actually attending."}
          </p>
          <p>
            We set out to preserve everything families love about traditional invites—the auspicious
            mantras, sacred fonts, royal motifs, and ceremonial music—while empowering hosts with
            the conveniences of modern technology: instant WhatsApp delivery, 1-tap Google Maps
            navigation, photo galleries, and real-time RSVP management.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 pt-6 border-t border-stone-100">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                <Music className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-stone-900">Soulful Musical Ambiance</h3>
                <p className="mt-1 text-xs text-stone-500">
                  Every card comes alive with celebratory shehnai, sitar, or your personalized audio tracks.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <TreePine className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-stone-900">Sustainable & Eco-Friendly</h3>
                <p className="mt-1 text-xs text-stone-500">
                  Zero paper waste, zero carbon shipping, and 100% elegant digital delivery.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div className="mt-14 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-rose-900/15 hover:brightness-105 transition-all"
          >
            <span>Explore Designs & Start Free</span>
            <Sparkles className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>
    </PublicPageShell>
  );
}
