import {
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";


// TODO: Only add to Progress Bar when time is billable
interface TimeProgressBarProps {
  estimatedMinutes?: number | null;
  actualMinutes: number;
  billableMinutes: number;
  nonBillableMinutes: number;
  className?: string;
}

export default function TimeProgressBar({
  estimatedMinutes,
  actualMinutes,
  billableMinutes,
  nonBillableMinutes,
  className = "",
}: TimeProgressBarProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}h`;
  };

  if (!estimatedMinutes || estimatedMinutes <= 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <ClockIcon className="h-4 w-4 mr-2" />
            Erfasste Zeit
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {formatTime(actualMinutes)}
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-green-600">Abrechenbar:</span>
            <span className="text-green-600 font-medium">
              {formatTime(billableMinutes)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Nicht abrechenbar:</span>
            <span className="text-gray-500 font-medium">
              {formatTime(nonBillableMinutes)}
            </span>
          </div>
        </div>

        <div className="mt-2 text-xs text-amber-600">
          <ExclamationTriangleIcon className="h-3 w-3 inline mr-1" />
          Keine Zeitschätzung gesetzt
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min(
    (actualMinutes / estimatedMinutes) * 100,
    100,
  );
  const isOvertime = actualMinutes > estimatedMinutes;
  const overtimeMinutes = Math.max(0, actualMinutes - estimatedMinutes);

  let progressColor = "bg-green-500";
  let textColor = "text-green-700";

  if (progressPercentage > 100) {
    progressColor = "bg-red-500";
    textColor = "text-red-700";
  } else if (progressPercentage > 80) {
    progressColor = "bg-amber-500";
    textColor = "text-amber-700";
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <ClockIcon className="h-4 w-4 mr-2" />
          Zeit-Fortschritt
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            {formatTime(actualMinutes)}
          </div>
          <div className="text-xs text-gray-500">
            von {formatTime(estimatedMinutes)} geschätzt
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm font-medium ${textColor}`}>
            {progressPercentage.toFixed(0)}%
          </span>
          {isOvertime && (
            <span className="text-xs text-red-600 font-medium">
              +{formatTime(overtimeMinutes)} Überzeit
            </span>
          )}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          {/* Hauptbalken */}
          <div
            className={`h-3 rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />

          {/* Überzeit-Balken (gestrichelt) */}
          {isOvertime && (
            <div
              className="absolute top-0 h-3 bg-red-500 opacity-75"
              style={{
                left: "100%",
                width: `${Math.min(((actualMinutes - estimatedMinutes) / estimatedMinutes) * 100, 50)}%`,
                background:
                  "repeating-linear-gradient(45deg, #ef4444, #ef4444 4px, #fca5a5 4px, #fca5a5 8px)",
              }}
            />
          )}
        </div>
      </div>

      {/* Zeit-Details */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-green-600">Abrechenbar:</span>
          <span className="text-green-600 font-medium">
            {formatTime(billableMinutes)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Nicht abrechenbar:</span>
          <span className="text-gray-500 font-medium">
            {formatTime(nonBillableMinutes)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Verbleibend:</span>
          <span
            className={`font-medium ${isOvertime ? "text-red-600" : "text-gray-700"}`}
          >
            {isOvertime
              ? `-${formatTime(overtimeMinutes)}`
              : formatTime(estimatedMinutes - actualMinutes)}
          </span>
        </div>
      </div>

      {/* Status-Indikator */}
      <div className="mt-2 text-xs">
        {progressPercentage <= 50 && (
          <div className="text-green-600">✓ Im Zeitplan</div>
        )}
        {progressPercentage > 50 && progressPercentage <= 80 && (
          <div className="text-amber-600">⚠ Zeitplan straff</div>
        )}
        {progressPercentage > 80 && progressPercentage <= 100 && (
          <div className="text-amber-600">⚠ Zeitplan fast überschritten</div>
        )}
        {progressPercentage > 100 && (
          <div className="text-red-600">🚨 Zeitplan überschritten</div>
        )}
      </div>
    </div>
  );
}
