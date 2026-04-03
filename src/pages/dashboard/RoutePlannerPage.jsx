import { useState } from "react";
import { Download, Route } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { Button, Card, EmptyState, PageShell } from "../../components/ui";

export function RoutePlannerPage() {
  const { bins, zones } = useAppData();
  const [threshold, setThreshold] = useState(60);
  const [generated, setGenerated] = useState(false);

  const routeBins = bins
    .filter((bin) => bin.fill_level >= threshold)
    .sort((a, b) => {
      const zoneA = zones.find((zone) => zone.id === a.zone_id)?.name ?? "";
      const zoneB = zones.find((zone) => zone.id === b.zone_id)?.name ?? "";
      return zoneA.localeCompare(zoneB) || b.fill_level - a.fill_level;
    });

  const tripsSaved = Math.max(0, Math.round(routeBins.length / 4));
  const fuelSaved = tripsSaved * 15 * 95;
  const co2Saved = tripsSaved * 15 * 2.68;

  function downloadRouteSheet() {
    const content = routeBins
      .map((bin, index) => {
        const zone = zones.find((entry) => entry.id === bin.zone_id)?.name ?? "Unknown zone";
        return `${index + 1}. ${bin.name} | ${zone} | Fill ${bin.fill_level}% | Odor ${bin.odor_level}`;
      })
      .join("\n");
    const blob = new Blob([content || "No bins require collection."], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "binwatch-route-sheet.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageShell
      title="Route Planner"
      subtitle="Prioritize collections using live fill and odor readings instead of fixed schedules."
      actions={
        <Button onClick={() => setGenerated(true)} className="bg-brand-700 text-white hover:bg-brand-900">
          <Route size={16} />
          Generate Optimal Route
        </Button>
      }
    >
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">Collection Threshold</p>
            <p className="text-sm text-slate-500">Bins at or above this fill level are added to the route.</p>
          </div>
          <div className="flex w-full max-w-md items-center gap-4">
            <input
              type="range"
              min="40"
              max="90"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="w-full accent-[#2E7D32]"
            />
            <span className="rounded-2xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">{threshold}%</span>
          </div>
        </div>
      </Card>

      {generated ? (
        routeBins.length ? (
          <div className="grid gap-6 xl:grid-cols-[1.25fr_360px]">
            <Card>
              <div className="mb-5">
                <p className="text-lg font-semibold text-slate-900">Optimized Collection Sequence</p>
              </div>
              <ol className="space-y-4">
                {routeBins.map((bin, index) => (
                  <li key={bin.id} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 font-semibold text-brand-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{bin.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{zones.find((zone) => zone.id === bin.zone_id)?.name}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Fill {bin.fill_level}% | Odor {bin.odor_level} | Status {bin.is_online ? "Online" : "Offline"}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
            <Card className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">Route Impact Summary</p>
              </div>
              <Summary title="Total bins to collect" value={routeBins.length} />
              <Summary title="Estimated fuel saved vs fixed schedule" value={`Rs ${fuelSaved.toFixed(0)}`} />
              <Summary title="Estimated CO2 saved" value={`${co2Saved.toFixed(1)} kg`} />
              <Button onClick={downloadRouteSheet} className="w-full bg-brand-900 text-white hover:bg-brand-700">
                <Download size={16} />
                Download Route Sheet
              </Button>
            </Card>
          </div>
        ) : (
          <EmptyState title="No bins require collection" description="Raise or lower the threshold and generate the route again when conditions change." />
        )
      ) : (
        <EmptyState title="Route not generated yet" description="Use the Generate Optimal Route action to create a prioritized collection sequence." />
      )}
    </PageShell>
  );
}

function Summary({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
