import Sidebar from "@/components/SideBar";
import TopBar from "@/components/TopBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <Sidebar />
      <TopBar />
      <main className="ml-56 pt-14 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
