import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { useAppData } from "../../context/AppDataContext";
import { Card, PageShell } from "../../components/ui";
import { formatDateTime } from "../../lib/utils";
import { useLanguage } from "../../context/LanguageContext";

export function CityMapPage() {
  const { bins, zones } = useAppData();
  const { tr } = useLanguage();

  return (
    <PageShell title={tr("City Map", "शहर नकाशा")} subtitle={tr("Spatial view of current bin status centered on Pune.", "पुणे केंद्रित वर्तमान कचरापेटी स्थितीचा स्थानिक आढावा.")}>
      <Card className="relative h-[72vh] overflow-hidden p-0">
        <MapContainer center={[18.5204, 73.8567]} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {bins.map((bin) => {
            const color = bin.fill_level >= 80 ? "#dc2626" : bin.fill_level >= 60 ? "#eab308" : "#16a34a";
            return (
              <CircleMarker
                key={bin.id}
                center={[bin.lat, bin.lng]}
                radius={bin.fill_level >= 80 ? 12 : 9}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.75 }}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{bin.name}</p>
                    <p>{tr("Fill", "भरलेले")}: {bin.fill_level}%</p>
                    <p>{tr("Zone", "विभाग")}: {zones.find((zone) => zone.id === bin.zone_id)?.name}</p>
                    <p>{tr("Last seen", "शेवटचे दिसले")}: {formatDateTime(bin.last_seen_at)}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        <div className="absolute bottom-4 right-4 z-[500] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-panel">
          <p className="mb-3 text-sm font-semibold text-slate-900">{tr("Legend", "लेजेन्ड")}</p>
          <Legend color="bg-emerald-500" label={tr("Below 60%", "60% पेक्षा कमी")} />
          <Legend color="bg-yellow-500" label={tr("60% to 79%", "60% ते 79%")} />
          <Legend color="bg-red-500" label={tr("80% and above", "80% आणि अधिक")} pulse />
        </div>
      </Card>
    </PageShell>
  );
}

function Legend({ color, label, pulse = false }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <div className="relative h-3.5 w-3.5">
        {pulse ? <span className="absolute inset-0 rounded-full bg-red-400/50 animate-pulseRing" /> : null}
        <span className={`absolute inset-0 rounded-full ${color}`} />
      </div>
      <span>{label}</span>
    </div>
  );
}
