"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { useAuditLogs } from "../../../hooks/useAuditLogs";

// 🎯 Types definieren
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { formatDate, formatTime, formatDateTime } from "../../../utils/dateUtils";
import {
  ExclamationTriangleIcon,
  FunnelIcon,
  XMarkIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import AdminTabNavigation from "@/components/admin/adminTabLayout";

// Action Options mit Icons und Farben
const actionOptions = [
  { value: "", label: "Alle Aktionen", color: "text-gray-600" },
  { value: "LOGIN_SUCCESS", label: "Login Erfolgreich", color: "text-green-600", icon: "✅" },
  { value: "LOGIN_FAILED", label: "Login Fehlgeschlagen", color: "text-red-600", icon: "❌" },
  { value: "LOGOUT", label: "Logout", color: "text-blue-600", icon: "🚪" },
  { value: "REGISTER", label: "Registrierung", color: "text-purple-600", icon: "📝" },
  { value: "TOKEN_REFRESH", label: "Token Refresh", color: "text-indigo-600", icon: "🔄" },
  { value: "USER_CREATE", label: "User Erstellt", color: "text-green-600", icon: "👤" },
  { value: "USER_UPDATE", label: "User Bearbeitet", color: "text-yellow-600", icon: "✏️" },
  { value: "USER_DELETE", label: "User Gelöscht", color: "text-red-600", icon: "🗑️" },
];

const resourceOptions = [
  { value: "", label: "Alle Ressourcen" },
  { value: "AUTH", label: "Authentifizierung" },
  { value: "USER", label: "Benutzer" },
  { value: "TICKET", label: "Tickets" },
  { value: "COMPANY", label: "Unternehmen" },
];

const timeOptions = [
  { value: "", label: "Alle Zeiten" },
  { value: "1h", label: "Letzte Stunde" },
  { value: "24h", label: "Letzten 24 Stunden" },
  { value: "7d", label: "Letzte 7 Tage" },
  { value: "30d", label: "Letzten 30 Tage" },
];

export default function AdminAuditLogsPage() {
  const { user: currentUser } = useAuth();
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("24h"); // Default: letzte 24h
  const [userFilter, setUserFilter] = useState("");
  const [ipFilter, setIpFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, error } = useAuditLogs({
    action: actionFilter,
    resource: resourceFilter,
    timeRange: timeFilter,
    userEmail: userFilter,
    ipAddress: ipFilter,
  });

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Berechtigung
        </h3>
        <p className="text-gray-600 mb-4">
          Nur Administratoren können auf die Audit Logs zugreifen.
        </p>
        <Link href="/dashboard" className="btn-primary">
          Zurück zum Dashboard
        </Link>
      </div>
    );
  }

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
          Fehler beim Laden der Audit Logs
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

  const allLogs = data?.auditLogs || [];

  const clearFilters = () => {
    setActionFilter("");
    setResourceFilter("");
    setTimeFilter("");
    setUserFilter("");
    setIpFilter("");
  };

  const hasActiveFilters = actionFilter || resourceFilter || timeFilter || userFilter || ipFilter;

  const getActionBadge = (action: string) => {
    const actionConfig = actionOptions.find(opt => opt.value === action);
    
    const config = actionConfig || {
      label: action,
      color: "text-gray-600",
      icon: "📄"
    };

    const getBgColor = () => {
      if (action.includes('FAILED') || action.includes('DELETE')) return "bg-red-100 text-red-800";
      if (action.includes('SUCCESS') || action.includes('CREATE')) return "bg-green-100 text-green-800";
      if (action.includes('UPDATE')) return "bg-yellow-100 text-yellow-800";
      if (action.includes('REFRESH') || action.includes('TOKEN')) return "bg-indigo-100 text-indigo-800";
      return "bg-gray-100 text-gray-800";
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBgColor()}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getResourceBadge = (resource: string) => {
    const colors = {
      AUTH: "bg-blue-100 text-blue-800",
      USER: "bg-purple-100 text-purple-800", 
      TICKET: "bg-green-100 text-green-800",
      COMPANY: "bg-orange-100 text-orange-800",
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[resource as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {resource}
      </span>
    );
  };

  const formatDetails = (details: string | undefined | null) => {
    if (!details) return '-';
    
    try {
      const parsed = JSON.parse(details);
      if (parsed.reason) return `Grund: ${parsed.reason}`;
      if (parsed.email) return `E-Mail: ${parsed.email}`;
      if (parsed.name) return `Name: ${parsed.name}`;
      return details;
    } catch {
      return details;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <AdminTabNavigation />
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <DocumentTextIcon className="h-8 w-8 mr-3 text-gray-600" />
            Audit Logs
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Alle System-Aktivitäten und Sicherheitsereignisse
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            Live-Tracking aktiv
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Erfolgreich</p>
              <p className="text-lg font-semibold text-gray-900">
                {allLogs.filter(log => log.action.includes('SUCCESS')).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Fehlgeschlagen</p>
              <p className="text-lg font-semibold text-gray-900">
                {allLogs.filter(log => log.action.includes('FAILED')).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Gesamt Events</p>
              <p className="text-lg font-semibold text-gray-900">{allLogs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Unique IPs</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Set(allLogs.map(log => log.ipAddress).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {/* Search Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Benutzer E-Mail
                </label>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="user@example.com"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  IP-Adresse
                </label>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="192.168.1.1"
                  value={ipFilter}
                  onChange={(e) => setIpFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              {/* Time Filter */}
              <div className="sm:w-48">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Zeitraum
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Filter */}
              <div className="sm:w-48">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Aktion
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  {actionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resource Filter */}
              <div className="sm:w-48">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Ressource
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                >
                  {resourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div>
                  <button
                    onClick={clearFilters}
                    className="btn-secondary flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Filter zurücksetzen
                  </button>
                </div>
              )}
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
                      {actionFilter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Aktion: {actionOptions.find((r) => r.value === actionFilter)?.label}
                        </span>
                      )}
                      {resourceFilter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Ressource: {resourceOptions.find((s) => s.value === resourceFilter)?.label}
                        </span>
                      )}
                      {timeFilter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Zeit: {timeOptions.find((s) => s.value === timeFilter)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-blue-700">
                    {allLogs.length} Events
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {allLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zeitstempel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Benutzer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ressource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP-Adresse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allLogs.map((log: AuditLog) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatDate(log.timestamp)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {log.user?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {log.user?.name || 'Anonym'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.user?.email || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getResourceBadge(log.resource)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {log.ipAddress || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {formatDetails(log.details)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Details anzeigen"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Keine Audit Logs gefunden
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Für die gewählten Filter wurden keine Events gefunden.
              </p>
              <div className="mt-6">
                <button onClick={clearFilters} className="btn-secondary">
                  Filter zurücksetzen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Event Details
              </h3>
              <div className="text-left space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Zeitstempel:</span>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(selectedLog.timestamp)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Benutzer:</span>
                  <p className="text-sm text-gray-900">
                    {selectedLog.user?.name || 'Anonym'} ({selectedLog.user?.email || '-'})
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Aktion:</span>
                  <p className="text-sm text-gray-900">{selectedLog.action}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Ressource:</span>
                  <p className="text-sm text-gray-900">{selectedLog.resource}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">IP-Adresse:</span>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.ipAddress || '-'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">User Agent:</span>
                  <p className="text-xs text-gray-900 break-words">{selectedLog.userAgent || '-'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Details:</span>
                  <pre className="text-xs text-gray-900 bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                    {selectedLog.details || '-'}
                  </pre>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="btn-secondary"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}