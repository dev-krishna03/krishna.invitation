import { prisma } from "@/lib/prisma";

export interface PlatformFeeConfig {
  fee_percentage: number;
  calculate_on_base_price: boolean;
  min_fee_inr?: number;
  description?: string;
}

export const DEFAULT_PLATFORM_FEE_CONFIG: PlatformFeeConfig = {
  fee_percentage: 10,
  calculate_on_base_price: true,
  min_fee_inr: 0,
  description: "Platform fee is 10% calculated on template base price. Creator absorbs discount.",
};

export async function getPlatformFeeConfig(): Promise<PlatformFeeConfig> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "platform_fee_config" },
    });
    if (!setting || !setting.value || typeof setting.value !== "object") {
      return DEFAULT_PLATFORM_FEE_CONFIG;
    }
    const val = setting.value as Partial<PlatformFeeConfig>;
    return {
      fee_percentage: typeof val.fee_percentage === "number" ? val.fee_percentage : DEFAULT_PLATFORM_FEE_CONFIG.fee_percentage,
      calculate_on_base_price: typeof val.calculate_on_base_price === "boolean" ? val.calculate_on_base_price : true,
      min_fee_inr: typeof val.min_fee_inr === "number" ? val.min_fee_inr : 0,
      description: val.description || DEFAULT_PLATFORM_FEE_CONFIG.description,
    };
  } catch {
    return DEFAULT_PLATFORM_FEE_CONFIG;
  }
}

export interface SplitCalculationParams {
  basePrice: number;
  discountAmount?: number;
  feePercentage?: number;
  calculateOnBasePrice?: boolean;
  whatsappMsgCount?: number;
  whatsappCostPerMsg?: number;
}

export interface SplitCalculationResult {
  basePrice: number;
  discountAmount: number;
  hostPayAmount: number;
  feePercentage: number;
  platformFee: number;
  whatsappFeeDeducted: number;
  creatorReceives: number;
  calculateOnBasePrice: boolean;
  creatorAbsorbedDiscount: number;
}

export function computeTemplateSplit({
  basePrice,
  discountAmount = 0,
  feePercentage = 10,
  calculateOnBasePrice = true,
  whatsappMsgCount = 0,
  whatsappCostPerMsg = 1, // ₹1 / msg Meta WhatsApp Cloud API utility charge
}: SplitCalculationParams): SplitCalculationResult {
  const safeBase = Math.max(0, Math.round(basePrice));
  const safeDiscount = Math.min(safeBase, Math.max(0, Math.round(discountAmount)));
  const hostPayAmount = Math.max(0, safeBase - safeDiscount);

  // Platform fee is calculated on base price (default 10% on ₹500 = ₹50)
  const feeBase = calculateOnBasePrice ? safeBase : hostPayAmount;
  const platformFee = Math.round((feeBase * feePercentage) / 100);

  // WhatsApp Meta Cloud API message delivery cost charged to creator
  const whatsappFeeDeducted = Math.max(0, Math.round(whatsappMsgCount * whatsappCostPerMsg));

  // Creator absorbs the discount & WhatsApp delivery cost:
  // hostPayAmount (₹375) - platformFee (₹50) - whatsappFeeDeducted = creatorReceives
  const creatorReceives = Math.max(0, hostPayAmount - platformFee - whatsappFeeDeducted);

  return {
    basePrice: safeBase,
    discountAmount: safeDiscount,
    hostPayAmount,
    feePercentage,
    platformFee,
    whatsappFeeDeducted,
    creatorReceives,
    calculateOnBasePrice,
    creatorAbsorbedDiscount: safeDiscount,
  };
}
