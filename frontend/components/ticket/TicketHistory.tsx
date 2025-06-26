"use client";

import { formatDateTime } from "../../utils/dateUtils";

interface TicketHistoryProps {
  histories: any[];
}

export default function TicketHistory({ histories }: TicketHistoryProps) {
  return (
    <div className="space-y-4">
      {histories.length > 0 ? (
        histories.map((history: any) => (
          <div key={history.id} className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-gray-900">{history.message}</p>
              <p className="text-xs text-gray-500">
                {formatDateTime(history.createdAt)}
                {history.user && ` • ${history.user.name}`}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-8">
          Keine Historie vorhanden.
        </p>
      )}
    </div>
  );
}
