import { GatewaysManagementView } from "@/components/admin/GatewaysManagementView";

export const metadata = {
  title: "Payment Gateways & Razorpay Credentials • Super Admin",
};

export default function AdminGatewaysPage() {
  return (
    <main className="p-6 sm:p-8 max-w-7xl mx-auto">
      <GatewaysManagementView />
    </main>
  );
}
