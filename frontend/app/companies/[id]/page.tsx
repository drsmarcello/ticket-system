"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import {
  useCompany,
  useUpdateCompany,
  useDeleteCompany,
  useCreateContact,
  useDeleteContact,
} from "../../../hooks/useCompanies";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import PriorityBadge from "../../../components/ui/PriorityBadge";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UserIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import type { CompanyUpdateInput, ContactCreateInput } from "@/lib/graphql";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const companyId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const { data, isLoading, error } = useCompany(companyId);
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();
  const createContactMutation = useCreateContact();
  const deleteContactMutation = useDeleteContact();

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
          Fehler beim Laden des Unternehmens
        </h3>
        <p className="text-sm mb-4">{error.message}</p>
        <Link href="/companies" className="btn-primary">
          Zurück zu Unternehmen
        </Link>
      </div>
    );
  }

  const company = data?.company;
  if (!company) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Unternehmen nicht gefunden
        </h3>
        <Link href="/companies" className="mt-4 btn-primary">
          Zurück zu Unternehmen
        </Link>
      </div>
    );
  }

  const canEdit = user?.role === "ADMIN" || user?.role === "EMPLOYEE";

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setEditData({
        name: company.name,
        email: company.email,
        phone: company.phone || "",
        address: company.address || "",
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updateData: CompanyUpdateInput = {
        name: editData.name.trim(),
        email: editData.email.trim(),
        phone: editData.phone.trim() || undefined,
        address: editData.address.trim() || undefined,
      };

      await updateCompanyMutation.mutateAsync({
        id: companyId,
        data: updateData,
      });
      toast.success("Unternehmen aktualisiert");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const handleDeleteCompany = async () => {
    if (
      confirm(`Möchten Sie das Unternehmen "${company.name}" wirklich löschen?`)
    ) {
      try {
        await deleteCompanyMutation.mutateAsync(companyId);
        toast.success("Unternehmen gelöscht");
        router.push("/companies");
      } catch (error: any) {
        toast.error(`Fehler: ${error.message}`);
      }
    }
  };

  const handleCreateContact = async () => {
    if (!newContact.name.trim() || !newContact.email.trim()) {
      toast.error("Name und E-Mail sind erforderlich");
      return;
    }

    try {
      const contactData: ContactCreateInput = {
        name: newContact.name.trim(),
        email: newContact.email.trim(),
        phone: newContact.phone.trim() || undefined,
        companyId,
      };

      await createContactMutation.mutateAsync(contactData);
      toast.success("Kontakt hinzugefügt");
      setNewContact({ name: "", email: "", phone: "" });
      setShowAddContact(false);
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const handleDeleteContact = async (
    contactId: string,
    contactName: string,
  ) => {
    if (confirm(`Möchten Sie den Kontakt "${contactName}" wirklich löschen?`)) {
      try {
        await deleteContactMutation.mutateAsync(contactId);
        toast.success("Kontakt gelöscht");
      } catch (error: any) {
        toast.error(`Fehler: ${error.message}`);
      }
    }
  };

  const getTicketStats = () => {
    const tickets = company.tickets || [];
    return {
      total: tickets.length,
      open: tickets.filter((t) =>
        ["NEW", "IN_PROGRESS", "WAITING_FOR_CUSTOMER"].includes(t.status),
      ).length,
      closed: tickets.filter((t) => ["COMPLETED", "CLOSED"].includes(t.status))
        .length,
    };
  };

  const ticketStats = getTicketStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/companies"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600">Unternehmensdetails und Kontakte</p>
          </div>
        </div>

        {canEdit && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateCompanyMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {updateCompanyMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Speichern...
                    </>
                  ) : (
                    "Speichern"
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditToggle}
                  className="px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Bearbeiten
                </button>
                {user?.role === "ADMIN" && (
                  <button
                    onClick={handleDeleteCompany}
                    disabled={deleteCompanyMutation.isPending}
                    className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Löschen
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                Unternehmensdetails
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Firmenname
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <textarea
                      rows={3}
                      value={editData.address}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">E-Mail</p>
                      <p className="font-medium">{company.email}</p>
                    </div>
                  </div>
                  {company.phone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Telefon</p>
                        <p className="font-medium">{company.phone}</p>
                      </div>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="font-medium whitespace-pre-line">
                          {company.address}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Kontakte ({company.contacts?.length || 0})
              </h2>
              {canEdit && (
                <Link
                  href={`/companies/${companyId}/contacts/new`}
                  className="px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Hinzufügen
                </Link>
              )}
            </div>
            <div className="divide-y divide-gray-200">
              {showAddContact && (
                <div className="p-6 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Neuen Kontakt hinzufügen
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newContact.name}
                      onChange={(e) =>
                        setNewContact((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="E-Mail"
                      value={newContact.email}
                      onChange={(e) =>
                        setNewContact((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon (optional)"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setShowAddContact(false)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleCreateContact}
                      disabled={createContactMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center"
                    >
                      {createContactMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-1" />
                          Hinzufügen...
                        </>
                      ) : (
                        "Hinzufügen"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {company.contacts && company.contacts.length > 0 ? (
                company.contacts.map((contact: any) => (
                  <div
                    key={contact.id}
                    className="p-6 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {contact.name}
                        </h3>
                        {company.primaryContact?.id === contact.id && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Hauptkontakt
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      {contact.phone && (
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      )}
                    </div>
                    {canEdit && (
                      <button
                        onClick={() =>
                          handleDeleteContact(contact.id, contact.name)
                        }
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Noch keine Kontakte vorhanden
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Statistics */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TicketIcon className="h-5 w-5 mr-2 text-blue-600" />
                Ticket-Übersicht
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Gesamt</span>
                <span className="font-semibold text-lg">
                  {ticketStats.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Offen</span>
                <span className="font-semibold text-orange-600">
                  {ticketStats.open}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Geschlossen</span>
                <span className="font-semibold text-green-600">
                  {ticketStats.closed}
                </span>
              </div>
              {ticketStats.total > 0 && (
                <Link
                  href={`/tickets?company=${companyId}`}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  Alle Tickets anzeigen
                </Link>
              )}
            </div>
          </div>

          {/* Recent Tickets */}
          {company.tickets && company.tickets.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Neueste Tickets
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {company.tickets.slice(0, 5).map((ticket: any) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {ticket.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <StatusBadge status={ticket.status} />
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
