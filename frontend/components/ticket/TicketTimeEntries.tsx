"use client";

import { ClockIcon } from "@heroicons/react/24/outline";
import { formatDateTime } from "../../utils/dateUtils";

interface TicketTimeEntriesProps {
  timeEntries: any[];
}

export default function TicketTimeEntries({
  timeEntries,
}: TicketTimeEntriesProps) {
  return (
    <div className="space-y-4">
      {timeEntries.length > 0 ? (
        timeEntries.map((entry: any) => (
          <div key={entry.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {entry.user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(entry.startTime)} -{" "}
                    {formatDateTime(entry.endTime)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
                </p>
                <p className="text-xs text-gray-500">
                  {entry.billable ? "Abrechenbar" : "Nicht abrechenbar"}
                </p>
              </div>
            </div>
            <p className="text-gray-700">{entry.description}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-8">
          Noch keine Zeiteinträge vorhanden.
        </p>
      )}
    </div>
  );
}
