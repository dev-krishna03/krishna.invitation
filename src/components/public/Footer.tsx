import Link from "next/link";
import { Sparkles, Heart, Shield, Award, CheckCircle2, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#24075F] bg-[#12042F] text-stone-300">
      {/* Trust bar */}
      <div className="border-b border-[#24075F]/80 bg-[#12042F] py-6">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6520EE]/20 text-[#BDA0F8]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Digital Web Invites</p>
                <p className="text-[11px] text-stone-400">Interactive music & stories</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6520EE]/20 text-[#BDA0F8]">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">WhatsApp Guest Links</p>
                <p className="text-[11px] text-stone-400">Personalised per guest</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6520EE]/20 text-[#BDA0F8]">
                <Shield className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Live RSVP Headcount</p>
                <p className="text-[11px] text-stone-400">Zero guest login needed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6520EE]/20 text-[#BDA0F8]">
                <Award className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Pay by Days Validity</p>
                <p className="text-[11px] text-stone-400">Extend anytime later</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-[1120px] px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6520EE] text-white shadow-sm shadow-[#6520EE]/40">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                krishna<span className="text-[#6520EE]">.</span>invites
              </span>
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-[#948B9E] max-w-sm">
              Create a beautiful digital web invitation for your wedding and celebrations in minutes.
              Send personalized WhatsApp links with music, Google Maps directions, and 1-tap RSVPs.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs text-[#948B9E]">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#E5D9FC]" />
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
                <Link href="/affiliates" className="hover:text-stone-100 transition-colors text-[#BDA0F8]">
                  Affiliate Partner Program
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
        <div className="mt-12 border-t border-[#24075F] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} krishna.invites. Digital website invites.</p>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-[#BDA0F8] text-[#BDA0F8] inline" />
            <span>for heartfelt celebrations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
