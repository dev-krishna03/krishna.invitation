import Link from "next/link";
import { Sparkles, Heart, Shield, Award, CheckCircle2, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-stone-200/80 bg-stone-900 text-stone-300">
      {/* Trust bar */}
      <div className="border-b border-stone-800/80 bg-stone-950/60 py-6">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-stone-100">Handcrafted Royalty</p>
                <p className="text-[11px] text-stone-400">Bespoke animations & audio</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-stone-100">Instant WhatsApp RSVP</p>
                <p className="text-[11px] text-stone-400">Real-time guest tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Shield className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-stone-100">Private & Secure</p>
                <p className="text-[11px] text-stone-400">Optional PIN protection</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <Award className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-stone-100">14+ Indian Languages</p>
                <p className="text-[11px] text-stone-400">Hindi, Gujarati & more</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-rose-700 text-white shadow-md shadow-rose-950/40">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                Krishna<span className="text-rose-500">.</span>invitation
              </span>
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-stone-400 max-w-sm">
              Honoring India’s timeless traditions and modern celebrations. Craft interactive,
              multilingual digital wedding & event invitations with musical ambiance, Google Maps,
              and seamless WhatsApp RSVPs.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs text-stone-400">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-rose-400" />
                <span>support@krishnainvites.com</span>
              </div>
            </div>
          </div>

          {/* Occasions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Occasions
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/gallery" className="hover:text-stone-100 transition-colors">
                  Weddings & Sangeet
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-stone-100 transition-colors">
                  Ring Ceremony & Roka
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-stone-100 transition-colors">
                  Gruh Vastu & Housewarming
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-stone-100 transition-colors">
                  Godh Bharai / Baby Shower
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-stone-100 transition-colors">
                  1st Birthday & Milestones
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-stone-100 transition-colors">
                  Pooja & Cultural Festivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Product & Studio */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Studio
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/gallery" className="hover:text-stone-100 transition-colors">
                  Template Gallery
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-stone-100 transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/try/royal-elegance" className="hover:text-stone-100 transition-colors">
                  Live Royal Preview
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-stone-100 transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-stone-100 transition-colors">
                  Help & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Enterprise */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Account
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/login" className="hover:text-stone-100 transition-colors">
                  Host Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-stone-100 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/company" className="hover:text-stone-100 transition-colors">
                  Event Planners / Agency
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-stone-100 transition-colors">
                  Host Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Krishna Invitations Studio. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 inline" />
            <span>for heartfelt celebrations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
