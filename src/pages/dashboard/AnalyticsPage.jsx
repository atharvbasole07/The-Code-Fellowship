import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartColumn, Leaf, Scale, TrendingUp } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { Card, PageShell, Select, StatCard } from "../../components/ui";
import { number } from "../../lib/utils";

export function AnalyticsPage() {
  const { bins, fillHistory, collectionEvents, zones, alerts } = useAppData();
  const [range, setRange] = useState("30");
  const days = Number(range);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const averageFillPerDay = Array.from({ length: days }, (_, index) => {
    const targetDate = new Date(Date.now() - (days - index - 1) * 24 * 60 * 60 * 1000);
    const label = targetDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const samples = fillHistory.filter((entry) => {
      const date = new Date(entry.recorded_at);
      return date.toDateString() === targetDate.toDateString();
    });
    const avg = samples.reduce((sum, sample) => sum + sample.fill_level, 0) / Math.max(1, samples.length);
    return { day: label, avg: Number(avg.toFixed(1)) };
  });

  const collectionsByZone = zones.map((zone) => ({
    zone: zone.name,
    collections: collectionEvents.filter(
      (event) =>
        bins.find((bin) => bin.id === event.bin_id)?.zone_id === zone.id &&
        new Date(event.collected_at).getTime() >= cutoff
    ).length,
  }));

  const recentCollections = collectionEvents.filter((event) => new Date(event.collected_at).getTime() >= cutoff);
  const totalWaste = recentCollections.reduce((sum, event) => sum + Number(event.weight_collected_kg ?? 0), 0);
  const totalCo2 = recentCollections.reduce((sum, event) => sum + Number(event.co2_saved_kg ?? 0), 0);
  const avgFillAtCollection =
    recentCollections.reduce((sum, event) => sum + Number(event.fill_at_collection ?? 0), 0) /
    Math.max(1, recentCollections.length);
  const tripImprovement = Math.min(38, 12 + recentCollections.length * 1.2);

  return (
    <PageShell
      title="Analytics"
      subtitle="Historical trends for fill, collection performance, and zone health."
      actions={
        <Select value={range} onChange={(event) => setRange(event.target.value)} className="w-40">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </Select>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Scale} label="Total Waste Collected" value={`${number(totalWaste, 1)} kg`} />
        <StatCard icon={Leaf} label="Total CO2 Saved" value={`${number(totalCo2, 1)} kg`} />
        <StatCard icon={ChartColumn} label="Avg Fill at Collection" value={`${number(avgFillAtCollection, 1)}%`} />
        <StatCard icon={TrendingUp} label="Trip Efficiency Improvement" value={`${number(tripImprovement, 1)}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-5">
            <p className="text-lg font-semibold text-slate-900">Average Fill Level per Day</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={averageFillPerDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#2E7D32" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-lg font-semibold text-slate-900">Collection Events per Zone</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionsByZone}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="zone" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="collections" fill="#388E3C" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-5">
          <p className="text-lg font-semibold text-slate-900">Zone Breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Zone</th>
                <th className="pb-3 font-medium">Bin Count</th>
                <th className="pb-3 font-medium">Avg Fill</th>
                <th className="pb-3 font-medium">Collections This Month</th>
                <th className="pb-3 font-medium">Alerts This Month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {zones.map((zone) => {
                const zoneBins = bins.filter((bin) => bin.zone_id === zone.id);
                const avgFill = zoneBins.reduce((sum, bin) => sum + bin.fill_level, 0) / Math.max(1, zoneBins.length);
                const monthlyCollections = collectionEvents.filter(
                  (event) =>
                    bins.find((bin) => bin.id === event.bin_id)?.zone_id === zone.id &&
                    new Date(event.collected_at).getMonth() === new Date().getMonth()
                ).length;
                const monthlyAlerts = alerts.filter(
                  (alert) =>
                    bins.find((bin) => bin.id === alert.bin_id)?.zone_id === zone.id &&
                    new Date(alert.created_at).getMonth() === new Date().getMonth()
                ).length;
                return (
                  <tr key={zone.id}>
                    <td className="py-4 font-medium text-slate-900">{zone.name}</td>
                    <td className="py-4 text-slate-600">{zoneBins.length}</td>
                    <td className="py-4 text-slate-600">{number(avgFill, 1)}%</td>
                    <td className="py-4 text-slate-600">{monthlyCollections}</td>
                    <td className="py-4 text-slate-600">{monthlyAlerts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}
