interface StatusBadgeProps {
  status:
    | "NEW"
    | "IN_PROGRESS"
    | "WAITING_FOR_CUSTOMER"
    | "COMPLETED"
    | "CLOSED";
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusConfig = {
    NEW: {
      label: "Neu",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    IN_PROGRESS: {
      label: "In Bearbeitung",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    WAITING_FOR_CUSTOMER: {
      label: "Wartet auf Kunde",
      className: "bg-orange-100 text-orange-800 border-orange-200",
    },
    COMPLETED: {
      label: "Abgeschlossen",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    CLOSED: {
      label: "Geschlossen",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };

  const config = statusConfig[status];
  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
