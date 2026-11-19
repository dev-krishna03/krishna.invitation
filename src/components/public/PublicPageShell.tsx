import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-stone-900 selection:bg-rose-200 selection:text-rose-900">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
