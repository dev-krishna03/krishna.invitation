"use client";

import {
  Heart,
  Gem,
  Cake,
  Baby,
  Home,
  Wine,
  Scissors,
  Flower2,
  Flower,
  Palette,
  Music2,
  Mic2,
  Briefcase,
  Flame,
  PartyPopper,
  Sparkles,
  Gift,
  Church,
  BookHeart,
  GraduationCap,
  Trophy,
  CalendarHeart,
  Star,
  Users,
  CircleDashed,
  type LucideIcon,
} from "lucide-react";

export const ICON_OPTIONS = [
  { name: "heart", Icon: Heart, hint: "Wedding, love" },
  { name: "gem", Icon: Gem, hint: "Engagement" },
  { name: "cake", Icon: Cake, hint: "Birthday" },
  { name: "baby", Icon: Baby, hint: "Baby shower, Namkaran" },
  { name: "home", Icon: Home, hint: "Housewarming, Gruh Vastu" },
  { name: "wine", Icon: Wine, hint: "Anniversary, Reception" },
  { name: "scissors", Icon: Scissors, hint: "Mundan, haircut" },
  { name: "flower", Icon: Flower2, hint: "Haldi, floral" },
  { name: "flower2", Icon: Flower, hint: "Mehndi, decor" },
  { name: "palette", Icon: Palette, hint: "Mehndi, art" },
  { name: "music", Icon: Music2, hint: "Sangeet, music" },
  { name: "mic", Icon: Mic2, hint: "Performance" },
  { name: "briefcase", Icon: Briefcase, hint: "Corporate" },
  { name: "flame", Icon: Flame, hint: "Pooja, diya" },
  { name: "party", Icon: PartyPopper, hint: "Festival, party" },
  { name: "sparkles", Icon: Sparkles, hint: "Other, misc" },
  { name: "gift", Icon: Gift, hint: "Gifting" },
  { name: "church", Icon: Church, hint: "Ceremony" },
  { name: "bookheart", Icon: BookHeart, hint: "Save-the-date" },
  { name: "graduation", Icon: GraduationCap, hint: "Graduation" },
  { name: "trophy", Icon: Trophy, hint: "Achievement" },
  { name: "calendar", Icon: CalendarHeart, hint: "Anniversary" },
  { name: "star", Icon: Star, hint: "Highlight" },
  { name: "users", Icon: Users, hint: "Gathering" },
] as const;

export type IconName = (typeof ICON_OPTIONS)[number]["name"];

const MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.name, o.Icon]),
);

export function EventIcon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name?: string | null;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = (name && MAP[name]) || CircleDashed;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
