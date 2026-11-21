"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function BuyTemplateButton({
  templateId,
  price,
  currency,
}: {
  templateId: string;
  price: number;
  currency: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setState("loading");
    setError(null);
    const res = await fetch(`/api/community/templates/${templateId}/buy`, { method: "POST" });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed to purchase");
      setState("error");
      return;
    }
    const d = (await res.json()) as { templateId: string };
    setState("done");
    setTimeout(() => router.push(`/dashboard/templates/${d.templateId}/edit`), 600);
  }

  return (
    <div className="mt-4">
      <motion.button
        onClick={buy}
        disabled={state === "loading" || state === "done"}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 py-3 text-sm font-bold text-white shadow-md shadow-rose-900/15 hover:brightness-105 disabled:opacity-60"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : state === "done" ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Added to your workspace
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" />
            {price > 0 ? `Buy for ${currency === "INR" ? "₹" : currency}${price.toLocaleString()}` : "Add to workspace — free"}
          </>
        )}
      </motion.button>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
