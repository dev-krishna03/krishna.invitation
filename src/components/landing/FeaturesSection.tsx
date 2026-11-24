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
  Smartphone,
  CalendarCheck,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "WhatsApp Personalised Links",
    desc: "Each guest receives an invitation tailored with their exact family name at the top of the webpage.",
  },
  {
    icon: Users,
    title: "Live RSVP & Guest Tracking",
    desc: "Guests RSVP in 1 tap without any login. Monitor confirmed guests, declines, and headcount live.",
  },
  {
    icon: Music,
    title: "Background Music & Ambiance",
    desc: "Add shehnai, royal flute, romantic sitar, or your custom song that plays smoothly on guest open.",
  },
  {
    icon: MapPin,
    title: "1-Tap Google Maps Navigation",
    desc: "Guests can tap directions for Haldi, Sangeet, Wedding, or Reception venues without getting lost.",
  },
  {
    icon: CalendarCheck,
    title: "Add to Calendar & Countdown",
    desc: "Real-time countdown timer to the celebration with 1-click Google / Apple Calendar event reminders.",
  },
  {
    icon: ShieldCheck,
    title: "Private & Edit Anytime",
    desc: "Make live updates anytime after publishing. Keep invitations private with optional passcode protection.",
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
              className="group rounded-3xl border border-[#E5D9FC]/70 bg-white p-6 shadow-sm hover:border-[#6520EE] hover:shadow-xl hover:shadow-[#6520EE]/10 transition-all"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F1FE] text-[#6520EE] border border-[#E5D9FC] group-hover:bg-[#6520EE] group-hover:text-white transition-all duration-200">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-[#12042F] group-hover:text-[#6520EE] transition-colors">
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
