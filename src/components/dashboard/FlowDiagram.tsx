"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Compass, Library, Edit3, Share2, ShoppingBag, Users, CreditCard, ArrowRight } from "lucide-react";
import { flowStep } from "@/lib/design-tokens";

type Node = {
  id: string;
  label: string;
  caption?: string;
  href?: string;
  icon: React.ElementType;
  tone: keyof typeof flowStep;
};

const path1: Node[] = [
  { id: "create", label: "Create Invitation", caption: "Blank canvas or template", href: "/dashboard/create", icon: Sparkles, tone: "create" },
  { id: "detail", label: "Design in Detail", caption: "Events, guests, media", href: "/dashboard/create", icon: Edit3, tone: "create" },
  { id: "community", label: "Save or Share to Community", caption: "Publish to marketplace", href: "/dashboard/library", icon: Share2, tone: "share" },
];

const path2: Node[] = [
  { id: "explore", label: "Explore Templates", caption: "Community marketplace", href: "/community", icon: Compass, tone: "explore" },
  { id: "buy", label: "Buy Template", caption: "From a community creator", href: "/community", icon: ShoppingBag, tone: "explore" },
  { id: "pay1", label: "Payment", caption: "Secure checkout", icon: CreditCard, tone: "payment" },
];

const libraryEditPath: Node[] = [
  { id: "edit", label: "Edit", caption: "Personalize for your customer", icon: Edit3, tone: "library" },
  { id: "preview-confirm", label: "Share Preview for Confirmation", caption: "Customer reviews before paying", icon: Share2, tone: "share" },
  { id: "users", label: "Select User Access", caption: "e.g. 100 / 500 / unlimited", icon: Users, tone: "library" },
  { id: "pay2", label: "Payment", caption: "Charge your customer", icon: CreditCard, tone: "payment" },
  { id: "access", label: "Share Access", caption: "Customer-ready link", icon: Share2, tone: "share" },
];

const librarySharePath: Node[] = [
  { id: "preview-direct", label: "Share Preview", caption: "No approval step", icon: Share2, tone: "share" },
  { id: "link", label: "Generate Link", caption: "Short, trackable URL", icon: Share2, tone: "share" },
  { id: "share-direct", label: "Share", caption: "WhatsApp, email, link", icon: Share2, tone: "share" },
];

function NodeCard({ n }: { n: Node }) {
  const tone = flowStep[n.tone];
  const Icon = n.icon;
  const body = (
    <div className={`group relative flex h-full flex-col gap-2 rounded-xl border p-3 ${tone.bg} ${tone.border}`}>
      <div className="flex items-start gap-2">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/80 ${tone.icon}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold text-stone-900 leading-tight">{n.label}</p>
          {n.caption && <p className="mt-0.5 text-[10px] text-stone-600 leading-snug">{n.caption}</p>}
        </div>
      </div>
    </div>
  );
  return n.href ? (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="h-full">
      <Link href={n.href} className="block h-full">{body}</Link>
    </motion.div>
  ) : (
    <div className="h-full">{body}</div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-stone-400">
      <ArrowRight className="h-4 w-4" />
      {label && <span className="mt-0.5 text-[9px] font-medium text-stone-500">{label}</span>}
    </div>
  );
}

function PathRow({ nodes, label, color }: { nodes: Node[]; label: string; color: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
        <h4 className="text-[11px] font-bold uppercase tracking-wide text-stone-600">{label}</h4>
      </div>
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
        {nodes.map((n, i) => (
          <div key={n.id} className="flex items-stretch gap-2">
            <div className="min-w-[180px] max-w-[220px]">
              <NodeCard n={n} />
            </div>
            {i < nodes.length - 1 && <Arrow />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FlowDiagram() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900">Your Workflow</h3>
          <p className="mt-0.5 text-xs text-stone-500">
            Three ways to go from sign-in to a sent invitation.
          </p>
        </div>
        <Link
          href="/dashboard/library"
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
        >
          <Library className="h-3.5 w-3.5" />
          My Library
        </Link>
      </div>

      <div className="space-y-5">
        <PathRow nodes={path1} label="Path A — Create" color="bg-rose-500" />
        <PathRow nodes={path2} label="Path B — Buy from Community" color="bg-amber-500" />

        <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/40 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-stone-600">Path C — From Your Library</h4>
          </div>
          <div className="space-y-3">
            <PathRow nodes={libraryEditPath} label="For paying customers" color="bg-emerald-500" />
            <PathRow nodes={librarySharePath} label="Direct share" color="bg-indigo-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
