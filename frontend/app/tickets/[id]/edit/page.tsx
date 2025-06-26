"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  useTicket,
  useUpdateTicket,
  useUsers,
  useCompaniesForTicket,
} from "../../../../hooks/useTickets";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import StatusBadge from "../../../../components/ui/StatusBadge";
import PriorityBadge from "../../../../components/ui/PriorityBadge";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { TicketUpdateInput } from "@/lib/graphql";

export default function EditTicketPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    companyId: "",
    contactId: "",
    assignedToId: "",
    estimatedMinutes: "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  const {
    data: ticketData,
    isLoading: ticketLoading,
    error: ticketError,
  } = useTicket(ticketId);
  const { data: companiesData, isLoading: companiesLoading } =
    useCompaniesForTicket();
  const { data: usersData } = useUsers();
  const updateTicketMutation = useUpdateTicket();

  // Initialize form when ticket data loads
  useEffect(() => {
    if (ticketData?.ticket) {
      const ticket = ticketData.ticket;
      const initialFormData = {
        title: ticket.title || "",
        description: ticket.description || "",
        status: ticket.status || "",
        priority: ticket.priority || "",
        companyId: ticket.company?.id || "",
        contactId: ticket.contact?.id || "",
        assignedToId: ticket.assignedTo?.id || "",
        estimatedMinutes: ticket.estimatedMinutes
          ? ticket.estimatedMinutes.toString()
          : "",
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [ticketData]);

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const changed = Object.keys(formData).some(
        (key) => formData[key as keyof typeof formData] !== originalData[key],
      );
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset contactId when company changes
      ...(field === "companyId" && { contactId: "" }),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Titel und Beschreibung sind erforderlich");
      return;
    }

    // Build update data object with only changed fields
    const updateData: TicketUpdateInput = {};

    if (formData.title !== originalData.title) {
      updateData.title = formData.title;
    }
    if (formData.description !== originalData.description) {
      updateData.description = formData.description;
    }
    if (formData.status !== originalData.status) {
      updateData.status = formData.status as any;
    }
    if (formData.priority !== originalData.priority) {
      updateData.priority = formData.priority as any;
    }
    if (formData.companyId !== originalData.companyId) {
      updateData.companyId = formData.companyId;
    }
    if (formData.contactId !== originalData.contactId) {
      updateData.contactId = formData.contactId;
    }
    if (formData.assignedToId !== originalData.assignedToId) {
      updateData.assignedToId = formData.assignedToId || null;
    }
    if (formData.estimatedMinutes !== originalData.estimatedMinutes) {
      updateData.estimatedMinutes = formData.estimatedMinutes
        ? parseInt(formData.estimatedMinutes)
        : null;
    }

    // Check if there are any changes before proceeding
    if (Object.keys(updateData).length === 0) {
      toast.error("Keine Änderungen erkannt");
      return;
    }

    try {
      await updateTicketMutation.mutateAsync({
        id: ticketId,
        data: updateData,
      });
      toast.success("Ticket erfolgreich aktualisiert!");
      router.push(`/tickets/${ticketId}`);
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  // warn user about unsaved changes
  const handleCancel = () => {
    if (hasChanges) {
      if (
        confirm(
          "Sie haben ungespeicherte Änderungen. Möchten Sie wirklich abbrechen?",
        )
      ) {
        router.push(`/tickets/${ticketId}`);
      }
    } else {
      router.push(`/tickets/${ticketId}`);
    }
  };

  if (ticketLoading || companiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (ticketError || !ticketData?.ticket) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ticket nicht gefunden
        </h3>
        <p className="text-gray-600 mb-4">
          Das Ticket existiert nicht oder Sie haben keine Berechtigung.
        </p>
        <Link href="/tickets" className="btn-primary">
          Zurück zu Tickets
        </Link>
      </div>
    );
  }

  const ticket = ticketData.ticket;
  const companies = companiesData?.companies || [];
  const users =
    usersData?.users?.filter((u: any) => u.role !== "CUSTOMER") || [];

  const selectedCompany = companies.find(
    (c: any) => c.id === formData.companyId,
  );
  const contacts = selectedCompany?.contacts || [];

  // Check for Permission / ony EMPLOYEE or ADMIN
  if (user?.role === "CUSTOMER") {
    return (
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Berechtigung
        </h3>
        <p className="text-gray-600 mb-4">
          Kunden können Tickets nicht direkt bearbeiten.
        </p>
        <Link href={`/tickets/${ticketId}`} className="btn-primary">
          Zurück zum Ticket
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            href={`/tickets/${ticketId}`}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Ticket bearbeiten
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Ticket #{ticket.id.slice(-8)} • {ticket.company.name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>

        {/* Changes indicator */}
        {hasChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-sm text-amber-800">
                Sie haben ungespeicherte Änderungen
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {/* Titel */}
            <div className="sm:col-span-2">
              <label htmlFor="title" className="form-label">
                Titel *
              </label>
              <input
                type="text"
                id="title"
                required
                className="form-input"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            {/* Beschreibung */}
            <div className="sm:col-span-2">
              <label htmlFor="description" className="form-label">
                Beschreibung *
              </label>
              <textarea
                id="description"
                rows={6}
                required
                className="form-input"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                className="form-input"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="NEW">🆕 Neu</option>
                <option value="IN_PROGRESS">⚡ In Bearbeitung</option>
                <option value="WAITING_FOR_CUSTOMER">
                  ⏳ Wartet auf Kunde
                </option>
                <option value="COMPLETED">✅ Abgeschlossen</option>
                <option value="CLOSED">🔒 Geschlossen</option>
              </select>
            </div>

            {/* Priorität */}
            <div>
              <label htmlFor="priority" className="form-label">
                Priorität
              </label>
              <select
                id="priority"
                className="form-input"
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
              >
                <option value="LOW">Niedrig</option>
                <option value="MEDIUM">Mittel</option>
                <option value="HIGH">Hoch</option>
                <option value="URGENT">Dringend</option>
              </select>
            </div>

            {/* Unternehmen */}
            <div>
              <label htmlFor="company" className="form-label">
                <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                Unternehmen *
              </label>
              <select
                id="company"
                required
                className="form-input"
                value={formData.companyId}
                onChange={(e) => handleInputChange("companyId", e.target.value)}
              >
                <option value="">Unternehmen auswählen</option>
                {companies.map((company: any) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kontakt */}
            <div>
              <label htmlFor="contact" className="form-label">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Kontakt *
              </label>
              <select
                id="contact"
                required
                className="form-input"
                value={formData.contactId}
                onChange={(e) => handleInputChange("contactId", e.target.value)}
                disabled={!formData.companyId}
              >
                <option value="">
                  {formData.companyId
                    ? "Kontakt auswählen"
                    : "Erst Unternehmen auswählen"}
                </option>
                {contacts.map((contact: any) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} ({contact.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Zugewiesen an */}
            <div>
              <label htmlFor="assignedTo" className="form-label">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Zugewiesen an
              </label>
              <select
                id="assignedTo"
                className="form-input"
                value={formData.assignedToId}
                onChange={(e) =>
                  handleInputChange("assignedToId", e.target.value)
                }
              >
                <option value="">Nicht zugewiesen</option>
                {users.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name} (
                    {user.role === "ADMIN" ? "Administrator" : "Mitarbeiter"})
                  </option>
                ))}
              </select>
            </div>

            {/* Geschätzte Zeit */}
            <div>
              <label htmlFor="estimatedMinutes" className="form-label">
                <ClockIcon className="h-4 w-4 inline mr-1" />
                Geschätzte Zeit (Minuten)
              </label>
              <input
                type="number"
                id="estimatedMinutes"
                className="form-input"
                placeholder="z.B. 120"
                min="0"
                max="10080"
                value={formData.estimatedMinutes}
                onChange={(e) =>
                  handleInputChange("estimatedMinutes", e.target.value)
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Hilft bei der Planung (max. 7 Tage = 10080 Min.)
              </p>
            </div>
          </div>

          {/* Preview der Änderungen */}
          {hasChanges && originalData && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="text-sm font-medium text-blue-900 mb-3">
                Vorschau der Änderungen:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {formData.title !== originalData.title && (
                  <div>
                    <span className="font-medium text-blue-800">Titel:</span>
                    <div className="text-red-600 line-through">
                      {originalData.title}
                    </div>
                    <div className="text-green-600">{formData.title}</div>
                  </div>
                )}
                {formData.status !== originalData.status && (
                  <div>
                    <span className="font-medium text-blue-800">Status:</span>
                    <div className="text-red-600 line-through">
                      {originalData.status}
                    </div>
                    <div className="text-green-600">{formData.status}</div>
                  </div>
                )}
                {formData.priority !== originalData.priority && (
                  <div>
                    <span className="font-medium text-blue-800">
                      Priorität:
                    </span>
                    <div className="text-red-600 line-through">
                      {originalData.priority}
                    </div>
                    <div className="text-green-600">{formData.priority}</div>
                  </div>
                )}
                {formData.assignedToId !== originalData.assignedToId && (
                  <div>
                    <span className="font-medium text-blue-800">
                      Zugewiesen:
                    </span>
                    <div className="text-red-600 line-through">
                      {originalData.assignedToId
                        ? users.find(
                            (u: any) => u.id === originalData.assignedToId,
                          )?.name || "Unbekannt"
                        : "Nicht zugewiesen"}
                    </div>
                    <div className="text-green-600">
                      {formData.assignedToId
                        ? users.find((u: any) => u.id === formData.assignedToId)
                            ?.name || "Unbekannt"
                        : "Nicht zugewiesen"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={updateTicketMutation.isPending}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={updateTicketMutation.isPending || !hasChanges}
              className="btn-primary"
            >
              {updateTicketMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Wird gespeichert...
                </>
              ) : (
                "Änderungen speichern"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
