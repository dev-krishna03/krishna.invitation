"use client";

import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/motion/Reveal";
import {
  MessageSquare,
  Music,
  MapPin,
  Globe2,
  Users,
  ShieldCheck,
  CalendarCheck,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "1-Click WhatsApp Delivery",
    desc: "Send personalized invitation cards directly to guests on WhatsApp with custom preview graphics and names.",
    color: "from-emerald-500/10 to-emerald-500/5 text-emerald-700",
  },
  {
    icon: Users,
    title: "Real-Time RSVP Tracker",
    desc: "Track headcount, plus-ones, meal preferences, and heartfelt wishes in a live host dashboard.",
    color: "from-rose-500/10 to-rose-500/5 text-rose-700",
  },
  {
    icon: Music,
    title: "Celebratory Audio Ambiance",
    desc: "Embed shehnai, sitar, flute, or your favorite romantic melody to play seamlessly as guests open the card.",
    color: "from-amber-500/10 to-amber-500/5 text-amber-700",
  },
  {
    icon: MapPin,
    title: "Google Maps Venue Guidance",
    desc: "Help guests reach venues on time with integrated 1-tap navigation for every sub-event venue.",
    color: "from-rose-500/10 to-rose-500/5 text-rose-700",
  },
  {
    icon: Globe2,
    title: "14+ Indian & Global Languages",
    desc: "English, Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, Punjabi, and international translations.",
    color: "from-blue-500/10 to-blue-500/5 text-blue-700",
  },
  {
    icon: ShieldCheck,
    title: "Private & Passcode Protected",
    desc: "Keep your celebration confidential. Require a passcode or direct personalized link to access.",
    color: "from-amber-500/10 to-amber-500/5 text-amber-700",
  },
];

export function FeaturesSection() {
  return (
    <div className="mt-10">
      <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm hover:border-amber-300 hover:shadow-xl hover:shadow-rose-950/5 transition-all"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} border border-stone-100 group-hover:scale-105 transition-transform`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                {f.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">{f.desc}</p>
            </motion.div>
          );
        })}
      </Stagger>
    </div>
  );
}
