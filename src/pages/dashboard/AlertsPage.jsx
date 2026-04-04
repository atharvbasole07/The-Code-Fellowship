import { useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { AlertRow, Button, Card, EmptyState, PageShell } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";

export function AlertsPage() {
  const { alerts, bins, resolveAlert } = useAppData();
  const [tab, setTab] = useState("active");
  const { success, error } = useToast();
  const { tr } = useLanguage();
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
    <PageShell title={tr("Alerts Center", "अलर्ट्स केंद्र")} subtitle={tr("Track critical events, sensor exceptions, and issue reports.", "महत्त्वाच्या घटना, सेन्सर अपवाद आणि तक्रारींचा मागोवा घ्या.")}>
      <Card>
        <div className="flex gap-3">
          {["active", "resolved"].map((item) => (
            <Button
              key={item}
              onClick={() => setTab(item)}
              className={tab === item ? "bg-brand-700 text-white" : "border border-slate-200 text-slate-700"}
            >
              {item === "active" ? tr("Active", "सक्रिय") : tr("Resolved", "निकाली")}
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
        <EmptyState title={tab === "active" ? tr("No active alerts", "सक्रिय अलर्ट नाहीत") : tr("No resolved alerts", "निकाली अलर्ट नाहीत")} description={tr("This panel will populate automatically as alert states change.", "अलर्टची स्थिती बदलल्यावर हा पॅनेल आपोआप अपडेट होईल.")} />
      )}
    </PageShell>
  );
}
