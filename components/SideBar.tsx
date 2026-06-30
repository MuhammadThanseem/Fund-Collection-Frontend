"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome, FiUsers, FiDollarSign, FiBarChart2,
  FiHelpCircle, FiLogOut, FiMap, FiPlus, FiX,
} from "react-icons/fi";
import { MdOutlineCampaign } from "react-icons/md";
import { clearToken } from "@/lib/auth.storage";

const navItems = [
  { label: "Overview",    href: "/admin",             icon: FiHome },
  { label: "Branches",    href: "/admin/areas",       icon: FiMap },
  { label: "Collectors",  href: "/admin/collectors",  icon: FiUsers },
  { label: "Collections", href: "/admin/collections", icon: FiDollarSign },
  { label: "Customers",   href: "/admin/customers",   icon: MdOutlineCampaign },
  { label: "Reports",     href: "/admin/reports",     icon: FiBarChart2 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleSignOut = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed left-0 top-0 h-full w-56 flex flex-col bg-[#003527] z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6cf8bb] flex items-center justify-center flex-shrink-0">
                <FiDollarSign className="text-[#003527] text-lg" />
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-tight">AIC Fund Collection</p>
                <p className="text-[#6cf8bb] text-[11px] font-medium tracking-wide">
                  Orphan Care Fund
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* User badge */}
        <div className="mx-3 mt-4 mb-1 px-3 py-2.5 bg-white/8 rounded-xl border border-white/10">
          <p className="text-white text-sm font-bold leading-tight">AIC Admin</p>
          <p className="text-[#6cf8bb] text-[11px] font-semibold uppercase tracking-widest mt-0.5">
            Orphan Care Fund
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`text-lg flex-shrink-0 transition-colors ${
                    active ? "text-[#6cf8bb]" : ""
                  }`}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-3 border-t border-white/10 pt-3 space-y-0.5 flex-shrink-0">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:bg-white/10 hover:text-white transition-colors"
          >
            <FiHelpCircle className="text-lg flex-shrink-0" />
            Help Center
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:bg-white/10 hover:text-white transition-colors"
          >
            <FiLogOut className="text-lg flex-shrink-0" />
            Sign Out
          </button>
        </div>

        {/* New Initiative CTA */}
        <div className="px-3 pb-5 flex-shrink-0">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6cf8bb] text-[#003527] rounded-xl text-sm font-bold hover:bg-[#4edea3] active:scale-[0.98] transition-all duration-150 shadow-lg shadow-[#6cf8bb]/20">
            <FiPlus className="text-base" />
            New Campaign
          </button>
        </div>
      </aside>
    </>
  );
}
