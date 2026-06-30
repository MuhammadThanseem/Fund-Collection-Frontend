"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome, FiUsers, FiDollarSign, FiSettings,
  FiHelpCircle, FiLogOut, FiPlus, FiX, FiMenu, FiBell,
} from "react-icons/fi";
import { clearToken } from "@/lib/auth.storage";

const navItems = [
  { label: "Dashboard",   href: "/collector",             icon: FiHome },
  { label: "Customers",   href: "/collector/customers",   icon: FiUsers },
  { label: "Collections", href: "/collector/collections", icon: FiDollarSign },
  { label: "Settings",    href: "/collector/settings",    icon: FiSettings },
];

function CollectorSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/collector" ? pathname === "/collector" : pathname.startsWith(href);

  const handleSignOut = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 h-full w-52 flex flex-col bg-[#003527] z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">AIC Admin</p>
              <p className="text-[#6cf8bb] text-[11px] font-semibold uppercase tracking-widest mt-0.5">
                Orphan Care Fund
              </p>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10">
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className={`text-lg flex-shrink-0 ${active ? "text-[#6cf8bb]" : ""}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3 border-t border-white/10 pt-3 space-y-0.5 flex-shrink-0">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:bg-white/10 hover:text-white transition-colors">
            <FiHelpCircle className="text-lg" />Help Center
          </a>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:bg-white/10 hover:text-white transition-colors">
            <FiLogOut className="text-lg" />Sign Out
          </button>
        </div>

        <div className="px-3 pb-5 flex-shrink-0">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6cf8bb] text-[#003527] rounded-xl text-sm font-bold hover:bg-[#4edea3] transition-all shadow-lg shadow-[#6cf8bb]/20">
            <FiPlus className="text-base" />New Campaign
          </button>
        </div>
      </aside>
    </>
  );
}

export default function CollectorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <CollectorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 lg:left-52 h-14 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100 flex items-center px-4 lg:px-6 gap-3">
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="lg:hidden flex-shrink-0 p-1.5 text-slate-500 hover:text-[#003527] hover:bg-slate-50 rounded-lg transition-colors"
        >
          <FiMenu className="text-xl" />
        </button>
        <span className="text-[#003527] font-bold text-sm tracking-tight">AIC Fund Collection</span>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {[
            { label: "Dashboard", href: "/collector" },
            { label: "Causes",    href: "/collector/customers" },
            { label: "Impact",    href: "/collector/collections" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-[#003527] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />
        <button className="relative p-1.5 text-slate-500 hover:text-[#003527] hover:bg-slate-50 rounded-lg transition-colors">
          <FiBell className="text-lg" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#006c49] rounded-full ring-1 ring-white" />
        </button>
        <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-amber-600/20">
          C
        </div>
      </header>

      <main className="ml-0 lg:ml-52 pt-14 min-h-screen transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
