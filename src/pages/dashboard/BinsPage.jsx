import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppData } from "../../context/AppDataContext";
import {
  Badge,
  Button,
  Card,
  CircularGauge,
  EmptyState,
  FillBar,
  Modal,
  PageShell,
  Select,
  Field,
  Input,
} from "../../components/ui";
import { formatDateTime, number } from "../../lib/utils";
import { useToast } from "../../context/ToastContext";

export function BinsPage() {
  const { bins, zones, fillHistory, collectionEvents, markCollected } = useAppData();
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fillFilter, setFillFilter] = useState("all");
  const [selectedBin, setSelectedBin] = useState(null);
  const { success, error } = useToast();

  const filteredBins = bins.filter((bin) => {
    const matchesSearch = bin.name.toLowerCase().includes(search.toLowerCase());
    const matchesZone = zoneFilter === "all" || bin.zone_id === zoneFilter;
    const matchesStatus =
      statusFilter === "all" || (statusFilter === "online" ? bin.is_online : !bin.is_online);
    const matchesFill =
      fillFilter === "all" ||
      (fillFilter === "low" && bin.fill_level < 40) ||
      (fillFilter === "medium" && bin.fill_level >= 40 && bin.fill_level < 60) ||
      (fillFilter === "high" && bin.fill_level >= 60 && bin.fill_level < 80) ||
      (fillFilter === "critical" && bin.fill_level >= 80);

    return matchesSearch && matchesZone && matchesStatus && matchesFill;
  });

  async function handleQuickCollect() {
    const result = await markCollected(selectedBin, {
      truckId: "TR-17",
      driverName: "Rapid Response Crew",
      weightCollectedKg: selectedBin.weight_kg,
      co2SavedKg: 16.8,
    });

    if (result.error) {
      error("Unable to log collection event.");
      return;
    }
    success("Bin marked as collected.");
    setSelectedBin(null);
  }

  return (
    <PageShell title="Bin Inventory" subtitle="Search, filter, and inspect live sensor readings across all deployed bins.">
      <Card>
        <div className="grid gap-4 lg:grid-cols-4">
          <Field label="Search">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by bin name" />
          </Field>
          <Field label="Zone">
            <Select value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)}>
              <option value="all">All zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </Select>
          </Field>
          <Field label="Fill Level">
            <Select value={fillFilter} onChange={(event) => setFillFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </Field>
        </div>
      </Card>

      {filteredBins.length ? (
        <div className="grid gap-5 xl:grid-cols-3">
          {filteredBins.map((bin) => {
            const zone = zones.find((entry) => entry.id === bin.zone_id);
            return (
              <button
                key={bin.id}
                type="button"
                onClick={() => setSelectedBin(bin)}
                className="text-left transition hover:-translate-y-1"
              >
                <Card className="h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{bin.name}</p>
                      <Badge className="mt-3 border-brand-200 bg-brand-50 text-brand-700">{zone?.name ?? "Unknown zone"}</Badge>
                    </div>
                    <CircularGauge value={bin.fill_level} />
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Odor Index</span>
                      <span className="font-semibold text-slate-900">{number(bin.odor_level, 1)}/10</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Battery</span>
                      <span className="font-semibold text-slate-900">{bin.battery_level}%</span>
                    </div>
                    <FillBar value={bin.battery_level} />
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                        <span className={`h-2.5 w-2.5 rounded-full ${bin.is_online ? "bg-emerald-500" : "bg-red-500"}`} />
                        {bin.is_online ? "Online" : "Offline"}
                      </span>
                      <span className="text-xs text-slate-400">Last seen {formatDateTime(bin.last_seen_at)}</span>
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No bins matched your filters" description="Try widening the zone, status, or fill-level filters to see more bins." />
      )}

      <Modal open={Boolean(selectedBin)} title={selectedBin?.name ?? "Bin detail"} onClose={() => setSelectedBin(null)}>
        {selectedBin ? (
          <div className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <CircularGauge value={selectedBin.fill_level} />
                <p className="mt-5 text-sm font-semibold text-slate-900">Bin ID</p>
                <p className="mt-1 break-all text-xs text-slate-500">{selectedBin.id}</p>
                <p className="mt-4 text-sm text-slate-500">Coordinates</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedBin.lat}, {selectedBin.lng}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Info title="Weight" value={`${number(selectedBin.weight_kg, 1)} kg`} />
                <Info title="Odor" value={`${number(selectedBin.odor_level, 1)}/10`} />
                <Info title="Temperature" value={`${number(selectedBin.temperature_c, 1)} °C`} />
                <Info title="Battery" value={`${selectedBin.battery_level}%`} />
                <Info title="Last Seen" value={formatDateTime(selectedBin.last_seen_at)} />
                <Info title="Status" value={selectedBin.is_online ? "Online" : "Offline"} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Card>
                <div className="mb-4">
                  <p className="text-lg font-semibold text-slate-900">Last 24h Fill History</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={fillHistory
                        .filter((entry) => entry.bin_id === selectedBin.id)
                        .slice(-12)
                        .map((entry) => ({
                          time: new Date(entry.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                          fill: entry.fill_level,
                        }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="fill" stroke="#2E7D32" fill="#A5D6A7" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <div className="mb-4">
                  <p className="text-lg font-semibold text-slate-900">Collection History</p>
                </div>
                <div className="space-y-3">
                  {collectionEvents
                    .filter((event) => event.bin_id === selectedBin.id)
                    .slice(0, 5)
                    .map((event) => (
                      <div key={event.id} className="rounded-2xl border border-slate-200 p-4">
                        <p className="font-medium text-slate-900">{event.driver_name}</p>
                        <p className="mt-1 text-sm text-slate-500">Truck {event.truck_id}</p>
                        <p className="mt-2 text-sm text-slate-500">{formatDateTime(event.collected_at)}</p>
                      </div>
                    ))}
                </div>
              </Card>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={() => setSelectedBin(null)} className="border border-slate-200 text-slate-700 hover:border-slate-300">
                Close
              </Button>
              <Button onClick={handleQuickCollect} className="bg-brand-700 text-white hover:bg-brand-900">
                Mark as Collected
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageShell>
  );
}

function Info({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
