"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../../contexts/AuthContext";
import {
  useCompany,
  useCreateContact,
} from "../../../../../hooks/useCompanies";
import LoadingSpinner from "../../../../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import type { ContactCreateInput } from "@/lib/graphql";

export default function NewContactPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const companyId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: companyData, isLoading: companyLoading } =
    useCompany(companyId);
  const createContactMutation = useCreateContact();

  if (user?.role === "CUSTOMER") {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Keine Berechtigung
        </h3>
        <p className="mt-1 text-gray-500">
          Sie haben keine Berechtigung, Kontakte zu erstellen.
        </p>
        <div className="mt-6">
          <Link href={`/companies/${companyId}`} className="btn-primary">
            Zurück zum Unternehmen
          </Link>
        </div>
      </div>
    );
  }

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const company = companyData?.company;
  if (!company) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Unternehmen nicht gefunden
        </h3>
        <div className="mt-6">
          <Link href="/companies" className="btn-primary">
            Zurück zu Unternehmen
          </Link>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name ist erforderlich";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-Mail ist erforderlich";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ungültige E-Mail-Adresse";
    }


    const emailExists = company.contacts?.some(
      (contact) => contact.email.toLowerCase() === formData.email.toLowerCase(),
    );
    if (emailExists) {
      newErrors.email =
        "Diese E-Mail-Adresse existiert bereits für dieses Unternehmen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const contactData: ContactCreateInput = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        companyId,
      };

      await createContactMutation.mutateAsync(contactData);
      toast.success("Kontakt erfolgreich erstellt!");
      router.push(`/companies/${companyId}`);
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link
          href={`/companies/${companyId}`}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neuer Kontakt</h1>
          <p className="text-gray-600">
            Kontakt für{" "}
            <span className="font-medium text-blue-600">{company.name}</span>{" "}
            hinzufügen
          </p>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              {company.name}
            </h3>
            <p className="text-sm text-blue-700">{company.email}</p>
            {company.contacts && (
              <p className="text-xs text-blue-600 mt-1">
                {company.contacts.length} bestehende Kontakte
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
            Kontaktdaten
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vollständiger Name *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="z.B. Max Mustermann"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-Mail-Adresse *
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="max.mustermann@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Telefonnummer
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+49 123 456789"
              />
            </div>
          </div>

          {/* Existing Contacts Info */}
          {company.contacts && company.contacts.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Bestehende Kontakte bei {company.name}:
              </h4>
              <div className="space-y-1">
                {company.contacts.slice(0, 3).map((contact: any) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">{contact.name}</span>
                    <span className="text-gray-500">{contact.email}</span>
                  </div>
                ))}
                {company.contacts.length > 3 && (
                  <p className="text-xs text-gray-500 mt-1">
                    und {company.contacts.length - 3} weitere...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link
              href={`/companies/${companyId}`}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={createContactMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {createContactMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Wird erstellt...
                </>
              ) : (
                <>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Kontakt erstellen
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <UserIcon className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-green-900">Hinweis</h4>
            <p className="mt-1 text-sm text-green-700">
              Dieser Kontakt wird automatisch dem Unternehmen "{company.name}"
              zugeordnet. Nach der Erstellung können Sie Tickets direkt an
              diesen Kontakt zuweisen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
