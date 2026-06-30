"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome, FiUsers, FiDollarSign, FiBarChart2,
  FiHelpCircle, FiLogOut, FiMap, FiPlus,
} from "react-icons/fi";
import { MdOutlineCampaign } from "react-icons/md";
import { clearToken } from "@/lib/auth.storage";

const navItems = [
  { label: "Overview",    href: "/admin",              icon: FiHome },
  { label: "Branches",    href: "/admin/areas",        icon: FiMap },
  { label: "Collectors",  href: "/admin/collectors",   icon: FiUsers },
  { label: "Collections", href: "/admin/collections",  icon: FiDollarSign },
  { label: "Customers",   href: "/admin/customers",    icon: MdOutlineCampaign },
  { label: "Reports",     href: "/admin/reports",      icon: FiBarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleSignOut = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-56 flex flex-col bg-[#003527] z-40">
      {/* Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#6cf8bb] flex items-center justify-center flex-shrink-0">
            <FiDollarSign className="text-[#003527] text-lg" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">AIC Fund</p>
            <p className="text-[#6cf8bb] text-[11px] font-medium">Orphan Care Fund</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`text-lg flex-shrink-0 ${active ? "text-[#6cf8bb]" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 space-y-0.5 border-t border-white/10 pt-3">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <FiHelpCircle className="text-lg" />
          Help Center
        </a>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <FiLogOut className="text-lg" />
          Sign Out
        </button>
      </div>

      {/* New Initiative */}
      <div className="px-3 pb-5">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6cf8bb] text-[#003527] rounded-lg text-sm font-bold hover:bg-[#4edea3] transition-colors">
          <FiPlus className="text-base" />
          New Initiative
        </button>
      </div>
    </aside>
  );
}
