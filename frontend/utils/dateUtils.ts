export const formatDate = (
  timestamp: string | number | null | undefined,
): string => {
  if (!timestamp) return "Kein Datum";

  try {
    const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
    if (isNaN(ts)) return "Ungültiges Datum";

    const date = ts < 10000000000 ? new Date(ts * 1000) : new Date(ts);

    if (isNaN(date.getTime())) return "Ungültiges Datum";

    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    return "Ungültiges Datum";
  }
};

export const formatTime = (
  timestamp: string | number | null | undefined,
): string => {
  if (!timestamp) return "--:--";

  try {
    const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
    if (isNaN(ts)) return "--:--";

    const date = ts < 10000000000 ? new Date(ts * 1000) : new Date(ts);

    if (isNaN(date.getTime())) return "--:--";

    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "--:--";
  }
};

export const formatDateTime = (
  timestamp: string | number | null | undefined,
): string => {
  if (!timestamp) return "Kein Datum";

  try {
    const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
    if (isNaN(ts)) return "Ungültiges Datum";

    const date = ts < 10000000000 ? new Date(ts * 1000) : new Date(ts);

    if (isNaN(date.getTime())) return "Ungültiges Datum";

    return date.toLocaleString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Ungültiges Datum";
  }
};

export const formatDuration = (minutes: number): string => {
  if (!minutes || isNaN(minutes)) return "0:00h";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}h`;
};

export const formatRelativeTime = (
  timestamp: string | number | null | undefined,
): string => {
  if (!timestamp) return "Unbekannt";

  try {
    const ts = typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
    if (isNaN(ts)) return "Unbekannt";

    const date = ts < 10000000000 ? new Date(ts * 1000) : new Date(ts);
    if (isNaN(date.getTime())) return "Unbekannt";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Gerade eben";
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;

    return formatDate(timestamp);
  } catch (error) {
    return "Unbekannt";
  }
};
