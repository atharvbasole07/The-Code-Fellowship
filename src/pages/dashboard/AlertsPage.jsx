import { useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { AlertRow, Button, Card, EmptyState, PageShell } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

export function AlertsPage() {
  const { alerts, bins, resolveAlert } = useAppData();
  const [tab, setTab] = useState("active");
  const { success, error } = useToast();
  const data = alerts.filter((alert) => (tab === "active" ? !alert.resolved : alert.resolved));

  async function handleResolve(alertId) {
    const result = await resolveAlert(alertId);
    if (result.error) {
      error("Could not update alert status.");
      return;
    }
    success("Alert resolved.");
  }

  return (
    <PageShell title="Alerts Center" subtitle="Track critical events, sensor exceptions, and issue reports.">
      <Card>
        <div className="flex gap-3">
          {["active", "resolved"].map((item) => (
            <Button
              key={item}
              onClick={() => setTab(item)}
              className={tab === item ? "bg-brand-700 text-white" : "border border-slate-200 text-slate-700"}
            >
              {item === "active" ? "Active" : "Resolved"}
            </Button>
          ))}
        </div>
      </Card>
      {data.length ? (
        <div className="space-y-3">
          {data.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              bin={bins.find((bin) => bin.id === alert.bin_id)}
              showAction={tab === "active"}
              onResolve={() => handleResolve(alert.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState title={`No ${tab} alerts`} description="This panel will populate automatically as alert states change." />
      )}
    </PageShell>
  );
}
