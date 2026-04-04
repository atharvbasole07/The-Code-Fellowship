import { useState } from "react";
import {
  AlertTriangle,
  CloudSun,
  Leaf,
  PlugZap,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppData } from "../../context/AppDataContext";
import {
  AlertRow,
  Badge,
  Button,
  Card,
  EmptyState,
  FillBar,
  Field,
  Input,
  Modal,
  PageShell,
  SkeletonCard,
  StatCard,
} from "../../components/ui";
import { fillColor, formatRelativeTime, number } from "../../lib/utils";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";

export function DashboardHomePage() {
  const { bins, alerts, zones, collectionEvents, loading, resolveAlert, markCollected } = useAppData();
  const [selectedBin, setSelectedBin] = useState(null);
  const [form, setForm] = useState({ truckId: "TR-21", driverName: "Field Crew", weightCollectedKg: "28", co2SavedKg: "18.5" });
  const { success, error } = useToast();
  const { tr } = useLanguage();

  const unresolvedAlerts = alerts.filter((entry) => !entry.resolved);
  const needsCollection = bins.filter((bin) => bin.fill_level >= 80);
  const totalCo2Saved = collectionEvents
    .filter((event) => new Date(event.collected_at).getMonth() === new Date().getMonth())
    .reduce((sum, event) => sum + Number(event.co2_saved_kg ?? 0), 0);

  const kpis = [
    { label: tr("Total Bins", "एकूण कचरापेट्या"), value: number(bins.length), icon: Trash2 },
    { label: tr("Bins Online", "ऑनलाइन कचरापेट्या"), value: number(bins.filter((bin) => bin.is_online).length), icon: PlugZap },
    { label: tr("Needs Collection", "संकलन आवश्यक"), value: number(needsCollection.length), icon: AlertTriangle, alert: needsCollection.length > 0 },
    {
      label: tr("Average Fill Level", "सरासरी भरलेले प्रमाण"),
      value: `${number(bins.reduce((sum, bin) => sum + bin.fill_level, 0) / Math.max(1, bins.length))}%`,
      icon: CloudSun,
    },
    { label: tr("Active Alerts", "सक्रिय अलर्ट्स"), value: number(unresolvedAlerts.length), icon: TriangleAlert },
    { label: tr("CO2 Saved This Month", "या महिन्यात वाचवलेले CO2"), value: `${number(totalCo2Saved, 1)} kg`, icon: Leaf },
  ];

  const distribution = [
    { name: "0-25%", count: bins.filter((bin) => bin.fill_level <= 25).length, color: "#16a34a" },
    { name: "26-50%", count: bins.filter((bin) => bin.fill_level > 25 && bin.fill_level <= 50).length, color: "#eab308" },
    { name: "51-75%", count: bins.filter((bin) => bin.fill_level > 50 && bin.fill_level <= 75).length, color: "#f97316" },
    { name: "76-100%", count: bins.filter((bin) => bin.fill_level > 75).length, color: "#dc2626" },
  ];

  async function handleResolve(alertId) {
    const result = await resolveAlert(alertId);
    if (result.error) {
      error(tr("Unable to resolve the alert right now.", "सध्या अलर्ट निकाली काढता येत नाही."));
      return;
    }
    success(tr("Alert marked as resolved.", "अलर्ट निकाली काढला."));
  }

  async function handleCollectionSubmit(event) {
    event.preventDefault();
    const result = await markCollected(selectedBin, form);
    if (result.error) {
      error(tr("Collection event could not be saved.", "संकलन नोंद जतन करता आली नाही."));
      return;
    }
    success(tr("Collection logged successfully.", "संकलन यशस्वीरीत्या नोंदवले."));
    setSelectedBin(null);
  }

  return (
    <PageShell title={tr("Operations Dashboard", "ऑपरेशन्स डॅशबोर्ड")} subtitle={tr("Live municipal sanitation overview across Pune.", "पुणेभर नगरपालिका स्वच्छतेचा थेट आढावा.")}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {loading ? kpis.map((item) => <SkeletonCard key={item.label} />) : kpis.map((item) => <StatCard key={item.label} {...item} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <div className="mb-5">
            <p className="text-lg font-semibold text-slate-900">{tr("Fill Level Distribution", "भरण्याच्या पातळीचे वितरण")}</p>
            <p className="text-sm text-slate-500">{tr("Bin counts grouped by current capacity band.", "सध्याच्या क्षमतेनुसार कचरापेट्यांची संख्या.")}</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                  {distribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-lg font-semibold text-slate-900">{tr("Active Alerts", "सक्रिय अलर्ट्स")}</p>
            <p className="text-sm text-slate-500">{tr("Open incidents requiring operator action.", "ऑपरेटरच्या कृतीची आवश्यकता असलेल्या घटना.")}</p>
          </div>
          <div className="space-y-3">
            {unresolvedAlerts.length ? (
              unresolvedAlerts.slice(0, 5).map((alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  bin={bins.find((bin) => bin.id === alert.bin_id)}
                  onResolve={() => handleResolve(alert.id)}
                />
              ))
            ) : (
              <EmptyState title={tr("No active alerts", "सक्रिय अलर्ट नाहीत")} description={tr("Everything is operating within expected thresholds right now.", "सध्या सर्व काही अपेक्षित मर्यादेत कार्यरत आहे.")} />
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-5">
          <p className="text-lg font-semibold text-slate-900">{tr("Priority Bins", "प्राधान्य कचरापेट्या")}</p>
          <p className="text-sm text-slate-500">{tr("Highest fill level bins ranked for immediate collection.", "तातडीच्या संकलनासाठी सर्वाधिक भरलेल्या कचरापेट्या.")}</p>
        </div>
        {bins.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3 font-medium">{tr("Bin Name", "कचरापेटीचे नाव")}</th>
                  <th className="pb-3 font-medium">{tr("Zone", "विभाग")}</th>
                  <th className="pb-3 font-medium">{tr("Fill Level", "भरण्याची पातळी")}</th>
                  <th className="pb-3 font-medium">{tr("Odor", "दुर्गंधी")}</th>
                  <th className="pb-3 font-medium">{tr("Battery", "बॅटरी")}</th>
                  <th className="pb-3 font-medium">{tr("Status", "स्थिती")}</th>
                  <th className="pb-3 font-medium text-right">{tr("Action", "कृती")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...bins]
                  .sort((a, b) => b.fill_level - a.fill_level)
                  .slice(0, 8)
                  .map((bin) => {
                    const zone = zones.find((entry) => entry.id === bin.zone_id);
                    return (
                      <tr key={bin.id}>
                        <td className="py-4 font-medium text-slate-900">{bin.name}</td>
                        <td className="py-4 text-slate-600">{zone?.name ?? tr("Unknown zone", "अज्ञात विभाग")}</td>
                        <td className="py-4">
                          <div className="w-40">
                            <div className="mb-2 flex items-center justify-between">
                              <span className={`text-sm font-semibold ${fillColor(bin.fill_level)}`}>{bin.fill_level}%</span>
                              <span className="text-xs text-slate-400">{formatRelativeTime(bin.last_seen_at)}</span>
                            </div>
                            <FillBar value={bin.fill_level} />
                          </div>
                        </td>
                        <td className="py-4 text-slate-600">{number(bin.odor_level, 1)}</td>
                        <td className="py-4 text-slate-600">{bin.battery_level}%</td>
                        <td className="py-4">
                          <Badge className={bin.is_online ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-red-200 bg-red-100 text-red-700"}>
                            {bin.is_online ? tr("Online", "ऑनलाइन") : tr("Offline", "ऑफलाइन")}
                          </Badge>
                        </td>
                        <td className="py-4 text-right">
                          <Button onClick={() => setSelectedBin(bin)} className="bg-brand-700 text-white hover:bg-brand-900">
                            {tr("Mark Collected", "संकलित म्हणून चिन्हांकित करा")}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={tr("No bins available", "कचरापेट्या उपलब्ध नाहीत")} description={tr("Connect Supabase or add demo records to populate this view.", "हा दृश्य भरवण्यासाठी Supabase कनेक्ट करा किंवा डेमो नोंदी जोडा.")} />
        )}
      </Card>

      <Modal open={Boolean(selectedBin)} title={tr("Log collection event", "संकलन नोंद करा")} onClose={() => setSelectedBin(null)}>
        {selectedBin ? (
          <form className="space-y-4" onSubmit={handleCollectionSubmit}>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{selectedBin.name}</p>
              <p className="mt-1 text-sm text-slate-500">{tr("Current fill", "सध्याचे भरणे")}: {selectedBin.fill_level}%</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={tr("Truck ID", "ट्रक आयडी")}>
                <Input value={form.truckId} onChange={(event) => setForm((current) => ({ ...current, truckId: event.target.value }))} required />
              </Field>
              <Field label={tr("Driver Name", "ड्रायव्हरचे नाव")}>
                <Input value={form.driverName} onChange={(event) => setForm((current) => ({ ...current, driverName: event.target.value }))} required />
              </Field>
              <Field label={tr("Weight Collected (kg)", "गोळा केलेले वजन (kg)")}>
                <Input type="number" value={form.weightCollectedKg} onChange={(event) => setForm((current) => ({ ...current, weightCollectedKg: event.target.value }))} required />
              </Field>
              <Field label={tr("CO2 Saved (kg)", "वाचवलेले CO2 (kg)")}>
                <Input type="number" step="0.1" value={form.co2SavedKg} onChange={(event) => setForm((current) => ({ ...current, co2SavedKg: event.target.value }))} required />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-brand-700 text-white hover:bg-brand-900">
                {tr("Save collection", "संकलन जतन करा")}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </PageShell>
  );
}
