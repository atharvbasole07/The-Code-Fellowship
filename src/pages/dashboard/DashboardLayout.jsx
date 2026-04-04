import { useState } from "react";
import { Bell, ChartColumn, LayoutDashboard, Map, MapPin, Trash2, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { SidebarHeader, Topbar } from "../../components/ui";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { tr } = useLanguage();

  const navItems = [
    { to: "/dashboard", label: tr("Dashboard", "डॅशबोर्ड"), icon: LayoutDashboard, end: true },
    { to: "/dashboard/bins", label: tr("Bins", "कचरापेट्या"), icon: Trash2 },
    { to: "/dashboard/route", label: tr("Route Planner", "मार्ग नियोजन"), icon: Map },
    { to: "/dashboard/map", label: tr("City Map", "शहर नकाशा"), icon: MapPin },
    { to: "/dashboard/alerts", label: tr("Alerts", "अलर्ट्स"), icon: Bell },
    { to: "/dashboard/analytics", label: tr("Analytics", "विश्लेषण"), icon: ChartColumn },
    { to: "/dashboard/citizen", label: tr("Citizen Portal", "नागरिक पोर्टल"), icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside
        className={cn(
          "sticky top-0 flex min-h-screen flex-col bg-brand-900 transition-all",
          collapsed ? "w-[88px]" : "w-[88px] lg:w-60"
        )}
      >
        <SidebarHeader collapsed={collapsed} onToggle={() => setCollapsed((current) => !current)} />
        <nav className="flex-1 space-y-2 px-3 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                end={item.end}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive ? "bg-white text-brand-900" : "text-emerald-50/80 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                <Icon size={18} />
                <span
                  className={cn(
                    "hidden transition-all lg:inline",
                    collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100"
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <Topbar email={user?.email ?? "operator@binwatch.city"} onLogout={signOut} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
