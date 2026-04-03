function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const testimonials = [
  {
    id: 1,
    name: "Dr. Meera Kulkarni",
    role: "Urban Systems Advisor, Smart Pune Mission",
    quote:
      "BinWatch gives city operators the kind of live situational awareness that turns sanitation from reactive firefighting into a managed public service.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "Arjun Menon",
    role: "Municipal Operations Director",
    quote:
      "The biggest impact is not just cleaner streets. It is the confidence that crews are being sent where they matter most, every single day.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "Prof. Kavita Deshpande",
    role: "Chair, Centre for Urban Sustainability",
    quote:
      "Reliable bin telemetry creates a measurable path to lower overflow incidents, better labor planning, and credible sustainability reporting.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 4,
    name: "Rohan Patil",
    role: "Head of Civic Technology Partnerships",
    quote:
      "For growing cities, a professional waste dashboard is no longer a luxury. It is core infrastructure for public health and accountability.",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 5,
    name: "Naina Shah",
    role: "Regional Sustainability Program Lead",
    quote:
      "The best smart-city platforms are the ones frontline teams actually trust. BinWatch presents the right signals with the right urgency.",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80",
  },
];

export const heroImages = [
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
];

export const zones = [
  { id: "zone-kp", name: "Koregaon Park", city: "Pune", connectivity_type: "LoRaWAN", created_at: daysAgo(60) },
  { id: "zone-sn", name: "Shivajinagar", city: "Pune", connectivity_type: "4G", created_at: daysAgo(55) },
  { id: "zone-hp", name: "Hadapsar", city: "Pune", connectivity_type: "NB-IoT", created_at: daysAgo(52) },
  { id: "zone-kr", name: "Kothrud", city: "Pune", connectivity_type: "LoRaWAN", created_at: daysAgo(48) },
];

export const bins = [
  ["zone-kp", "KP-01 River Walk", 18.5368, 73.8941, 88, 41.2, 8.2, 32.1, 38, true, 0.4],
  ["zone-kp", "KP-02 North Avenue", 18.5342, 73.8993, 64, 28.1, 6.3, 30.5, 74, true, 1.1],
  ["zone-kp", "KP-03 Plaza Lane", 18.5381, 73.9018, 29, 10.6, 2.8, 28.1, 81, true, 2.3],
  ["zone-kp", "KP-04 Garden Square", 18.5402, 73.8964, 92, 44.5, 9.1, 34.2, 22, true, 0.2],
  ["zone-kp", "KP-05 East Drive", 18.5324, 73.9023, 47, 18.3, 4.2, 29.6, 66, false, 7.8],
  ["zone-sn", "SV-01 Station Road", 18.5319, 73.8487, 73, 31.9, 5.2, 31.1, 51, true, 0.8],
  ["zone-sn", "SV-02 Court Junction", 18.5283, 73.8524, 18, 7.2, 1.6, 27.8, 92, true, 3.6],
  ["zone-sn", "SV-03 University Gate", 18.5464, 73.8292, 84, 39.1, 7.4, 33.3, 34, true, 0.5],
  ["zone-sn", "SV-04 Civic Plaza", 18.5268, 73.8471, 52, 21.4, 4.8, 29.4, 57, true, 1.6],
  ["zone-sn", "SV-05 Bus Depot", 18.5274, 73.8562, 67, 25.5, 6.1, 30.2, 43, true, 0.9],
  ["zone-hp", "HD-01 Magar Ring", 18.5088, 73.9284, 95, 45.7, 8.8, 34.4, 26, true, 0.1],
  ["zone-hp", "HD-02 Market Link", 18.5007, 73.9318, 76, 33.1, 7.2, 32.7, 61, true, 0.7],
  ["zone-hp", "HD-03 Tech Park", 18.5164, 73.9363, 35, 12.5, 2.4, 28.6, 89, true, 4.9],
  ["zone-hp", "HD-04 Canal Edge", 18.4973, 73.9241, 58, 23.4, 5.3, 30.4, 79, true, 1.4],
  ["zone-hp", "HD-05 Transit Point", 18.5031, 73.9392, 81, 37.2, 7.5, 31.9, 48, false, 8.4],
  ["zone-kr", "KT-01 Paud Hub", 18.5076, 73.8073, 44, 17.1, 3.5, 28.9, 88, true, 2.1],
  ["zone-kr", "KT-02 Temple Circle", 18.5041, 73.8141, 69, 26.8, 5.9, 30.6, 64, true, 0.6],
  ["zone-kr", "KT-03 Metro Feeder", 18.5012, 73.8218, 15, 6.3, 1.4, 27.5, 97, true, 5.2],
  ["zone-kr", "KT-04 Housing Board", 18.4958, 73.8169, 83, 35.1, 7.1, 32.4, 37, true, 0.3],
  ["zone-kr", "KT-05 Park Ridge", 18.4989, 73.8098, 61, 24.7, 5.1, 29.8, 72, true, 1.8],
].map(([zone_id, name, lat, lng, fill_level, weight_kg, odor_level, temperature_c, battery_level, is_online, hours]) => ({
  id: `bin-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  zone_id,
  name,
  lat,
  lng,
  fill_level,
  weight_kg,
  odor_level,
  temperature_c,
  battery_level,
  is_online,
  last_seen_at: hoursAgo(hours),
  created_at: daysAgo(40),
}));

export const alerts = [
  ["bin-kp-01-river-walk", "overflow_risk", "critical", "Bin approaching overflow before evening collection window.", false, hoursAgo(0.5)],
  ["bin-kp-04-garden-square", "low_battery", "high", "Battery level dropped below 25%. Maintenance check recommended.", false, hoursAgo(3.2)],
  ["bin-sv-03-university-gate", "odor_spike", "high", "Odor sensor registered sustained spike for 25 minutes.", false, hoursAgo(1.3)],
  ["bin-hd-01-magar-ring", "overflow_risk", "critical", "High footfall area at 95% fill level.", false, hoursAgo(0.2)],
  ["bin-hd-05-transit-point", "sensor_offline", "medium", "Telemetry stopped reporting for more than 8 hours.", false, hoursAgo(8.5)],
  ["bin-kt-04-housing-board", "tamper", "low", "Bin door open event detected after scheduled service hours.", false, hoursAgo(5.4)],
  ["bin-sv-01-station-road", "odor_spike", "medium", "Odor reading crossed configured hygiene threshold.", true, hoursAgo(24)],
  ["bin-kt-02-temple-circle", "low_battery", "low", "Battery trending below recommended reserve.", true, hoursAgo(30)],
].map(([bin_id, type, severity, message, resolved, createdAt], index) => ({
  id: `alert-${index + 1}`,
  bin_id,
  type,
  severity,
  message,
  resolved,
  created_at: createdAt,
  resolved_at: resolved ? hoursAgo(4) : null,
}));

export const collectionEvents = [
  ["bin-kp-01-river-walk", "TR-14", "S. Jadhav", 91, 42.3, 29.4, daysAgo(2)],
  ["bin-kp-04-garden-square", "TR-07", "R. More", 84, 39.8, 26.1, daysAgo(4)],
  ["bin-sv-03-university-gate", "TR-05", "P. Pawar", 87, 36.2, 24.9, daysAgo(3)],
  ["bin-hd-01-magar-ring", "TR-02", "A. Shinde", 90, 43.6, 28.6, daysAgo(1)],
  ["bin-hd-02-market-link", "TR-02", "A. Shinde", 72, 30.1, 19.8, daysAgo(6)],
  ["bin-kt-04-housing-board", "TR-11", "K. Patil", 81, 35.3, 23.5, daysAgo(5)],
  ["bin-kt-05-park-ridge", "TR-11", "K. Patil", 68, 24.9, 18.4, daysAgo(7)],
  ["bin-sv-05-bus-depot", "TR-09", "N. Salunkhe", 74, 29.1, 20.3, daysAgo(8)],
].map(([bin_id, truck_id, driver_name, fill_at_collection, weight_collected_kg, co2_saved_kg, collected_at], index) => ({
  id: `collection-${index + 1}`,
  bin_id,
  truck_id,
  driver_name,
  fill_at_collection,
  weight_collected_kg,
  co2_saved_kg,
  collected_at,
}));

export const fillHistory = bins.flatMap((bin) =>
  Array.from({ length: 12 }, (_, index) => {
    const jitter = (Math.sin(index * 1.8 + bin.fill_level / 17) + 1) * 6;
    const projectedFill = Math.max(4, Math.min(99, Math.round(bin.fill_level - (11 - index) * 4 + jitter)));
    return {
      id: `${bin.id}-history-${index + 1}`,
      bin_id: bin.id,
      fill_level: projectedFill,
      weight_kg: Math.max(2, projectedFill * 0.45),
      odor_level: Math.max(0.5, Math.min(10, projectedFill / 12)),
      recorded_at: new Date(Date.now() - (11 - index) * 2 * 60 * 60 * 1000).toISOString(),
    };
  })
);
