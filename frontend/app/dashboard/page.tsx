"use client";

import { useAuth } from "../../contexts/AuthContext";
import {
  useDashboard,
  useMyAssignedTickets,
  useDashboardStats,
} from "../../hooks/useDashboard";
import StatusBadge from "../../components/ui/StatusBadge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate } from "../../utils/dateUtils";
import Link from "next/link";
import {
  TicketIcon,
  ClockIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useDashboard();
  const { data: myTicketsData } = useMyAssignedTickets();
  const { data: statsData } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Fehler beim Laden der Dashboard-Daten: {error.message}
      </div>
    );
  }

  const tickets = data?.tickets || [];
  const myAssignedTickets = myTicketsData?.myAssignedTickets || [];
  const allTickets = statsData?.tickets || [];

  const activeTickets = allTickets.filter(
    (t: any) => t.status !== "CLOSED" && t.status !== "COMPLETED",
  );

  const stats = {
    total: activeTickets.length,
    new: activeTickets.filter((t: any) => t.status === "NEW").length,
    inProgress: activeTickets.filter((t: any) => t.status === "IN_PROGRESS")
      .length,
    urgent: activeTickets.filter((t: any) => t.priority === "URGENT").length,
    myAssigned: myAssignedTickets.filter(
      (t: any) => t.status !== "CLOSED" && t.status !== "COMPLETED",
    ).length,
  };

  const getStatCards = () => {
    const baseCards = [
      {
        title: "Offene Tickets",
        value: stats.total,
        icon: TicketIcon,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        trend: "",
        link: "/tickets",
      },
    ];

    if (user?.role !== "CUSTOMER") {
      baseCards.push(
        {
          title: "Neue Tickets",
          value: stats.new,
          icon: ExclamationTriangleIcon,
          color: "text-green-600",
          bgColor: "bg-green-100",
          trend: stats.new > 5 ? "Hohe Aktivität" : "Normal",
          link: `/tickets?status=NEW`,
        },
        {
          title: "In Bearbeitung",
          value: stats.inProgress,
          icon: ClockIcon,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          trend: `${Math.round((stats.inProgress / stats.total) * 100) || 0}% der Tickets`,
          link: `/tickets?status=IN_PROGRESS`,
        },
        {
          title: "Dringend",
          value: stats.urgent,
          icon: ClockIcon,
          color: "text-red-600",
          bgColor: "bg-red-100",
          trend: stats.urgent > 0 ? "Sofortige Aufmerksamkeit!" : "Alles gut",
          link: `/tickets?priority=URGENT`,
        },
      );
    }

    if (user?.role === "EMPLOYEE" || user?.role === "ADMIN") {
      baseCards.push({
        title: "Mir zugewiesen",
        value: stats.myAssigned,
        icon: UsersIcon,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        trend: stats.myAssigned > 0 ? "Arbeit wartet!" : "Frei",
        link: `/tickets?assigned=me`,
      });
    }

    return baseCards;
  };

  const statCards = getStatCards();

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Willkommen zurück, {user?.name}! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {user?.role === "CUSTOMER"
            ? "Hier ist eine Übersicht über Ihre offenen Tickets."
            : "Hier ist eine Übersicht über die aktuellen Aktivitäten."}
        </p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                    <dd className="text-xs text-gray-500 mt-1">{card.trend}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Meine zugewiesenen Tickets */}
        {(user?.role === "EMPLOYEE" || user?.role === "ADMIN") && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Meine zugewiesenen Tickets
                </h3>
                <Link
                  href="/tickets?assigned=me"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Alle anzeigen →
                </Link>
              </div>
              {myAssignedTickets.length > 0 ? (
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {myAssignedTickets.slice(0, 5).map((ticket: any) => (
                      <li key={ticket.id} className="py-4">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="block hover:bg-gray-50 rounded p-2 -m-2"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {ticket.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(ticket.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <StatusBadge status={ticket.status} size="sm" />
                              <PriorityBadge
                                priority={ticket.priority}
                                size="sm"
                              />
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                  <p className="text-gray-500 text-sm mt-2">
                    Keine zugewiesenen Tickets
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Neueste/Meine Tickets */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {user?.role === "CUSTOMER"
                  ? "Meine Tickets"
                  : "Neueste Tickets"}
              </h3>
              <Link
                href="/tickets"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Alle anzeigen →
              </Link>
            </div>
            {tickets.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {tickets.slice(0, 5).map((ticket: any) => (
                    <li key={ticket.id} className="py-4">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="block hover:bg-gray-50 rounded p-2 -m-2"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {ticket.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {ticket.company?.name} •{" "}
                              {formatDate(ticket.createdAt)}
                            </p>
                            {ticket.assignedTo && (
                              <p className="text-xs text-gray-400">
                                Zugewiesen an: {ticket.assignedTo.name}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <StatusBadge status={ticket.status} size="sm" />
                            <PriorityBadge
                              priority={ticket.priority}
                              size="sm"
                            />
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-6">
                <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-500 text-sm mt-2">
                  Keine Tickets vorhanden.
                </p>
                <Link href="/tickets/new" className="btn-primary mt-4">
                  Erstes Ticket erstellen
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status (für Admins) */}
      {user?.role === "ADMIN" && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              System Status / Dummy Daten
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    API Status: Online
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Uptime: 99.9%
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-800">
                    Aktive Benutzer: {stats.total > 0 ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
