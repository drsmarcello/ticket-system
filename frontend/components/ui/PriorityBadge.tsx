interface PriorityBadgeProps {
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  size?: "sm" | "md";
}

export default function PriorityBadge({
  priority,
  size = "md",
}: PriorityBadgeProps) {
  const priorityConfig = {
    LOW: {
      label: "Niedrig",
      className: "bg-gray-100 text-gray-800",
    },
    MEDIUM: {
      label: "Mittel",
      className: "bg-blue-100 text-blue-800",
    },
    HIGH: {
      label: "Hoch",
      className: "bg-orange-100 text-orange-800",
    },
    URGENT: {
      label: "Dringend",
      className: "bg-red-100 text-red-800",
    },
  };

  const config = priorityConfig[priority];
  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
