"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { useUsers, useDeleteUser } from "../../../hooks/useUsers";
import type { FullUser } from "@/lib/graphql";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import toast from "react-hot-toast";
import AdminTabNavigation from "../../../components/admin/adminTabLayout";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  UserIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const roleOptions = [
  { value: "", label: "Alle Rollen", color: "text-gray-600" },
  { value: "ADMIN", label: "Administrator", color: "text-red-600" },
  { value: "EMPLOYEE", label: "Mitarbeiter", color: "text-blue-600" },
  { value: "CUSTOMER", label: "Kunde", color: "text-green-600" },
];

const statusOptions = [
  { value: "", label: "Alle Status" },
  { value: "active", label: "Aktiv" },
  { value: "inactive", label: "Inaktiv" },
];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useUsers();
  const deleteUserMutation = useDeleteUser();

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Berechtigung
        </h3>
        <p className="text-gray-600 mb-4">
          Nur Administratoren können auf die Benutzerverwaltung zugreifen.
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
          Fehler beim Laden der Benutzer
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

  const allUsers = data?.users || [];

  let filteredUsers = allUsers;

  if (roleFilter) {
    filteredUsers = filteredUsers.filter((user) => user.role === roleFilter);
  }

  if (statusFilter === "active") {
    filteredUsers = filteredUsers.filter((user) => user.isActive);
  } else if (statusFilter === "inactive") {
    filteredUsers = filteredUsers.filter((user) => !user.isActive);
  }

  if (searchTerm) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  const handleDeleteUser = async (user: FullUser) => {
    if (user.id === currentUser.id) {
      toast.error("Sie können Ihr eigenes Konto nicht löschen");
      return;
    }

    if (
      confirm(
        `Möchten Sie den Benutzer "${user.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
      )
    ) {
      try {
        await deleteUserMutation.mutateAsync(user.id);
        toast.success("Benutzer erfolgreich gelöscht");
      } catch (error: any) {
        toast.error(`Fehler beim Löschen: ${error.message}`);
      }
    }
  };

  const clearFilters = () => {
    setRoleFilter("");
    setStatusFilter("");
    setSearchTerm("");
  };

  const hasActiveFilters = roleFilter || statusFilter || searchTerm;

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: "Admin", color: "bg-red-100 text-red-800" },
      EMPLOYEE: { label: "Mitarbeiter", color: "bg-blue-100 text-blue-800" },
      CUSTOMER: { label: "Kunde", color: "bg-green-100 text-green-800" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      label: role,
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}
      >
        {isActive ? "Aktiv" : "Inaktiv"}
      </span>
    );
  };

  return (
    
    <div>
      {/* Tab Navigation */}
      <AdminTabNavigation />
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Benutzerverwaltung
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Verwalten Sie alle Benutzer des Systems
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/admin/users/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Neuer Benutzer
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Nach Name oder E-Mail suchen..."
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
              {/* Role Filter */}
              <div className="sm:w-48">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rolle
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

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
                      {roleFilter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Rolle:{" "}
                          {
                            roleOptions.find((r) => r.value === roleFilter)
                              ?.label
                          }
                        </span>
                      )}
                      {statusFilter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Status:{" "}
                          {
                            statusOptions.find((s) => s.value === statusFilter)
                              ?.label
                          }
                        </span>
                      )}
                      {searchTerm && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Suche: "{searchTerm}"
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-blue-700">
                    {filteredUsers.length} von {allUsers.length} Benutzern
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Benutzer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rolle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Letzter Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Erstellt
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                              {user.id === currentUser.id && (
                                <span className="ml-2 text-xs text-blue-600">
                                  (Sie)
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? formatDate(user.lastLogin) : "Nie"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Anzeigen"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Bearbeiten"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900"
                              title="Löschen"
                              disabled={deleteUserMutation.isPending}
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
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {hasActiveFilters
                  ? "Keine Benutzer gefunden"
                  : "Keine Benutzer vorhanden"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters
                  ? "Versuchen Sie andere Filter oder Suchbegriffe."
                  : "Erstellen Sie den ersten Benutzer."}
              </p>
              <div className="mt-6">
                {hasActiveFilters ? (
                  <button onClick={clearFilters} className="btn-secondary mr-3">
                    Filter zurücksetzen
                  </button>
                ) : null}
                <Link href="/admin/users/new" className="btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Neuer Benutzer
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
