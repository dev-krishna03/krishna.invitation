export type TemplateFieldType =
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "image"
  | "eventList"
  | "photoGallery"
  | "nameList"
  | "color"
  | "number"
  | "select";

export type TemplateField = {
  id: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export type TemplateSection = {
  id: string;
  title: string;
  fields: TemplateField[];
};

export type TemplateConfig = {
  slug: string;
  name: string;
  supportsEventTypes: string[]; // EventType values
  defaultLocale: string;
  music?: { defaultUrl?: string };
  sections: TemplateSection[];
};

export type InvitationData = Record<string, unknown>;

export type TemplateProps = {
  data: InvitationData;
  guestName?: string;
  isPreview?: boolean;
  isDemo?: boolean;
  locale?: string;
  mapApiKey?: string;
};
