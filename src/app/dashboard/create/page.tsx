import { prisma } from "@/lib/prisma";
import { CreateWizard } from "./CreateWizard";

export default async function CreatePage() {
  const templates = await prisma.template.findMany({
    where: { is_active: true },
    include: { pricing: { where: { is_active: true }, orderBy: { duration_days: "asc" } } },
    orderBy: { sort_order: "asc" },
  });
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Create an Invitation</h1>
      <CreateWizard templates={templates} />
    </main>
  );
}
