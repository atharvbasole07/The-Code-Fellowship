import { useEffect, useState } from "react";
import { LocateFixed, Send } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { useToast } from "../../context/ToastContext";
import { Button, Card, EmptyState, Field, PageShell, Select, Textarea, Input } from "../../components/ui";

export function CitizenPortalPage({ standalone = false }) {
  const { bins, zones, submitCitizenReport } = useAppData();
  const [nearestBins, setNearestBins] = useState([]);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    binId: bins[0]?.id ?? "",
    issueType: "overflow",
    description: "",
    photoName: "",
  });
  const { success, error } = useToast();

  useEffect(() => {
    if (!form.binId && bins.length) {
      setForm((current) => ({ ...current, binId: bins[0].id }));
    }
  }, [bins, form.binId]);

  function estimateNextCollection(fillLevel) {
    if (fillLevel >= 85) return "Within 2 hours";
    if (fillLevel >= 60) return "Today by evening";
    return "Within 24 hours";
  }

  function findNearestBins() {
    if (!navigator.geolocation) {
      error("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const ranked = [...bins]
          .map((bin) => ({
            ...bin,
            distance: haversine(latitude, longitude, bin.lat, bin.lng),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5);
        setNearestBins(ranked);
        setLocating(false);
      },
      () => {
        setLocating(false);
        error("Location access was denied.");
      }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await submitCitizenReport(form);
    if (result.error) {
      error("Issue report could not be submitted.");
      return;
    }
    success("Issue report submitted to municipal operations.");
    setForm((current) => ({ ...current, description: "", photoName: "" }));
  }

  const content = (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">Find Bins Near You</p>
            <p className="text-sm text-slate-500">Locate the five closest monitored bins using your current device position.</p>
          </div>
          <Button onClick={findNearestBins} loading={locating} className="bg-brand-700 text-white hover:bg-brand-900">
            <LocateFixed size={16} />
            Find Bins Near You
          </Button>
        </div>
        {nearestBins.length ? (
          <div className="space-y-3">
            {nearestBins.map((bin) => (
              <div key={bin.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{bin.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{zones.find((zone) => zone.id === bin.zone_id)?.name}</p>
                  </div>
                  <p className="text-sm font-medium text-brand-700">{bin.distance.toFixed(2)} km</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">Fill level {bin.fill_level}%</p>
                <p className="mt-1 text-sm text-slate-500">Estimated next collection: {estimateNextCollection(bin.fill_level)}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Nearest bins not loaded yet" description="Allow location access to view nearby monitored bins and collection estimates." />
        )}
      </Card>

      <Card>
        <div className="mb-5">
          <p className="text-lg font-semibold text-slate-900">Report an Issue</p>
          <p className="text-sm text-slate-500">Submit overflow, damage, illegal dumping, or odor complaints for review.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Select bin">
            <Select value={form.binId} onChange={(event) => setForm((current) => ({ ...current, binId: event.target.value }))}>
              {bins.map((bin) => (
                <option key={bin.id} value={bin.id}>
                  {bin.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Issue type">
            <Select value={form.issueType} onChange={(event) => setForm((current) => ({ ...current, issueType: event.target.value }))}>
              <option value="overflow">Overflow</option>
              <option value="damage">Damage</option>
              <option value="illegal dumping">Illegal dumping</option>
              <option value="odor">Odor</option>
            </Select>
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe the issue you observed..."
              required
            />
          </Field>
          <Field label="Photo upload">
            <Input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setForm((current) => ({ ...current, photoName: event.target.files?.[0]?.name ?? "" }))
              }
            />
          </Field>
          <Button type="submit" className="w-full bg-brand-900 text-white hover:bg-brand-700">
            <Send size={16} />
            Submit
          </Button>
        </form>
      </Card>
    </div>
  );

  if (standalone) return content;

  return <PageShell title="Citizen Portal Preview" subtitle="Public-facing reporting and discovery tools for residents.">{content}</PageShell>;
}

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
