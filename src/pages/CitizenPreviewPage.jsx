import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CitizenPortalPage } from "./dashboard/CitizenPortalPage";

export function CitizenPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xl font-semibold text-brand-900">BinWatch Citizen Preview</p>
            <p className="text-sm text-slate-500">Public-facing experience for residents and civic volunteers.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-700 hover:text-brand-700">
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <CitizenPortalPage standalone />
      </div>
    </div>
  );
}
