"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useCompanies } from "../../../hooks/useCompanies";
import { useUsers, useCreateTicket } from "../../../hooks/useTickets";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function NewTicketPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    companyId: "",
    contactId: "",
    assignedToId: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    estimatedMinutes: "",
  });

  const { data: companiesData, isLoading: companiesLoading } = useCompanies();
  const { data: usersData } = useUsers();
  const createTicketMutation = useCreateTicket();

  const companies = companiesData?.companies || [];
  const users =
    usersData?.users?.filter((u: any) => u.role !== "CUSTOMER") || [];
  const selectedCompany = companies.find(
    (c: any) => c.id === formData.companyId,
  );
  const contacts = selectedCompany?.contacts || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Titel und Beschreibung sind erforderlich");
      return;
    }

    try {
      // automatic companyId and contactId for CUSTOMER role
      if (user?.role === "CUSTOMER") {
        const result = await createTicketMutation.mutateAsync({
          title: formData.title,
          description: formData.description,
          companyId: "WIRD_VOM_BACKEND_ERMITTELT",
          contactId: "WIRD_VOM_BACKEND_ERMITTELT",
          priority: formData.priority,
          estimatedMinutes: formData.estimatedMinutes
            ? parseInt(formData.estimatedMinutes)
            : null,
        });

        toast.success("Ticket erfolgreich erstellt!");
        router.push(`/tickets/${result.createTicket.id}`);
      } else {

        if (!formData.companyId || !formData.contactId) {
          toast.error("Bitte wählen Sie Unternehmen und Kontakt aus");
          return;
        }

        const result = await createTicketMutation.mutateAsync({
          title: formData.title,
          description: formData.description,
          companyId: formData.companyId,
          contactId: formData.contactId,
          assignedToId: formData.assignedToId || null,
          priority: formData.priority,
          estimatedMinutes: formData.estimatedMinutes
            ? parseInt(formData.estimatedMinutes)
            : null,
        });

        toast.success("Ticket erfolgreich erstellt!");
        router.push(`/tickets/${result.createTicket.id}`);
      }
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "companyId" && { contactId: "" }),
    }));
  };

  if (companiesLoading && user?.role !== "CUSTOMER") {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            href="/tickets"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Neues Ticket erstellen
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Erstellen Sie ein neues Support-Ticket
            </p>
          </div>
        </div>
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
                placeholder="Kurze Beschreibung des Problems"
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
                rows={4}
                required
                className="form-input"
                placeholder="Detaillierte Beschreibung des Problems..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>

            {/* Unternehmen (nur für Employee/Admin) */}
            {user?.role !== "CUSTOMER" && (
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
                  onChange={(e) =>
                    handleInputChange("companyId", e.target.value)
                  }
                >
                  <option value="">Unternehmen auswählen</option>
                  {companies.map((company: any) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Kontakt (nur für Employee/Admin) */}
            {user?.role !== "CUSTOMER" && (
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
                  onChange={(e) =>
                    handleInputChange("contactId", e.target.value)
                  }
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
            )}

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

            {/* Geschätzte Zeit */}
            <div>
              <label htmlFor="estimatedMinutes" className="form-label">
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

            {/* Zuweisen (nur für Admin/Employee) */}
            {(user?.role === "ADMIN" || user?.role === "EMPLOYEE") && (
              <div className="sm:col-span-2">
                <label htmlFor="assignedTo" className="form-label">
                  <UserIcon className="h-4 w-4 inline mr-1" />
                  Zuweisen an
                </label>
                <select
                  id="assignedTo"
                  className="form-input"
                  value={formData.assignedToId}
                  onChange={(e) =>
                    handleInputChange("assignedToId", e.target.value)
                  }
                >
                  <option value="">
                    Nicht zugewiesen (wird später zugewiesen)
                  </option>
                  {users.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.name} (
                      {user.role === "ADMIN" ? "Administrator" : "Mitarbeiter"})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Ticket kann später zugewiesen werden
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {(formData.title || formData.description) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Vorschau:
              </h4>
              <div className="text-sm">
                <p className="font-medium">{formData.title || "Titel..."}</p>
                <p className="text-gray-600 mt-1">
                  {formData.description || "Beschreibung..."}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Priorität: {formData.priority}</span>
                  {formData.estimatedMinutes && (
                    <span>
                      Geschätzt:{" "}
                      {Math.floor(parseInt(formData.estimatedMinutes) / 60)}h{" "}
                      {parseInt(formData.estimatedMinutes) % 60}m
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <Link href="/tickets" className="btn-secondary">
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={createTicketMutation.isPending}
              className="btn-primary"
            >
              {createTicketMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Wird erstellt...
                </>
              ) : (
                "Ticket erstellen"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
