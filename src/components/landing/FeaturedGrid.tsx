"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

type Item = { id: string; slug: string; name: string; from?: { price: number; days: number } };

export function FeaturedGrid({ items }: { items: Item[] }) {
  return (
    <Stagger className="mt-6 grid gap-5 sm:grid-cols-3">
      {items.map((t) => (
        <motion.div key={t.id} variants={staggerItem}>
          <TiltCard>
            <Link href={`/try/${t.slug}`} className="block">
              <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-amber-100 via-rose-200 to-fuchsia-200" />
              <h3 className="mt-3 font-semibold">{t.name}</h3>
              {t.from && (
                <p className="text-sm text-gray-500">
                  From ₹{t.from.price} / {t.from.days} days
                </p>
              )}
            </Link>
          </TiltCard>
        </motion.div>
      ))}
    </Stagger>
  );
}
