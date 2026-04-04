"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { sidebarMenu, UserRole } from "@/constants/sidebarMenu";

interface SidebarProps {
  role: UserRole;
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  const allowedMenu = sidebarMenu.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="w-64 bg-white border-r p-5 flex flex-col">
      <h1 className="text-xl font-bold text-green-600 mb-8">
        FundCollect
      </h1>

      <nav className="space-y-2">
        {allowedMenu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition",
                pathname === item.href
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 text-sm text-gray-500">
        {userName}
        <br />
        <span className="text-xs capitalize">{role} Account</span>
      </div>
    </aside>
  );
}