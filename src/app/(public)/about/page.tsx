import { getSetting } from "@/lib/settings";

export default async function AboutPage() {
  const name = (await getSetting<string>("site_name")) ?? "Invitation Platform";
  const about = (await getSetting<string>("about_content")) ??
    "We help families and companies create beautiful, multi-language digital invitations for every occasion.";
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold">About {name}</h1>
      <p className="mt-6 text-gray-700 leading-relaxed">{about}</p>
    </main>
  );
}
