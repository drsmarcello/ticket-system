"use client";

import {
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "../ui/StatusBadge";
import PriorityBadge from "../ui/PriorityBadge";
import TimeProgressBar from "../ui/TimeProgressBar";
import { formatDateTime } from "../../utils/dateUtils";

interface TicketSidebarProps {
  ticket: any;
  canEdit: boolean;
  onOpenTimeModal: () => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
}

export default function TicketSidebar({
  ticket,
  canEdit,
  onOpenTimeModal,
  onStatusChange,
  onPriorityChange,
}: TicketSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Main Details Card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ticket-Details
          </h3>

          <div className="space-y-4">
            {/* Zeit erfassen Button */}
            {canEdit && (
              <button
                onClick={onOpenTimeModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center text-sm transition-colors duration-200 shadow-sm"
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                Zeit erfassen
              </button>
            )}

            {/* Zeit-Progress-Bar */}
            <TimeProgressBar
              estimatedMinutes={ticket.estimatedMinutes}
              actualMinutes={
                ticket.timeEntries?.reduce(
                  (total: number, entry: any) => total + entry.duration,
                  0,
                ) || 0
              }
              billableMinutes={
                ticket.timeEntries
                  ?.filter((entry: any) => entry.billable)
                  .reduce(
                    (total: number, entry: any) => total + entry.duration,
                    0,
                  ) || 0
              }
              nonBillableMinutes={
                ticket.timeEntries
                  ?.filter((entry: any) => !entry.billable)
                  .reduce(
                    (total: number, entry: any) => total + entry.duration,
                    0,
                  ) || 0
              }
            />

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              {canEdit ? (
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={ticket.status}
                  onChange={(e) => onStatusChange(e.target.value)}
                >
                  <option value="NEW">Neu</option>
                  <option value="IN_PROGRESS">In Bearbeitung</option>
                  <option value="WAITING_FOR_CUSTOMER">Wartet auf Kunde</option>
                  <option value="COMPLETED">Abgeschlossen</option>
                  <option value="CLOSED">Geschlossen</option>
                </select>
              ) : (
                <div className="mt-1">
                  <StatusBadge status={ticket.status} />
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Priorität
              </label>
              {canEdit ? (
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={ticket.priority}
                  onChange={(e) => onPriorityChange(e.target.value)}
                >
                  <option value="LOW">Niedrig</option>
                  <option value="MEDIUM">Mittel</option>
                  <option value="HIGH">Hoch</option>
                  <option value="URGENT">Dringend</option>
                </select>
              ) : (
                <div className="mt-1">
                  <PriorityBadge priority={ticket.priority} />
                </div>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Unternehmen
              </label>
              <div className="mt-1 flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">
                  {ticket.company.name}
                </span>
              </div>
            </div>

            {/* Contact */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Kontakt
              </label>
              <div className="mt-1">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">
                    {ticket.contact.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  {ticket.contact.email}
                </p>
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Zugewiesen an
              </label>
              <div className="mt-1">
                {ticket.assignedTo ? (
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {ticket.assignedTo.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">
                    Nicht zugewiesen
                  </span>
                )}
              </div>
            </div>

            {/* Created */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Erstellt
              </label>
              <div className="mt-1">
                <p className="text-sm text-gray-900">
                  {formatDateTime(ticket.createdAt)}
                </p>
                {ticket.createdBy && (
                  <p className="text-xs text-gray-500">
                    von {ticket.createdBy.name}
                  </p>
                )}
              </div>
            </div>

            {/* Updated */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Zuletzt aktualisiert
              </label>
              <div className="mt-1">
                <p className="text-sm text-gray-900">
                  {formatDateTime(ticket.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {canEdit && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Weitere Aktionen
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => onStatusChange("CLOSED")}
                className="btn-secondary w-full"
                disabled={ticket.status === "CLOSED"}
              >
                Ticket schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
