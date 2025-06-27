"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../contexts/AuthContext";
import { useCreateUser } from "../../../../hooks/useUsers";
import type { UserCreateInput } from "@/lib/graphql";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  UserIcon,
  KeyIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const roleOptions = [
  {
    value: "EMPLOYEE",
    label: "Mitarbeiter",
    description: "Kann Tickets bearbeiten und verwalten",
  },
  {
    value: "CUSTOMER",
    label: "Kunde",
    description: "Kann eigene Tickets erstellen und einsehen",
  },
  {
    value: "ADMIN",
    label: "Administrator",
    description: "Vollzugriff auf alle Funktionen",
  },
];

export default function NewUserPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const createUserMutation = useCreateUser();

  const [formData, setFormData] = useState<UserCreateInput>({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Keine Berechtigung
        </h3>
        <p className="text-gray-600 mb-4">
          Nur Administratoren können Benutzer erstellen.
        </p>
        <Link href="/admin/users" className="btn-primary">
          Zurück zur Benutzerliste
        </Link>
      </div>
    );
  }

  const handleInputChange = (field: keyof UserCreateInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name ist erforderlich");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("E-Mail ist erforderlich");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Bitte geben Sie eine gültige E-Mail-Adresse ein");
      return false;
    }

    if (!formData.password) {
      toast.error("Passwort ist erforderlich");
      return false;
    }

    if (formData.password.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen lang sein");
      return false;
    }

    if (formData.password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createUserMutation.mutateAsync(formData);
      toast.success("Benutzer erfolgreich erstellt!");
      router.push("/admin/users");
    } catch (error: any) {
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    }
  };

  const handleCancel = () => {
    if (
      Object.values(formData).some((value) => value.trim() !== "") ||
      confirmPassword
    ) {
      if (
        confirm("Möchten Sie wirklich abbrechen? Alle Eingaben gehen verloren.")
      ) {
        router.push("/admin/users");
      }
    } else {
      router.push("/admin/users");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Neuer Benutzer</h1>
            <p className="mt-1 text-sm text-gray-600">
              Erstellen Sie einen neuen Benutzer für das System
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="h-4 w-4 inline mr-1" />
                  Vollständiger Name *
                </label>
                <input
                  type="text"
                  required
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                  E-Mail-Adresse *
                </label>
                <input
                  type="email"
                  required
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="max.mustermann@beispiel.de"
                />
              </div>

              {/* Role */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benutzerrolle *
                </label>
                <div className="space-y-3">
                  {roleOptions.map((option) => (
                    <div key={option.value} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={option.value}
                          name="role"
                          type="radio"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          checked={formData.role === option.value}
                          onChange={() =>
                            handleInputChange("role", option.value)
                          }
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor={option.value}
                          className="font-medium text-gray-700 cursor-pointer"
                        >
                          {option.label}
                        </label>
                        <p className="text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <KeyIcon className="h-4 w-4 inline mr-1" />
                  Passwort *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm pr-10"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Mindestens 8 Zeichen"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="text-sm text-gray-400">
                      {showPassword ? "Verbergen" : "Anzeigen"}
                    </span>
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Das Passwort muss mindestens 8 Zeichen lang sein
                </p>
              </div>

              {/* Confirm Password */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <KeyIcon className="h-4 w-4 inline mr-1" />
                  Passwort bestätigen *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                />
                {confirmPassword && formData.password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    Passwörter stimmen nicht überein
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={createUserMutation.isPending}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createUserMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Erstelle...
              </>
            ) : (
              "Benutzer erstellen"
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Wichtige Hinweise
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Der neue Benutzer erhält eine E-Mail mit den Anmeldedaten
                  </li>
                  <li>Das Passwort sollte beim ersten Login geändert werden</li>
                  <li>
                    Administratoren haben vollen Zugriff auf alle
                    Systemfunktionen
                  </li>
                  <li>Mitarbeiter können Tickets verwalten und bearbeiten</li>
                  <li>Kunden können nur ihre eigenen Tickets einsehen</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
