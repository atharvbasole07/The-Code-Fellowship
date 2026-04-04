import { useEffect, useRef, useState, useMemo } from "react";
import { Download, Route, MapPin, Navigation, Clock, Fuel, Loader2, ExternalLink } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import { useAppData } from "../../context/AppDataContext";
import { Button, Card, EmptyState, PageShell } from "../../components/ui";
import { useLanguage } from "../../context/LanguageContext";

/* ── Custom numbered marker icon factory ── */
function numberedIcon(number, color = "#1B5E20") {
  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
      ">
        <svg viewBox="0 0 32 42" width="32" height="42" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.16 24.84 0 16 0Z" fill="${color}"/>
          <circle cx="16" cy="16" r="12" fill="white"/>
          <text x="16" y="21" text-anchor="middle" font-size="13" font-weight="700" fill="${color}" font-family="Inter, sans-serif">${number}</text>
        </svg>
      </div>
    `,
  });
}

/* ── Start/End depot icon ── */
function depotIcon(label) {
  return L.divIcon({
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
    html: `
      <div style="position: relative; width: 36px; height: 46px;">
        <svg viewBox="0 0 36 46" width="36" height="46" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M18 0 C8 0 0 8 0 18 C0 32 18 46 18 46 C18 46 36 32 36 18 C36 8 28 0 18 0Z" fill="#1e293b"/>
          <circle cx="18" cy="18" r="13" fill="white"/>
          <text x="18" y="23" text-anchor="middle" font-size="10" font-weight="700" fill="#1e293b" font-family="Inter, sans-serif">${label}</text>
        </svg>
      </div>
    `,
  });
}

/* ── Compute a nearest-neighbor route (greedy TSP) ── */
function nearestNeighborRoute(bins) {
  if (bins.length <= 1) return bins;
  const remaining = [...bins];
  const route = [remaining.shift()];
  while (remaining.length > 0) {
    const last = route[route.length - 1];
    let nearestIndex = 0;
    let nearestDist = Infinity;
    remaining.forEach((bin, index) => {
      const dx = bin.lat - last.lat;
      const dy = bin.lng - last.lng;
      const dist = dx * dx + dy * dy;
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = index;
      }
    });
    route.push(remaining.splice(nearestIndex, 1)[0]);
  }
  return route;
}

/* ── Fetch real road route from OSRM (free, no API key) ── */
async function fetchRoadRoute(waypoints) {
  if (waypoints.length < 2) return null;
  const coords = waypoints.map((wp) => `${wp.lng},${wp.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === "Ok" && data.routes?.[0]) {
      const route = data.routes[0];
      return {
        coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distance: route.distance,
        duration: route.duration,
      };
    }
  } catch (error) {
    console.warn("OSRM routing failed, falling back to straight lines:", error);
  }
  return null;
}

/* ── Auto-fit map bounds ── */
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [positions, map]);
  return null;
}

/* ── Animated route drawing ── */
function AnimatedPolyline({ positions, color = "#1B5E20" }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    setVisibleCount(0);
    let count = 0;
    const totalPoints = positions.length;
    const step = Math.max(1, Math.floor(totalPoints / 120)); // Draw in ~120 frames

    function animate() {
      count = Math.min(count + step, totalPoints);
      setVisibleCount(count);
      if (count < totalPoints) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [positions]);

  if (visibleCount < 2) return null;

  return (
    <>
      {/* Shadow line */}
      <Polyline
        positions={positions.slice(0, visibleCount)}
        pathOptions={{ color: "#000", weight: 7, opacity: 0.15 }}
      />
      {/* Main route */}
      <Polyline
        positions={positions.slice(0, visibleCount)}
        pathOptions={{ color, weight: 5, opacity: 0.85, lineCap: "round", lineJoin: "round" }}
      />
      {/* Directional dashes */}
      <Polyline
        positions={positions.slice(0, visibleCount)}
        pathOptions={{
          color: "white",
          weight: 2,
          opacity: 0.6,
          dashArray: "12, 18",
          lineCap: "round",
        }}
      />
    </>
  );
}

/* ── Depot location (PMC headquarters) ── */
const DEPOT = { lat: 18.5204, lng: 73.8567, name: "PMC Headquarters" };

export function RoutePlannerPage() {
  const { bins, zones } = useAppData();
  const { tr } = useLanguage();
  const [threshold, setThreshold] = useState(60);
  const [generated, setGenerated] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const routeBins = useMemo(() => {
    const filtered = bins
      .filter((bin) => bin.fill_level >= threshold)
      .sort((a, b) => {
        const zoneA = zones.find((zone) => zone.id === a.zone_id)?.name ?? "";
        const zoneB = zones.find((zone) => zone.id === b.zone_id)?.name ?? "";
        return zoneA.localeCompare(zoneB) || b.fill_level - a.fill_level;
      });
    return nearestNeighborRoute(filtered);
  }, [bins, zones, threshold]);

  const tripsSaved = Math.max(0, Math.round(routeBins.length / 4));
  const fuelSaved = tripsSaved * 15 * 95;
  const co2Saved = tripsSaved * 15 * 2.68;

  async function generateRoute() {
    setLoading(true);
    setRouteError("");
    setGenerated(true);

    if (routeBins.length === 0) {
      setLoading(false);
      return;
    }

    // Build waypoints: Depot → bins in order → Depot
    const waypoints = [
      DEPOT,
      ...routeBins.map((bin) => ({ lat: bin.lat, lng: bin.lng })),
      DEPOT,
    ];

    const result = await fetchRoadRoute(waypoints);
    if (result) {
      setRouteData(result);
    } else {
      // Fallback: straight-line route
      setRouteData({
        coordinates: waypoints.map((wp) => [wp.lat, wp.lng]),
        distance: null,
        duration: null,
      });
      setRouteError(tr("Road routing unavailable. Showing straight-line route.", "रस्त्याचा मार्ग उपलब्ध नाही. सरळ रेषेचा मार्ग दाखवला आहे."));
    }
    setLoading(false);
  }

  function downloadRouteSheet() {
    const lines = [
      "BinWatch — Optimized Collection Route",
      `Generated: ${new Date().toLocaleString()}`,
      `Threshold: ${threshold}%+`,
      routeData?.distance ? `Total distance: ${(routeData.distance / 1000).toFixed(1)} km` : "",
      routeData?.duration ? `Estimated time: ${Math.round(routeData.duration / 60)} min` : "",
      "",
      "STOP  BIN NAME                    ZONE                FILL%  ODOR",
      "─".repeat(80),
      `  S   ${DEPOT.name.padEnd(28)} ${"Depot".padEnd(20)} ─      ─`,
      ...routeBins.map((bin, index) => {
        const zone = zones.find((z) => z.id === bin.zone_id)?.name ?? "Unknown";
        return `  ${String(index + 1).padStart(2)}  ${bin.name.padEnd(28)} ${zone.padEnd(20)} ${String(bin.fill_level).padStart(3)}%   ${bin.odor_level}`;
      }),
      `  E   ${DEPOT.name.padEnd(28)} ${"Depot".padEnd(20)} ─      ─`,
      "",
      `Bins: ${routeBins.length} | Est. fuel saved: Rs ${fuelSaved} | Est. CO2 saved: ${co2Saved.toFixed(1)} kg`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "binwatch-route-sheet.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function redirectToGoogleMaps() {
    if (routeBins.length === 0) return;

    const origin = encodeURIComponent(`${DEPOT.lat},${DEPOT.lng}`);
    const destination = origin; // Return to depot

    // Google Maps supports up to ~25 waypoints in a URL
    const waypointCoords = routeBins
      .slice(0, 25)
      .map((bin) => `${bin.lat},${bin.lng}`)
      .join("|");
    const waypoints = encodeURIComponent(waypointCoords);

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
    window.open(url, "_blank");
  }

  // Map positions for fitting bounds
  const allPositions = generated && routeBins.length > 0
    ? [[DEPOT.lat, DEPOT.lng], ...routeBins.map((b) => [b.lat, b.lng])]
    : [];

  return (
    <PageShell
      title={tr("Route Planner", "मार्ग नियोजन")}
      subtitle={tr("Generate optimized collection routes visualized on the map — like Google Maps for waste trucks.", "नकाशावर दिसणारे अनुकूलित संकलन मार्ग तयार करा — कचरा ट्रकसाठी Google Maps प्रमाणे.")}
      actions={
        <Button
          onClick={generateRoute}
          disabled={loading}
          className="bg-brand-700 text-white hover:bg-brand-900"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Route size={16} />
          )}
          {loading ? tr("Generating Route...", "मार्ग तयार होत आहे...") : tr("Generate Optimal Route", "अनुकूल मार्ग तयार करा")}
        </Button>
      }
    >
      {/* Threshold Control */}
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">{tr("Collection Threshold", "संकलन मर्यादा")}</p>
            <p className="text-sm text-slate-500">{tr("Bins at or above this fill level are added to the route.", "या पातळीइतके किंवा जास्त भरलेले डबे मार्गात जोडले जातील.")}</p>
          </div>
          <div className="flex w-full max-w-md items-center gap-4">
            <input
              type="range"
              min="40"
              max="90"
              value={threshold}
              onChange={(event) => {
                setThreshold(Number(event.target.value));
                setGenerated(false);
                setRouteData(null);
              }}
              className="w-full accent-[#2E7D32]"
            />
            <span className="rounded-2xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
              {threshold}%
            </span>
          </div>
        </div>
      </Card>

      {generated ? (
        routeBins.length ? (
          <div className="space-y-6">
            {/* ── Route Map ── */}
            <Card className="relative overflow-hidden p-0">
              <div className="h-[55vh] w-full">
                <MapContainer
                  center={[DEPOT.lat, DEPOT.lng]}
                  zoom={13}
                  scrollWheelZoom
                  className="h-full w-full rounded-3xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitBounds positions={allPositions} />

                  {/* Start depot marker */}
                  <Marker position={[DEPOT.lat, DEPOT.lng]} icon={depotIcon("S")}>
                    <Popup>
                      <div className="space-y-1">
                        <p className="font-semibold">🏛️ {DEPOT.name}</p>
                        <p className="text-sm text-slate-500">{tr("Start / End Point (Depot)", "सुरुवात / शेवट बिंदू (डेपो)")}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Numbered bin markers */}
                  {routeBins.map((bin, index) => {
                    const fillColor =
                      bin.fill_level >= 80
                        ? "#dc2626"
                        : bin.fill_level >= 60
                        ? "#f59e0b"
                        : "#16a34a";
                    return (
                      <Marker
                        key={bin.id}
                        position={[bin.lat, bin.lng]}
                        icon={numberedIcon(index + 1, fillColor)}
                      >
                        <Popup>
                          <div className="space-y-1">
                            <p className="font-semibold">
                              {tr("Stop", "थांबा")} #{index + 1}: {bin.name}
                            </p>
                            <p>{tr("Fill", "भरलेले")}: {bin.fill_level}%</p>
                            <p>
                              {tr("Zone", "विभाग")}:{" "}
                              {zones.find((z) => z.id === bin.zone_id)?.name}
                            </p>
                            <p>{tr("Odor", "दुर्गंधी")}: {bin.odor_level}</p>
                            <p>{tr("Status", "स्थिती")}: {bin.is_online ? `🟢 ${tr("Online", "ऑनलाइन")}` : `🔴 ${tr("Offline", "ऑफलाइन")}`}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Route line */}
                  {routeData?.coordinates && (
                    <AnimatedPolyline
                      positions={routeData.coordinates}
                      color="#1B5E20"
                    />
                  )}
                </MapContainer>
              </div>

              {/* Route stats overlay */}
              <div className="absolute bottom-4 left-4 z-[500] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-panel backdrop-blur">
                <p className="mb-2 text-sm font-semibold text-slate-900">{tr("Route Overview", "मार्ग आढावा")}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin size={14} className="text-brand-700" />
                    <span>{routeBins.length} {tr("stops", "थांबे")}</span>
                  </div>
                  {routeData?.distance && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Navigation size={14} className="text-blue-600" />
                      <span>{(routeData.distance / 1000).toFixed(1)} km</span>
                    </div>
                  )}
                  {routeData?.duration && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock size={14} className="text-amber-600" />
                      <span>~{Math.round(routeData.duration / 60)} min</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="absolute top-4 right-4 z-[500] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-panel backdrop-blur">
                <p className="mb-2 text-sm font-semibold text-slate-900">{tr("Legend", "लेजेन्ड")}</p>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-slate-700" />
                    {tr("Depot (Start/End)", "डेपो (सुरुवात/शेवट)")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
                    {tr("Fill ≥ 80%", "भरलेले ≥ 80%")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                    {tr("Fill 60–79%", "भरलेले 60–79%")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-emerald-600" />
                    {tr("Fill < 60%", "भरलेले < 60%")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1 w-6 rounded bg-[#1B5E20]" />
                    {tr("Route path", "मार्ग")}
                  </div>
                </div>
              </div>

              {routeError && (
                <div className="absolute bottom-4 right-4 z-[500] rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700 shadow">
                  ⚠️ {routeError}
                </div>
              )}
            </Card>

            {/* ── Route Details + Impact ── */}
            <div className="grid gap-6 xl:grid-cols-[1.25fr_360px]">
              <Card>
                <div className="mb-5">
                  <p className="text-lg font-semibold text-slate-900">
                    {tr("Optimized Collection Sequence", "अनुकूलित संकलन क्रम")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {tr("Route follows nearest-neighbor optimization from the depot and back.", "मार्ग डेपोपासून आणि डेपोपर्यंत जवळच्या बिंदूनुसार अनुकूलित केला जातो.")}
                  </p>
                </div>
                <ol className="space-y-3">
                  {/* Start depot */}
                  <li className="flex gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sm font-semibold text-white">
                      S
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        🏛️ {DEPOT.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {tr("Start point — Truck depot", "सुरुवातीचा बिंदू — ट्रक डेपो")}
                      </p>
                    </div>
                  </li>

                  {routeBins.map((bin, index) => {
                    const fillColor =
                      bin.fill_level >= 80
                        ? "border-red-200 bg-red-50"
                        : bin.fill_level >= 60
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200";
                    const numBg =
                      bin.fill_level >= 80
                        ? "bg-red-600"
                        : bin.fill_level >= 60
                        ? "bg-amber-500"
                        : "bg-brand-700";
                    return (
                      <li
                        key={bin.id}
                        className={`flex gap-4 rounded-2xl border p-4 ${fillColor}`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${numBg} text-sm font-semibold text-white`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">
                            {bin.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {zones.find((z) => z.id === bin.zone_id)?.name}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                            <span>
                              Fill{" "}
                              <strong
                                className={
                                  bin.fill_level >= 80
                                    ? "text-red-600"
                                    : "text-slate-900"
                                }
                              >
                                {bin.fill_level}%
                              </strong>
                            </span>
                            <span>Odor {bin.odor_level}</span>
                            <span>
                              {bin.is_online ? "🟢 Online" : "🔴 Offline"}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}

                  {/* End depot */}
                  <li className="flex gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sm font-semibold text-white">
                      E
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        🏛️ {DEPOT.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {tr("End point — Return to depot", "शेवटचा बिंदू — डेपोला परत")}
                      </p>
                    </div>
                  </li>
                </ol>
              </Card>

              <Card className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {tr("Route Impact Summary", "मार्ग प्रभाव सारांश")}
                  </p>
                </div>
                <Summary title={tr("Total bins to collect", "संकलनासाठी एकूण कचरापेट्या")} value={routeBins.length} />
                {routeData?.distance && (
                  <Summary
                    title={tr("Total route distance", "एकूण मार्ग अंतर")}
                    value={`${(routeData.distance / 1000).toFixed(1)} km`}
                  />
                )}
                {routeData?.duration && (
                  <Summary
                    title={tr("Estimated driving time", "अंदाजे प्रवास वेळ")}
                    value={`${Math.round(routeData.duration / 60)} min`}
                  />
                )}
                <Summary
                  title={tr("Estimated fuel saved vs fixed schedule", "स्थिर वेळापत्रकापेक्षा अंदाजे इंधन बचत")}
                  value={`₹ ${fuelSaved.toFixed(0)}`}
                />
                <Summary
                  title={tr("Estimated CO₂ saved", "अंदाजे वाचलेले CO₂")}
                  value={`${co2Saved.toFixed(1)} kg`}
                />
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={redirectToGoogleMaps}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <ExternalLink size={16} />
                    {tr("Open in Google Maps", "Google Maps मध्ये उघडा")}
                  </Button>
                  <Button
                    onClick={downloadRouteSheet}
                    className="w-full bg-brand-900 text-white hover:bg-brand-700"
                  >
                    <Download size={16} />
                    {tr("Download Route Sheet", "मार्ग पत्रक डाउनलोड करा")}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <EmptyState
            title={tr("No bins require collection", "कोणत्याही कचरापेटीस संकलनाची गरज नाही")}
            description={tr("Raise or lower the threshold and generate the route again when conditions change.", "स्थिती बदलल्यावर मर्यादा वाढवा/कमी करा आणि पुन्हा मार्ग तयार करा.")}
          />
        )
      ) : (
        <EmptyState
          title={tr("Route not generated yet", "मार्ग अजून तयार झालेला नाही")}
          description={tr("Use the Generate Optimal Route action to create a prioritized collection sequence with map visualization.", "प्राधान्यक्रमित संकलन क्रम तयार करण्यासाठी 'अनुकूल मार्ग तयार करा' वापरा.")}
        />
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
