// frontend/src/components/admin/AdminTabNavigation.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  UsersIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const adminTabs = [
  {
    name: "Benutzer",
    href: "/admin/users",
    icon: UsersIcon,
  },
  {
    name: "Audit Logs", 
    href: "/admin/logs",
    icon: DocumentTextIcon,
  },
  {
    name: "Statistiken",
    href: "/admin/stats", 
    icon: ChartBarIcon,
  },
  {
    name: "Einstellungen",
    href: "/admin/settings",
    icon: Cog6ToothIcon,
  },
];

export default function AdminTabNavigation() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {adminTabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
            
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    isActive
                      ? "text-primary-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}