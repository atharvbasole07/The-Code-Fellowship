import { useState } from "react";
import { Bell, Map, Menu, Trash2 } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Topbar } from "../../components/ui";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/driver", label: "Route Planner", icon: Map, end: true },
  { to: "/driver/bins", label: "Bins", icon: Trash2 },
  { to: "/driver/alerts", label: "Alerts", icon: Bell },
];

export function DriverDashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside
        className={cn(
          "sticky top-0 flex min-h-screen flex-col bg-blue-900 transition-all",
          collapsed ? "w-[88px]" : "w-[88px] lg:w-60"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
          <div
            className={cn(
              "hidden overflow-hidden transition-all lg:flex lg:items-center lg:gap-3",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            <img
              src="/whitelogobin.jpeg"
              alt="BinWatch Logo"
              className="h-8 w-8 shrink-0 rounded-md border border-black object-contain drop-shadow-sm"
            />
            <div className="whitespace-nowrap">
              <p className="text-xl font-semibold tracking-tight text-white">Driver Panel</p>
              <p className="text-xs text-blue-100/70">Field operations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="rounded-xl border border-white/10 p-2 text-blue-50 transition hover:bg-white/10"
          >
            <Menu size={18} />
          </button>
        </div>
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
                    isActive ? "bg-white text-blue-900" : "text-blue-50/80 hover:bg-white/10 hover:text-white"
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
        <Topbar email={user?.email ?? "driver@binwatch.city"} onLogout={signOut} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
