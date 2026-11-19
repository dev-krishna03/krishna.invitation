"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

type Item = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  fromPrice?: { price: number; days: number } | null;
};

export function GalleryGrid({ items }: { items: Item[] }) {
  return (
    <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
      {items.map((t) => (
        <motion.div key={t.id} variants={staggerItem}>
          <TiltCard>
            <div className="overflow-hidden rounded-xl">
              <motion.div
                className="aspect-[4/5] bg-gradient-to-br from-amber-100 via-rose-200 to-fuchsia-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-semibold">{t.name}</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{t.category}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{t.description}</p>
            {t.fromPrice && (
              <p className="mt-2 text-sm">
                From ₹{t.fromPrice.price} / {t.fromPrice.days} days
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                <Link href={`/try/${t.slug}`} className="block rounded-md border px-3 py-1.5 text-center text-sm">
                  Try
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                <Link
                  href={`/dashboard/create?template=${t.slug}`}
                  className="block rounded-md bg-black px-3 py-1.5 text-center text-sm text-white"
                >
                  Use
                </Link>
              </motion.div>
            </div>
          </TiltCard>
        </motion.div>
      ))}
    </Stagger>
  );
}
