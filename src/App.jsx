import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import { CitizenPreviewPage } from "./pages/CitizenPreviewPage";
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { DashboardHomePage } from "./pages/dashboard/DashboardHomePage";
import { BinsPage } from "./pages/dashboard/BinsPage";
import { RoutePlannerPage } from "./pages/dashboard/RoutePlannerPage";
import { CityMapPage } from "./pages/dashboard/CityMapPage";
import { AlertsPage } from "./pages/dashboard/AlertsPage";
import { AnalyticsPage } from "./pages/dashboard/AnalyticsPage";
import { CitizenPortalPage } from "./pages/dashboard/CitizenPortalPage";

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading BinWatch...</div>;
  }
  return user ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/citizen" element={<CitizenPreviewPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="bins" element={<BinsPage />} />
          <Route path="route" element={<RoutePlannerPage />} />
          <Route path="map" element={<CityMapPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="citizen" element={<CitizenPortalPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
