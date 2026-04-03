import { X, Eye, EyeOff, Loader2, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { cn, fillBar, formatDateTime, severityColor } from "../lib/utils";

export function PageShell({ title, subtitle, children, actions }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Card({ className, children }) {
  return <div className={cn("rounded-3xl border border-slate-200 bg-white p-5 shadow-sm", className)}>{children}</div>;
}

export function SkeletonCard({ className = "" }) {
  return <div className={cn("h-32 animate-pulse rounded-3xl bg-slate-200/70", className)} />;
}

export function EmptyState({ title, description }) {
  return (
    <Card className="py-10 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </Card>
  );
}

export function SidebarHeader({ collapsed, onToggle }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
      <div
        className={cn(
          "hidden overflow-hidden transition-all lg:block",
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}
      >
        <p className="text-xl font-semibold tracking-tight text-white">BinWatch</p>
        <p className="text-xs text-emerald-100/70">Municipal operations</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="rounded-xl border border-white/10 p-2 text-emerald-50 transition hover:bg-white/10"
      >
        <Menu size={18} />
      </button>
    </div>
  );
}

export function Topbar({ email, onLogout }) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-lg font-semibold text-slate-900">BinWatch</p>
        <p className="text-sm text-slate-500">Real-time smart waste management for Pune</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Logged in as</p>
          <p className="text-sm font-medium text-slate-700">{email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-700 hover:text-brand-700"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, tone = "text-brand-700", alert = false }) {
  return (
    <Card className={cn("relative overflow-hidden", alert ? "border-red-200 bg-red-50/70" : "")}>
      <div className={cn("mb-6 inline-flex rounded-2xl bg-slate-100 p-3", alert ? "text-red-600" : tone)}>
        <Icon size={20} />
      </div>
      <p className="text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </Card>
  );
}

export function Badge({ children, className }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", className)}>{children}</span>;
}

export function FillBar({ value }) {
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-100">
      <div className={cn("h-2.5 rounded-full transition-all", fillBar(value))} style={{ width: `${value}%` }} />
    </div>
  );
}

export function CircularGauge({ value }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const stroke = value >= 80 ? "#dc2626" : value >= 60 ? "#f59e0b" : value >= 40 ? "#fb923c" : "#16a34a";

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-slate-900">{value}%</div>
    </div>
  );
}

export function Modal({ open, title, children, onClose, className = "" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className={cn("max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-panel", className)}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100",
        props.className
      )}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100",
        props.className
      )}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100",
        props.className
      )}
    />
  );
}

export function Button({ className, loading, children, ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

export function PasswordInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function AlertRow({ alert, bin, onResolve, showAction = true }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 px-4 py-4 lg:grid-cols-[120px_1fr_160px_120px] lg:items-center">
      <div>
        <Badge className={severityColor(alert.severity)}>{alert.severity}</Badge>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{alert.type.replace("_", " ")}</p>
      </div>
      <div>
        <p className="font-medium text-slate-900">{bin?.name ?? "Unknown bin"}</p>
        <p className="mt-1 text-sm text-slate-500">{alert.message}</p>
      </div>
      <div className="text-sm text-slate-500">
        <p>{formatDateTime(alert.created_at)}</p>
        {alert.resolved_at ? <p className="mt-1 text-xs text-slate-400">Resolved {formatDateTime(alert.resolved_at)}</p> : null}
      </div>
      {showAction ? (
        <div className="flex justify-start lg:justify-end">
          <Button onClick={onResolve} className="bg-brand-700 text-white hover:bg-brand-900">
            Resolve
          </Button>
        </div>
      ) : (
        <p className="text-sm font-medium text-emerald-700">Resolved</p>
      )}
    </div>
  );
}
