"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBell, FiSettings, FiSearch, FiMenu } from "react-icons/fi";

const topNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Analytics",  href: "/admin/reports" },
  { label: "Impact",     href: "/admin/areas" },
];

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-56 h-14 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100 flex items-center px-4 lg:px-6 gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex-shrink-0 p-1.5 text-slate-500 hover:text-[#003527] hover:bg-slate-50 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <FiMenu className="text-xl" />
      </button>

      {/* Brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[#003527] font-bold text-sm tracking-tight block leading-none">
          AIC Fund Collection
        </span>
      </div>

      {/* Top nav — hidden on mobile */}
      <nav className="hidden md:flex items-center gap-0.5 ml-4">
        {topNav.map(({ label, href }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "text-[#003527] border-b-2 border-[#003527] pb-[5px]"
                  : "text-slate-500 hover:text-[#003527]"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search — hidden on small screens */}
      <div className="hidden sm:block w-48 lg:w-64">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#003527]/20 focus:border-[#003527]/30 placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link href="/admin/notifications" className="relative p-1.5 text-slate-500 hover:text-[#003527] hover:bg-slate-50 rounded-lg transition-colors">
          <FiBell className="text-lg" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#006c49] rounded-full ring-1 ring-white" />
        </Link>
        <Link href="/admin/settings" className="hidden sm:flex p-1.5 text-slate-500 hover:text-[#003527] hover:bg-slate-50 rounded-lg transition-colors">
          <FiSettings className="text-lg" />
        </Link>
        <div className="w-8 h-8 rounded-full bg-[#003527] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#003527]/10 ml-1">
          IA
        </div>
      </div>
    </header>
  );
}
