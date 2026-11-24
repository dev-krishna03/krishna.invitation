// Shared design tokens inspired by Balcony Invites design language.
// The palette is Dusk Violet (#6520EE) / Midnight Dusk (#12042F) / Dawn Soft surfaces.

export const palette = {
  // Primary surfaces
  surface: "bg-white",
  surfaceMuted: "bg-[#FAF9FD]",
  surfaceInset: "bg-[#F5F1FE]",
  border: "border-[#E5D9FC]",
  borderMuted: "border-[#F5F1FE]",

  // Text
  heading: "text-[#12042F]",
  body: "text-[#5B556B]",
  muted: "text-[#7A7387]",
  subtle: "text-[#948B9E]",

  // Primary brand (Balcony Dusk-500)
  brand: "bg-[#6520EE] hover:bg-[#5213D2]",
  brandHover: "hover:bg-[#5213D2]",
  brandText: "text-[#6520EE]",
  brandSoft: "bg-[#F5F1FE] text-[#6520EE] border-[#E5D9FC]",

  // Accents
  amberSoft: "bg-[#FFF8EE] text-[#D97706] border-[#FDE68A]",
  emeraldSoft: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
  skySoft: "bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]",

  // Status
  success: "text-emerald-700 bg-emerald-50 border-emerald-200",
  warning: "text-amber-700 bg-amber-50 border-amber-200",
  danger: "text-rose-700 bg-rose-50 border-rose-200",

  // Shadows + radii
  radius: "rounded-3xl",
  radiusSm: "rounded-2xl",
  shadow: "shadow-sm shadow-[#6520EE]/5",
  shadowHover: "hover:shadow-lg hover:shadow-[#6520EE]/10",

  // Transitions
  transition: "transition-all duration-200 ease-out",
} as const;

// Flow-step palette: sleek Balcony Dusk/Dawn accents
export const flowStep = {
  create: {
    bg: "bg-[#F5F1FE]/80",
    border: "border-[#E5D9FC]",
    icon: "text-[#6520EE]",
    chip: "bg-[#E5D9FC] text-[#6520EE]",
  },
  explore: {
    bg: "bg-[#FFF8EE]/80",
    border: "border-[#FDE68A]",
    icon: "text-[#D97706]",
    chip: "bg-[#FEF3C7] text-[#B45309]",
  },
  library: {
    bg: "bg-[#F0F9FF]/80",
    border: "border-[#BAE6FD]",
    icon: "text-[#0284C7]",
    chip: "bg-[#E0F2FE] text-[#0369A1]",
  },
  share: {
    bg: "bg-[#F0FDF4]/80",
    border: "border-[#BBF7D0]",
    icon: "text-[#16A34A]",
    chip: "bg-[#DCFCE7] text-[#15803D]",
  },
  payment: {
    bg: "bg-[#FAF9FD]",
    border: "border-[#E5D9FC]",
    icon: "text-[#12042F]",
    chip: "bg-[#F5F1FE] text-[#12042F]",
  },
} as const;
