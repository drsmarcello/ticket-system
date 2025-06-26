"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import {
  useTickets,
  useUsers,
  useCompaniesForTicket,
} from "../../hooks/useTickets";
import StatusBadge from "../../components/ui/StatusBadge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate } from "../../utils/dateUtils";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const statusOptions = [
  { value: "", label: "Alle Status", color: "text-gray-600" },
  { value: "NEW", label: "🆕 Neu", color: "text-blue-600" },
  {
    value: "IN_PROGRESS",
    label: "⚡ In Bearbeitung",
    color: "text-yellow-600",
  },
  {
    value: "WAITING_FOR_CUSTOMER",
    label: "⏳ Wartet auf Kunde",
    color: "text-orange-600",
  },
  { value: "COMPLETED", label: "Abgeschlossen", color: "text-green-600" },
  { value: "CLOSED", label: "Geschlossen", color: "text-gray-600" },
];

const priorityOptions = [
  { value: "", label: "Alle Prioritäten", color: "text-gray-600" },
  { value: "LOW", label: "Niedrig", color: "text-green-600" },
  { value: "MEDIUM", label: "Mittel", color: "text-blue-600" },
  { value: "HIGH", label: "Hoch", color: "text-orange-600" },
  { value: "URGENT", label: "Dringend", color: "text-red-600" },
];

type SortField =
  | "title"
  | "company"
  | "status"
  | "priority"
  | "assignedTo"
  | "createdAt";
type SortDirection = "asc" | "desc";

export default function TicketsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // URL params for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "",
  );
  const [priorityFilter, setPriorityFilter] = useState(
    searchParams.get("priority") || "",
  );
  const [companyFilter, setCompanyFilter] = useState(
    searchParams.get("company") || "",
  );
  const [assignedFilter, setAssignedFilter] = useState(
    searchParams.get("assigned") || "",
  );
  const [showClosed, setShowClosed] = useState(false);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [filters, setFilters] = useState({});

  useEffect(() => {
    const newFilters: any = {};

    if (statusFilter) {
      newFilters.status = statusFilter;
    }

    if (priorityFilter) {
      newFilters.priority = priorityFilter;
    }

    if (companyFilter) {
      newFilters.companyId = companyFilter;
    }

    if (assignedFilter) {
      if (assignedFilter === "unassigned") {
        newFilters.assignedToId = null;
      } else if (assignedFilter === "me" && user?.id) {
        newFilters.assignedToId = user.id;
      } else {
        newFilters.assignedToId = assignedFilter;
      }
    }

    setFilters(newFilters);
  }, [statusFilter, priorityFilter, companyFilter, assignedFilter, user?.id]);

  const { data, isLoading, error } = useTickets(filters, 100, 0);
  const { data: companiesData, isLoading: companiesLoading } =
    useCompaniesForTicket();
  const { data: usersData } = useUsers();

  if (isLoading || companiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <h3 className="text-lg font-medium mb-2">
          Fehler beim Laden der Tickets
        </h3>
        <p className="text-sm mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Seite neu laden
        </button>
      </div>
    );
  }

  const allTickets = data?.tickets || [];
  const companies = companiesData?.companies || [];
  const users =
    usersData?.users?.filter((u: any) => u.role !== "CUSTOMER") || [];

  let filteredTickets = allTickets;

  if (!showClosed) {
    filteredTickets = filteredTickets.filter(
      (ticket: any) =>
        ticket.status !== "CLOSED" && ticket.status !== "COMPLETED",
    );
  }

  if (searchTerm) {
    filteredTickets = filteredTickets.filter(
      (ticket: any) =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.contact.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  // Sorting
  const sortTickets = (tickets: any[]) => {
    return [...tickets].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "company":
          aValue = a.company.name.toLowerCase();
          bValue = b.company.name.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "priority":
          const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case "assignedTo":
          aValue = a.assignedTo?.name?.toLowerCase() || "zzz";
          bValue = b.assignedTo?.name?.toLowerCase() || "zzz";
          break;
        case "createdAt":
          aValue = new Date(parseInt(a.createdAt)).getTime();
          bValue = new Date(parseInt(b.createdAt)).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedTickets = sortTickets(filteredTickets);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  const clearAllFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setCompanyFilter("");
    setAssignedFilter("");
    setSearchTerm("");
  };

  const hasActiveFilters =
    statusFilter ||
    priorityFilter ||
    companyFilter ||
    assignedFilter ||
    searchTerm;

  const getActiveFilterSummary = () => {
    const filters = [];
    if (statusFilter) {
      const status = statusOptions.find((s) => s.value === statusFilter);
      filters.push(status?.label || statusFilter);
    }
    if (priorityFilter) {
      const priority = priorityOptions.find((p) => p.value === priorityFilter);
      filters.push(priority?.label || priorityFilter);
    }
    if (companyFilter) {
      const company = companies.find((c: any) => c.id === companyFilter);
      filters.push(`🏢 ${company?.name || companyFilter}`);
    }
    if (assignedFilter) {
      if (assignedFilter === "unassigned") {
        filters.push("👤 Nicht zugewiesen");
      } else if (assignedFilter === "me") {
        filters.push("👤 Mir zugewiesen");
      } else {
        const assignee = users.find((u) => u.id === assignedFilter);
        filters.push(`👤 ${assignee?.name || assignedFilter}`);
      }
    }
    if (searchTerm) {
      filters.push(`📝 "${searchTerm}"`);
    }
    return filters;
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="mt-1 text-sm text-gray-600">
            Verwalten Sie alle Support-Tickets
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/tickets/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Neues Ticket
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Tickets durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              {/* Status Filter */}
              <div className="sm:w-48">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="sm:w-48">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Priorität
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Filter - nur für Employee/Admin */}
              {user?.role !== "CUSTOMER" && (
                <div className="sm:w-48">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Unternehmen
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                  >
                    <option value="">Alle Unternehmen</option>
                    {companies.map((company: any) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Assignment Filter - nur für Employee/Admin */}
              {user?.role !== "CUSTOMER" && (
                <div className="sm:w-48">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Zugewiesen
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={assignedFilter}
                    onChange={(e) => setAssignedFilter(e.target.value)}
                  >
                    <option value="">Alle</option>
                    <option value="me">Mir zugewiesen</option>
                    <option value="unassigned">Nicht zugewiesen</option>
                    {users.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div>
                  <button
                    onClick={clearAllFilters}
                    className="btn-secondary flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Filter zurücksetzen
                  </button>
                </div>
              )}
            </div>

            {/* View Options */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-4">
                    Ansicht:
                  </span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={showClosed}
                      onChange={(e) => setShowClosed(e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Geschlossene/Abgeschlossene Tickets anzeigen
                    </span>
                  </label>
                </div>

                {!showClosed && (
                  <div className="text-xs text-gray-500">
                    {
                      allTickets.filter(
                        (t: any) =>
                          t.status === "CLOSED" || t.status === "COMPLETED",
                      ).length
                    }{" "}
                    geschlossene ausgeblendet
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FunnelIcon className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      Aktive Filter:
                    </span>
                    <div className="ml-2 flex flex-wrap gap-1">
                      {getActiveFilterSummary().map((filter, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {filter}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-blue-700">
                    {sortedTickets.length} von {allTickets.length} Tickets
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {sortedTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Ticket</span>
                        <SortIcon field="title" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("company")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Unternehmen/Kontakt</span>
                        <SortIcon field="company" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("priority")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Priorität</span>
                        <SortIcon field="priority" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("assignedTo")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Zugewiesen</span>
                        <SortIcon field="assignedTo" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Erstellt</span>
                        <SortIcon field="createdAt" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTickets.map((ticket: any) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Link
                            href={`/tickets/${ticket.id}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-500"
                          >
                            {ticket.title}
                          </Link>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {ticket.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.company.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.contact.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={ticket.priority} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.assignedTo?.name || (
                          <span className="text-gray-400 italic">
                            Nicht zugewiesen
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ticket.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {hasActiveFilters
                  ? "Keine Tickets gefunden"
                  : "Keine Tickets vorhanden"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters
                  ? "Versuchen Sie andere Filter oder Suchbegriffe."
                  : "Erstellen Sie Ihr erstes Ticket."}
              </p>
              <div className="mt-6">
                {hasActiveFilters ? (
                  <button
                    onClick={clearAllFilters}
                    className="btn-secondary mr-3"
                  >
                    Filter zurücksetzen
                  </button>
                ) : null}
                <Link href="/tickets/new" className="btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Neues Ticket erstellen
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
