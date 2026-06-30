"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBell, FiSettings, FiSearch } from "react-icons/fi";

const topNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Analytics", href: "/admin/reports" },
  { label: "Impact",    href: "/admin/areas" },
];

export default function TopBar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-56 right-0 h-14 z-30 bg-white border-b border-slate-100 flex items-center px-6 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div>
          <span className="text-[#003527] font-bold text-sm tracking-tight block leading-tight">
            AIC Fund Collection
          </span>
          <span className="text-[#006c49] text-[11px] leading-tight block">
            Orphan Care Fund
          </span>
        </div>
      </div>

      {/* Top nav */}
      <nav className="flex items-center gap-1 ml-4">
        {topNav.map(({ label, href }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                active
                  ? "text-[#003527] border-b-2 border-[#003527] rounded-none"
                  : "text-slate-500 hover:text-[#003527]"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-xs ml-auto">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003527]/20 focus:border-[#003527]/30 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-3 shrink-0">
        <button className="relative p-1.5 text-slate-500 hover:text-[#003527] hover:bg-slate-50 rounded-lg transition-colors">
          <FiBell className="text-lg" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#006c49] rounded-full"></span>
        </button>
        <button className="p-1.5 text-slate-500 hover:text-[#003527] hover:bg-slate-50 rounded-lg transition-colors">
          <FiSettings className="text-lg" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#003527] text-white flex items-center justify-center text-xs font-bold">
          IA
        </div>
      </div>
    </header>
  );
}
