import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CustomRequestsHub } from "@/components/dashboard/CustomRequestsHub";

export const metadata = {
  title: "Request a Design & Creator Bids • Krishna Invitations",
};

export default async function CustomRequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/custom-requests");

  return <CustomRequestsHub currentUserId={user.id} />;
}
