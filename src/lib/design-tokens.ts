// Shared design tokens so every new flow screen uses the same palette.
// The palette is Stone / Rose / Amber — warm, ceremonial, premium.

export const palette = {
  // Primary surfaces
  surface: "bg-white",
  surfaceMuted: "bg-stone-50",
  surfaceInset: "bg-stone-100",
  border: "border-stone-200",
  borderMuted: "border-stone-200/60",

  // Text
  heading: "text-stone-900",
  body: "text-stone-700",
  muted: "text-stone-500",
  subtle: "text-stone-400",

  // Primary brand (rose + amber gradient)
  brand: "bg-gradient-to-r from-rose-600 to-amber-600",
  brandHover: "hover:brightness-105",
  brandText: "text-rose-700",
  brandSoft: "bg-rose-50 text-rose-700 border-rose-200",

  // Accents
  amberSoft: "bg-amber-50 text-amber-800 border-amber-200",
  emeraldSoft: "bg-emerald-50 text-emerald-800 border-emerald-200",
  skySoft: "bg-sky-50 text-sky-800 border-sky-200",

  // Status
  success: "text-emerald-700 bg-emerald-50 border-emerald-200",
  warning: "text-amber-700 bg-amber-50 border-amber-200",
  danger: "text-rose-700 bg-rose-50 border-rose-200",

  // Shadows + radii
  radius: "rounded-2xl",
  radiusSm: "rounded-xl",
  shadow: "shadow-md shadow-rose-900/5",
  shadowHover: "hover:shadow-xl hover:shadow-rose-900/10",

  // Transitions
  transition: "transition-all duration-200 ease-out",
} as const;

// Flow-step palette: one color per step in the diagram so the user can
// follow the path at a glance.
export const flowStep = {
  create: {
    bg: "bg-gradient-to-br from-rose-50 to-amber-50",
    border: "border-rose-200",
    icon: "text-rose-700",
    chip: "bg-rose-100 text-rose-800",
  },
  explore: {
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    border: "border-amber-200",
    icon: "text-amber-700",
    chip: "bg-amber-100 text-amber-800",
  },
  library: {
    bg: "bg-gradient-to-br from-sky-50 to-indigo-50",
    border: "border-sky-200",
    icon: "text-sky-700",
    chip: "bg-sky-100 text-sky-800",
  },
  share: {
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    icon: "text-emerald-700",
    chip: "bg-emerald-100 text-emerald-800",
  },
  payment: {
    bg: "bg-gradient-to-br from-stone-50 to-stone-100",
    border: "border-stone-300",
    icon: "text-stone-700",
    chip: "bg-stone-200 text-stone-800",
  },
} as const;
