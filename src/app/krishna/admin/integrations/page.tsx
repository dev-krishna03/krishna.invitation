import { IntegrationsManagementView } from "@/components/admin/IntegrationsManagementView";

export const metadata = {
  title: "Brevo & Third-Party Service Credentials • Super Admin",
};

export default function AdminIntegrationsPage() {
  return (
    <main className="p-6 sm:p-8 max-w-7xl mx-auto">
      <IntegrationsManagementView />
    </main>
  );
}
