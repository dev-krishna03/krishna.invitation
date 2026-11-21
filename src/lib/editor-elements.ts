// Shared type + loader for the invitation editor's element palette.
// The editor was built with a hardcoded palette; this module lets it
// render whatever the super admin has configured without the editor
// needing to know what exists until runtime.

import { useEffect, useState } from "react";

export type EditorElement = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  category: string;
  icon: string | null;
  description: string | null;
  default_props: Record<string, unknown>;
  is_pro_only: boolean;
};

export function groupByCategory(elements: EditorElement[]): Record<string, EditorElement[]> {
  const out: Record<string, EditorElement[]> = {};
  for (const e of elements) {
    (out[e.category] ??= []).push(e);
  }
  return out;
}

export function useEditorPalette(): {
  loading: boolean;
  elements: EditorElement[];
  byCategory: Record<string, EditorElement[]>;
  error: string | null;
} {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/elements")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { elements: EditorElement[] }) => {
        if (!cancelled) setElements(d.elements);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, elements, byCategory: groupByCategory(elements), error };
}
