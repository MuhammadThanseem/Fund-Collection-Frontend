// constants/sidebarMenu.ts
import { BsFilePerson } from "react-icons/bs";
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiMap,
} from "react-icons/fi";

export type UserRole = "admin" | "manager" | "staff";

export const sidebarMenu = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: FiHome,
    roles: ["admin", "manager", "staff"],
  },
  {
    name: "Areas",
    href: "/admin/areas",
    icon: FiMap,
    roles: ["admin", "manager", "staff"],
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: FiUsers,
    roles: ["admin", "manager"],
  },
    {
    name: "Collectors",
    href: "/admin/collectors",
    icon: BsFilePerson,
    roles: ["admin", "manager", "staff"],
  },
  {
    name: "Collections",
    href: "/admin/collections",
    icon: FiDollarSign,
    roles: ["admin", "manager", "staff"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FiBarChart2,
    roles: ["admin"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: FiSettings,
    roles: ["admin"],
  },
  {
    name: "Support",
    href: "/support",
    icon: FiHelpCircle,
    roles: ["admin", "manager", "staff"],
  },
];
