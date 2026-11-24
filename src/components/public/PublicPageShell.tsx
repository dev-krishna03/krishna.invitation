import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#12042F] selection:bg-[#F5F1FE] selection:text-[#6520EE]">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
