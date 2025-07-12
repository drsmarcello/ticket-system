// frontend/src/app/admin/page.tsx
"use client";

import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import AdminTabNavigation from "../../components/admin/adminTabLayout";
import {
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const adminCards = [
  {
    name: "Benutzerverwaltung",
    description: "Benutzer erstellen, bearbeiten und verwalten",
    href: "/admin/users",
    icon: UsersIcon,
    color: "bg-blue-500",
    stats: "Alle Systembenutzer",
  },
  {
    name: "Audit Logs",
    description: "Sicherheitsereignisse und System-Aktivitäten",
    href: "/admin/logs", 
    icon: DocumentTextIcon,
    color: "bg-green-500",
    stats: "Live-Tracking aktiv",
  },
  {
    name: "Statistiken",
    description: "System-Performance und Nutzungsstatistiken",
    href: "/admin/stats",
    icon: ChartBarIcon,
    color: "bg-purple-500",
    stats: "Echtzeit-Daten",
  },
  {
    name: "Systemeinstellungen",
    description: "Globale Konfiguration und Einstellungen",
    href: "/admin/settings",
    icon: Cog6ToothIcon,
    color: "bg-orange-500",
    stats: "Systemkonfiguration",
  },
];

export default function AdminPage() {
  const { user } = useAuth();

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Berechtigung
        </h3>
        <p className="text-gray-600 mb-4">
          Nur Administratoren können auf diesen Bereich zugreifen.
        </p>
        <Link href="/dashboard" className="btn-primary">
          Zurück zum Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Tab Navigation */}
      <AdminTabNavigation />
      
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Willkommen im Admin-Bereich
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Verwalten Sie hier alle Aspekte des Ticket-Systems. 
                  Wählen Sie einen Bereich aus, um zu beginnen.
                </p>
              </div>
            </div>
            <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {adminCards.map((card) => (
          <Link
            key={card.name}
            href={card.href}
            className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className={`rounded-lg inline-flex p-3 ring-4 ring-white ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                <span className="absolute inset-0" aria-hidden="true" />
                {card.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {card.description}
              </p>
              <div className="mt-3 text-sm font-medium text-gray-600">
                {card.stats}
              </div>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              <ArrowRightIcon className="h-6 w-6" />
            </span>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            System-Übersicht
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ System Online
                </span>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Version</dt>
              <dd className="mt-1 text-sm text-gray-900">v1.0.0</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Letzte Aktualisierung</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date().toLocaleDateString('de-DE')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}