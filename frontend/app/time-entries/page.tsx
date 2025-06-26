"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useTimeEntries, useDeleteTimeEntry } from "../../hooks/useTimeEntries";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate, formatTime, formatDuration } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import {
  ClockIcon,
  CalendarIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function TimeEntriesPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });

  const { data, isLoading, error } = useTimeEntries(
    {
      ...filters,
      ...(dateRange.from && { from: dateRange.from }),
      ...(dateRange.to && { to: dateRange.to }),
    },
    100,
    0,
  );

  const deleteTimeEntryMutation = useDeleteTimeEntry();

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
        <h3 className="text-lg font-medium mb-2">
          Fehler beim Laden der Zeiteinträge
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

  const timeEntries = data?.timeEntries || [];

  const handleDeleteTimeEntry = async (id: string) => {
    if (confirm("Möchten Sie diesen Zeiteintrag wirklich löschen?")) {
      try {
        await deleteTimeEntryMutation.mutateAsync(id);
        toast.success("Zeiteintrag gelöscht");
      } catch (error: any) {
        toast.error(`Fehler: ${error.message}`);
      }
    }
  };

  const getTotalHours = () => {
    return timeEntries.reduce(
      (total: number, entry: any) => total + entry.duration,
      0,
    );
  };

  const getBillableHours = () => {
    return timeEntries
      .filter((entry: any) => entry.billable)
      .reduce((total: number, entry: any) => total + entry.duration, 0);
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zeiterfassung</h1>
          <p className="mt-1 text-sm text-gray-600">
            Überblick über alle erfassten Arbeitszeiten
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                Zeit wird jetzt direkt am Ticket erfasst
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gesamtzeit
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatDuration(getTotalHours())}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Abrechenbar
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatDuration(getBillableHours())}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Einträge
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {timeEntries.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="form-label">Von Datum</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="form-label">Bis Datum</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="form-label">Abrechenbar</label>
              <select
                className="form-input"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    billable:
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true",
                  }))
                }
              >
                <option value="">Alle</option>
                <option value="true">Ja</option>
                <option value="false">Nein</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({});
                  setDateRange({ from: "", to: "" });
                }}
                className="btn-secondary w-full"
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {timeEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beschreibung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zeit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dauer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Abrechenbar
                    </th>
                    {user?.role !== "CUSTOMER" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mitarbeiter
                      </th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeEntries.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(entry.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Link
                            href={`/tickets/${entry.ticket.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                            {entry.ticket.title}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {entry.ticket.company.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {entry.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{formatTime(entry.startTime)}</div>
                          <div className="text-gray-500">
                            {formatTime(entry.endTime)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDuration(entry.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.billable
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {entry.billable ? "Ja" : "Nein"}
                        </span>
                      </td>
                      {user?.role !== "CUSTOMER" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.user.name}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {(user?.id === entry.user.id ||
                            user?.role === "ADMIN") && (
                            <button
                              onClick={() => handleDeleteTimeEntry(entry.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Zeiteintrag löschen"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Keine Zeiteinträge gefunden
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Zeit wird jetzt direkt am jeweiligen Ticket erfasst.
              </p>
              <div className="mt-6">
                <Link href="/tickets" className="btn-primary">
                  Zu den Tickets
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
