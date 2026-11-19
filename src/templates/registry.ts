import type { ComponentType } from "react";
import type { TemplateConfig, TemplateProps } from "@/types/template";

import royalConfig from "./royal-elegance/config.json";
import royalPreview from "./royal-elegance/preview-data.json";
import RoyalEleganceTemplate from "./royal-elegance/component";

import minimalConfig from "./minimal-love/config.json";
import minimalPreview from "./minimal-love/preview-data.json";
import MinimalLoveTemplate from "./minimal-love/component";

export type RegisteredTemplate = {
  slug: string;
  config: TemplateConfig;
  preview: Record<string, unknown>;
  Component: ComponentType<TemplateProps>;
};

export const templates: Record<string, RegisteredTemplate> = {
  "royal-elegance": {
    slug: "royal-elegance",
    config: royalConfig as TemplateConfig,
    preview: royalPreview as Record<string, unknown>,
    Component: RoyalEleganceTemplate,
  },
  "minimal-love": {
    slug: "minimal-love",
    config: minimalConfig as TemplateConfig,
    preview: minimalPreview as Record<string, unknown>,
    Component: MinimalLoveTemplate,
  },
};

export function getTemplate(slug: string): RegisteredTemplate | null {
  return templates[slug] ?? null;
}

export function listTemplates(): RegisteredTemplate[] {
  return Object.values(templates);
}
