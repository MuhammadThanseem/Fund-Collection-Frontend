import Sidebar from "@/components/SideBar";
import Topbar from "@/components/TopBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 flex h-screen">
      <Sidebar role="manager" userName="Alex Johnson" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}