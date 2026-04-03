export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatRelativeTime(value) {
  const diffMs = new Date(value).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.round(diffMs / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  return rtf.format(days, "day");
}

export function number(value, digits = 0) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value ?? 0);
}

export function severityColor(severity) {
  return {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-blue-100 text-blue-700 border-blue-200",
  }[severity] || "bg-slate-100 text-slate-700 border-slate-200";
}

export function fillColor(fillLevel) {
  if (fillLevel >= 80) return "text-red-600";
  if (fillLevel >= 60) return "text-yellow-500";
  return "text-emerald-600";
}

export function fillBar(fillLevel) {
  if (fillLevel >= 80) return "bg-red-500";
  if (fillLevel >= 60) return "bg-yellow-500";
  if (fillLevel >= 40) return "bg-orange-400";
  return "bg-emerald-500";
}

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
