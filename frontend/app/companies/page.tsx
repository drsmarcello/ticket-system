"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useCompanies, useDeleteCompany } from "../../hooks/useCompanies";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import {
  PlusIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function CompaniesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useCompanies();
  const deleteCompanyMutation = useDeleteCompany();

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
        Fehler beim Laden der Unternehmen: {error.message}
      </div>
    );
  }

  const companies = data?.companies || [];

  const filteredCompanies = companies.filter(
    (company: any) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDeleteCompany = async (id: string, name: string) => {
    if (confirm(`Möchten Sie das Unternehmen "${name}" wirklich löschen?`)) {
      try {
        await deleteCompanyMutation.mutateAsync(id);
        toast.success("Unternehmen gelöscht");
      } catch (error: any) {
        toast.error(`Fehler: ${error.message}`);
      }
    }
  };

  const getTicketStats = (tickets: any[]) => {
    const stats = {
      total: tickets.length,
      open: tickets.filter((t) =>
        ["NEW", "IN_PROGRESS", "WAITING_FOR_CUSTOMER"].includes(t.status),
      ).length,
      closed: tickets.filter((t) => ["COMPLETED", "CLOSED"].includes(t.status))
        .length,
    };
    return stats;
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unternehmen</h1>
          <p className="mt-1 text-sm text-gray-600">
            Verwalten Sie alle Kunden-Unternehmen und deren Kontakte
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/companies/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Neues Unternehmen
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="max-w-md">
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 pl-3 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Unternehmen suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map((company: any) => {
            const ticketStats = getTicketStats(company.tickets);

            return (
              <div key={company.id} className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {company.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/companies/${company.id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      {user?.role === "ADMIN" && (
                        <button
                          onClick={() =>
                            handleDeleteCompany(company.id, company.name)
                          }
                          className="text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Contact Info */}
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      <a
                        href={`mailto:${company.email}`}
                        className="hover:text-primary-600"
                      >
                        {company.email}
                      </a>
                    </div>

                    {company.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        <a
                          href={`tel:${company.phone}`}
                          className="hover:text-primary-600"
                        >
                          {company.phone}
                        </a>
                      </div>
                    )}

                    {/* Primary Contact */}
                    {company.primaryContact && (
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>{company.primaryContact.name}</span>
                      </div>
                    )}

                    {/* Address */}
                    {company.address && (
                      <div className="text-sm text-gray-600">
                        <p>{company.address}</p>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {company.contacts.length}
                      </div>
                      <div className="text-xs text-gray-500">Kontakte</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {ticketStats.open}
                      </div>
                      <div className="text-xs text-gray-500">
                        Offene Tickets
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {ticketStats.total}
                      </div>
                      <div className="text-xs text-gray-500">
                        Gesamt Tickets
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex space-x-3">
                    <Link
                      href={`/companies/${company.id}`}
                      className="flex-1 btn-secondary text-center"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/tickets/new?companyId=${company.id}`}
                      className="flex-1 btn-primary text-center"
                    >
                      Ticket erstellen
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center bg-white shadow rounded-lg py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Keine Unternehmen gefunden
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Versuchen Sie andere Suchbegriffe."
              : "Erstellen Sie Ihr erstes Unternehmen."}
          </p>
          <div className="mt-6">
            <Link href="/companies/new" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Neues Unternehmen erstellen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
