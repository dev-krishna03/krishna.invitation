"use client";

import { motion } from "framer-motion";
import { Star, Heart, Quote } from "lucide-react";
import { Stagger, staggerItem } from "@/components/motion/Reveal";

const testimonials = [
  {
    name: "Rohan & Priyadarshini",
    event: "Destination Wedding • Udaipur",
    text: "Our guests were blown away by the shehnai music and multi-day ceremony schedule. We collected over 450 RSVPs with zero stress. It felt truly royal!",
    rating: 5,
  },
  {
    name: "Dr. Ananya & Kunal Patel",
    event: "Gruh Vastu & Housewarming • Ahmedabad",
    text: "Creating our Vastu Pooja invitation in Gujarati and English took just 5 minutes. The Google Maps venue integration made sure none of our elders got lost.",
    rating: 5,
  },
  {
    name: "Vikram & Neha Sharma",
    event: "Baby Shower (Godh Bharai) • Delhi",
    text: "The photo gallery and RSVP counter were so lovely. Everyone complimented how modern yet traditional the invitation looked on WhatsApp.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <div className="mt-10">
      <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-3" gap={0.1}>
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            whileHover={{ y: -4 }}
            className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm hover:border-amber-300 hover:shadow-xl hover:shadow-stone-900/5 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex text-amber-500">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <Quote className="h-5 w-5 text-stone-300" />
              </div>
              <p className="mt-4 text-xs italic leading-relaxed text-stone-700">
                "{t.text}"
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-stone-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-rose-200 font-serif font-bold text-rose-900 text-sm">
                {t.name[0]}
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-stone-900">{t.name}</h4>
                <p className="text-[11px] text-stone-500">{t.event}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </Stagger>
    </div>
  );
}
