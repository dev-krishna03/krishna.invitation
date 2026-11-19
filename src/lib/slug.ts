export function slugify(input: string, max = 60): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, max) || "invite"
  );
}

export function uniqueSuffix(len = 6): string {
  return Math.random().toString(36).slice(2, 2 + len);
}
