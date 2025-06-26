"use client";

import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  TicketIcon,
  BuildingOfficeIcon,
  ClockIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      roles: ["ADMIN", "EMPLOYEE", "CUSTOMER"],
    },
    {
      name: "Tickets",
      href: "/tickets",
      icon: TicketIcon,
      roles: ["ADMIN", "EMPLOYEE", "CUSTOMER"],
    },
    {
      name: "Unternehmen",
      href: "/companies",
      icon: BuildingOfficeIcon,
      roles: ["ADMIN", "EMPLOYEE"],
    },
    {
      name: "Zeiterfassung",
      href: "/time-entries",
      icon: ClockIcon,
      roles: ["ADMIN", "EMPLOYEE"],
    },
    {
      name: "Administration",
      href: "/admin/users",
      icon: UsersIcon,
      roles: ["ADMIN"],
    },
    {
      name: "Einstellungen",
      href: "/settings",
      icon: Cog6ToothIcon,
      roles: ["ADMIN", "EMPLOYEE", "CUSTOMER"],
    },
  ];

  const filteredNavigation = navigation.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center h-16 px-4 bg-gray-900">
        <h1 className="text-white text-lg font-semibold">Ticket System</h1>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-300">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="ml-3 p-1 text-gray-400 hover:text-white"
              title="Abmelden"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
