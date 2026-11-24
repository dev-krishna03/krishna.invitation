import { AdminCouponsView } from "@/components/admin/AdminCouponsView";

export const metadata = {
  title: "Advanced Coupons & Discounts Engine • Super Admin",
};

export default function AdminCouponsPage() {
  return (
    <main className="p-6 sm:p-8 max-w-7xl mx-auto">
      <AdminCouponsView />
    </main>
  );
}
