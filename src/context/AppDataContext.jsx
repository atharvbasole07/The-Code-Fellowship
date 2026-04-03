import { createContext, useContext, useEffect, useState } from "react";
import {
  alerts as demoAlerts,
  bins as demoBins,
  collectionEvents as demoCollectionEvents,
  fillHistory as demoFillHistory,
  zones as demoZones,
} from "../lib/demoData";
import { hasSupabaseEnv, supabase } from "../lib/supabase";
import { uid } from "../lib/utils";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [zones, setZones] = useState([]);
  const [bins, setBins] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fillHistory, setFillHistory] = useState([]);
  const [collectionEvents, setCollectionEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!hasSupabaseEnv) {
        if (!mounted) return;
        setZones(demoZones);
        setBins(demoBins);
        setAlerts(demoAlerts);
        setFillHistory(demoFillHistory);
        setCollectionEvents(demoCollectionEvents);
        setLoading(false);
        return;
      }

      setLoading(true);
      const [zonesRes, binsRes, alertsRes, historyRes, collectionsRes] = await Promise.all([
        supabase.from("zones").select("*").order("name"),
        supabase.from("bins").select("*").order("created_at"),
        supabase.from("alerts").select("*").order("created_at", { ascending: false }),
        supabase.from("fill_history").select("*").order("recorded_at"),
        supabase.from("collection_events").select("*").order("collected_at", { ascending: false }),
      ]);

      if (!mounted) return;
      setZones(zonesRes.data ?? []);
      setBins(binsRes.data ?? []);
      setAlerts(alertsRes.data ?? []);
      setFillHistory(historyRes.data ?? []);
      setCollectionEvents(collectionsRes.data ?? []);
      setLoading(false);
    }

    loadData();

    if (!hasSupabaseEnv) return () => {
      mounted = false;
    };

    const binsChannel = supabase
      .channel("binwatch-bins")
      .on("postgres_changes", { event: "*", schema: "public", table: "bins" }, (payload) => {
        setBins((current) => upsertPayload(current, payload));
      })
      .subscribe();

    const alertsChannel = supabase
      .channel("binwatch-alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, (payload) => {
        setAlerts((current) => upsertPayload(current, payload));
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(binsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, []);

  async function resolveAlert(alertId) {
    const resolvedAt = new Date().toISOString();
    if (!hasSupabaseEnv) {
      setAlerts((current) =>
        current.map((alert) =>
          alert.id === alertId ? { ...alert, resolved: true, resolved_at: resolvedAt } : alert
        )
      );
      return { error: null };
    }

    const { error } = await supabase
      .from("alerts")
      .update({ resolved: true, resolved_at: resolvedAt })
      .eq("id", alertId);
    return { error };
  }

  async function markCollected(bin, details) {
    const event = {
      id: uid("collection"),
      bin_id: bin.id,
      truck_id: details.truckId,
      driver_name: details.driverName,
      fill_at_collection: bin.fill_level,
      weight_collected_kg: Number(details.weightCollectedKg),
      co2_saved_kg: Number(details.co2SavedKg),
      collected_at: new Date().toISOString(),
    };

    if (!hasSupabaseEnv) {
      setCollectionEvents((current) => [event, ...current]);
      setBins((current) =>
        current.map((entry) =>
          entry.id === bin.id
            ? {
                ...entry,
                fill_level: 8,
                weight_kg: 4,
                odor_level: Math.max(0.5, entry.odor_level - 3),
                last_seen_at: event.collected_at,
              }
            : entry
        )
      );
      return { error: null };
    }

    const [insertRes, updateRes] = await Promise.all([
      supabase.from("collection_events").insert(event),
      supabase
        .from("bins")
        .update({
          fill_level: 8,
          weight_kg: 4,
          odor_level: Math.max(0.5, bin.odor_level - 3),
          last_seen_at: event.collected_at,
        })
        .eq("id", bin.id),
    ]);

    return { error: insertRes.error || updateRes.error };
  }

  async function submitCitizenReport({ binId, issueType, description, photoName }) {
    const typeMap = {
      overflow: "overflow_risk",
      odor: "odor_spike",
      damage: "tamper",
      "illegal dumping": "tamper",
    };

    const alert = {
      id: uid("alert"),
      bin_id: binId,
      type: typeMap[issueType] ?? "tamper",
      severity: "medium",
      message: photoName
        ? `${description} Photo attached: ${photoName}`
        : description,
      resolved: false,
      created_at: new Date().toISOString(),
      resolved_at: null,
    };

    if (!hasSupabaseEnv) {
      setAlerts((current) => [alert, ...current]);
      return { error: null };
    }

    const { error } = await supabase.from("alerts").insert(alert);
    return { error };
  }

  return (
    <AppDataContext.Provider
      value={{
        zones,
        bins,
        alerts,
        fillHistory,
        collectionEvents,
        loading,
        resolveAlert,
        markCollected,
        submitCitizenReport,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

function upsertPayload(current, payload) {
  if (payload.eventType === "DELETE") {
    return current.filter((item) => item.id !== payload.old.id);
  }
  const next = payload.new;
  const index = current.findIndex((item) => item.id === next.id);
  if (index === -1) return [next, ...current];
  return current.map((item) => (item.id === next.id ? next : item));
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used inside AppDataProvider");
  return context;
}
