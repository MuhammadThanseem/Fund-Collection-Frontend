"use client";

import { useState } from "react";
import Sidebar from "@/components/SideBar";
import TopBar from "@/components/TopBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <TopBar onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <main className="ml-0 lg:ml-56 pt-14 min-h-screen transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
