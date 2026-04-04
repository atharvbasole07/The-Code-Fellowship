import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Leaf,
  Lightbulb,
  Newspaper,
  Recycle,
  Shield,
  Trash2,
  Truck,
  ExternalLink,
  Zap,
  BarChart3,
  Globe,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Heart,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { heroImages, testimonials } from "../lib/demoData";
import { useAuth } from "../context/AuthContext";
import { Button, Field, Input, PasswordInput } from "../components/ui";

const spotlightItems = [
  {
    icon: Recycle,
    title: "Smart Segregation",
    description:
      "AI-powered sensors classify waste at source — organic, recyclable, and hazardous — reducing landfill burden by up to 40%.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Truck,
    title: "Route Optimization",
    description:
      "Dynamic route planning cuts fuel consumption by 30% and ensures high-priority bins are serviced first during peak hours.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Zap,
    title: "Real-Time Telemetry",
    description:
      "IoT sensors stream fill-level, temperature, and odor data every 60 seconds, giving operators a live pulse of the city.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description:
      "Machine-learning models forecast overflow events 6 hours ahead, shifting sanitation from reactive to proactive.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const newsItems = [
  {
    date: "28 Mar 2026",
    tag: "Partnership",
    title: "BinWatch Partners with Pune Municipal Corporation for City-Wide Deployment",
    summary:
      "A landmark MoU signed to deploy 15,000+ smart bins across all 15 ward offices, making Pune the first Indian city with full IoT waste coverage.",
  },
  {
    date: "15 Mar 2026",
    tag: "Award",
    title: "BinWatch Wins 'Best Urban Innovation' at Smart India Hackathon 2026",
    summary:
      "Recognized for pioneering real-time waste monitoring that integrates seamlessly with existing municipal workflows.",
  },
  {
    date: "02 Mar 2026",
    tag: "Technology",
    title: "New LoRaWAN Sensors Extend Battery Life to 5 Years",
    summary:
      "Next-generation low-power sensors reduce maintenance visits by 80%, making large-scale deployments cost-effective for tier-2 cities.",
  },
  {
    date: "18 Feb 2026",
    tag: "Impact",
    title: "Pilot Results: 35% Reduction in Overflow Incidents Across Koregaon Park",
    summary:
      "Three-month pilot data confirms significant improvement in collection efficiency and citizen satisfaction scores.",
  },
];

const usefulLinks = [
  {
    icon: Recycle,
    title: "Solid Waste Management Rules",
    description: "Government of India SWM Rules 2016 & 2024 amendments",
    url: "https://cpcb.nic.in/solid-waste-management/",
  },
  {
    icon: Globe,
    title: "Swachh Bharat Mission",
    description: "National urban sanitation and cleanliness initiative",
    url: "https://swachhbharatmission.gov.in/",
  },
  {
    icon: Trash2,
    title: "Waste Segregation Guide",
    description: "How to classify wet, dry, and hazardous waste",
    url: "#",
  },
  {
    icon: BookOpen,
    title: "Extended Producer Responsibility",
    description: "EPR guidelines for packaging and e-waste compliance",
    url: "#",
  },
];

export function LandingPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [userEmail, setUserEmail] = useState("commissioner@pune.gov.in");
  const [userPassword, setUserPassword] = useState("binwatch-demo");
  const [userError, setUserError] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [driverEmail, setDriverEmail] = useState("driver@pune.gov.in");
  const [driverPassword, setDriverPassword] = useState("binwatch-demo");
  const [driverError, setDriverError] = useState("");
  const [driverLoading, setDriverLoading] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();

  // Slideshow — increased to 8 seconds
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, []);

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  if (user) {
    const redirectPath = pendingRedirect ?? (role === "driver" ? "/driver" : "/dashboard");
    return <Navigate to={redirectPath} replace />;
  }

  async function handleUserSubmit(event) {
    event.preventDefault();
    setPendingRedirect("/dashboard");
    setUserError("");
    setUserLoading(true);
    const { error: signInError } = await signIn(userEmail, userPassword, "user");
    setUserLoading(false);
    if (signInError) {
      setPendingRedirect(null);
      setUserError(signInError.message);
      return;
    }
  }

  async function handleDriverSubmit(event) {
    event.preventDefault();
    setDriverError("");
    setDriverLoading(false);
    // Driver login intentionally bypasses auth and routes directly to the driver dashboard.
    navigate("/driver");
  }

  const tagColor = (tag) => {
    const map = {
      Partnership: "bg-blue-100 text-blue-700 border-blue-200",
      Award: "bg-amber-100 text-amber-700 border-amber-200",
      Technology: "bg-purple-100 text-purple-700 border-purple-200",
      Impact: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return map[tag] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[1.9fr_1fr]">
      {/* ── LEFT COLUMN: scrollable content ── */}
      <section className="flex flex-col">
        {/* ── Hero Slideshow ── */}
        <div className="relative h-[60vh] overflow-hidden">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ${
                index === activeImage ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.58)), url(${image})`,
              }}
            />
          ))}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center text-white">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]">
              <Leaf size={14} />
              Powered by IoT + AI
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
              Smarter Cities Start With Cleaner Streets
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate-100 md:text-lg">
              BinWatch monitors every bin in real time — so your city never overflows.
            </p>
          </div>
          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === activeImage
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Spotlight Section ── */}
        <div className="bg-white px-8 py-14 md:px-14">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">
                Spotlight
              </p>
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              How BinWatch Transforms Waste Operations
            </h2>
            <p className="mt-3 max-w-2xl text-base text-slate-500">
              From sensor to dashboard — explore the technology stack that makes cities cleaner, greener, and smarter.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {spotlightItems.map((item) => (
                <div
                  key={item.title}
                  className="group rounded-[1.5rem] border border-slate-200 p-6 transition-all duration-300 hover:border-brand-200 hover:shadow-panel"
                >
                  <div
                    className={`mb-4 inline-flex rounded-2xl ${item.bg} p-3 ${item.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <item.icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── News / Press Section ── */}
        <div className="bg-slate-50 px-8 py-14 md:px-14">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-2 flex items-center gap-2">
              <Newspaper size={18} className="text-brand-700" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                News & Press
              </p>
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Latest Updates
            </h2>

            <div className="mt-10 space-y-5">
              {newsItems.map((item, index) => (
                <div
                  key={index}
                  className="group flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-brand-200 hover:shadow-panel md:flex-row md:items-start"
                >
                  <div className="shrink-0">
                    <p className="text-sm font-medium text-slate-400">
                      {item.date}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tagColor(
                        item.tag
                      )}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-brand-700">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {item.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── What Leaders Are Saying (auto-rotating) ── */}
        <div className="flex flex-1 flex-col justify-center bg-brand-50 px-8 py-10 md:px-14">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Leadership Voices</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">What Leaders Are Saying</h2>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTestimonial((current) => (current - 1 + testimonials.length) % testimonials.length)}
                  className="rounded-2xl border border-brand-200 bg-white p-3 text-brand-700 transition hover:border-brand-700"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTestimonial((current) => (current + 1) % testimonials.length)}
                  className="rounded-2xl border border-brand-200 bg-white p-3 text-brand-700 transition hover:border-brand-700"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
            <div className="rounded-[2rem] bg-white p-8 shadow-panel">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-100 transition-all duration-500"
                />
                <div className="transition-opacity duration-500">
                  <p className="text-lg leading-8 text-slate-700">
                    &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                  </p>
                  <p className="mt-5 text-lg font-semibold text-slate-900">{testimonials[activeTestimonial].name}</p>
                  <p className="text-sm text-slate-500">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
              <div className="mt-8 flex justify-center gap-2">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={testimonial.id}
                    type="button"
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2.5 rounded-full transition-all duration-500 ${index === activeTestimonial ? "w-10 bg-brand-700" : "w-2.5 bg-brand-200"}`}
                  />
                ))}
              </div>
            </div>
            {/* Auto-rotate indicator */}
            <p className="mt-4 text-center text-xs text-brand-500">
              Auto-advances every 5 seconds · Click arrows or dots to navigate
            </p>
          </div>
        </div>
      </section>

      {/* ── RIGHT COLUMN: login at top + useful links below ── */}
      <aside className="bg-slate-100 px-6 py-10 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="flex flex-col gap-8">
          {/* User Login Card */}
          <div className="w-full max-w-md mx-auto rounded-[2rem] border-l-4 border-brand-700 bg-white p-8 shadow-panel">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-800">
                <Shield size={26} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-brand-900">User Login</p>
                <p className="mt-1 text-sm text-slate-500">Admin / Staff Login</p>
              </div>
            </div>
            <div className="mb-6 h-px bg-slate-200" />
            <form className="space-y-5" onSubmit={handleUserSubmit}>
              <Field label="Email Address">
                <Input type="email" value={userEmail} onChange={(event) => setUserEmail(event.target.value)} placeholder="commissioner@pune.gov.in" required />
              </Field>
              <Field label="Password">
                <PasswordInput value={userPassword} onChange={(event) => setUserPassword(event.target.value)} placeholder="Enter password" />
              </Field>
              <Button type="submit" loading={userLoading} className="w-full bg-brand-900 text-white hover:bg-brand-700">
                Sign In as User
              </Button>
              {userError ? <p className="text-sm text-red-600">{userError}</p> : null}
            </form>
            <div className="mt-5 flex items-center justify-between gap-4 text-sm text-slate-500">
              <button type="button" className="transition hover:text-brand-700">
                Forgot password?
              </button>
              <Link to="/citizen" className="transition hover:text-brand-700">
                Citizen portal preview
              </Link>
            </div>
            <p className="mt-8 text-xs leading-6 text-slate-400">
              Access restricted to authorized municipal staff only.
            </p>
          </div>

          {/* Driver Login Card */}
          <div className="w-full max-w-md mx-auto rounded-[2rem] border-l-4 border-blue-700 bg-white p-8 shadow-panel">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
                <Truck size={26} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-blue-900">Driver Login</p>
                <p className="mt-1 text-sm text-slate-500">Driver Login</p>
              </div>
            </div>
            <div className="mb-6 h-px bg-slate-200" />
            <form className="space-y-5" onSubmit={handleDriverSubmit}>
              <Field label="Email Address">
                <Input type="email" value={driverEmail} onChange={(event) => setDriverEmail(event.target.value)} placeholder="driver@pune.gov.in" required />
              </Field>
              <Field label="Password">
                <PasswordInput value={driverPassword} onChange={(event) => setDriverPassword(event.target.value)} placeholder="Enter password" />
              </Field>
              <Button type="submit" loading={driverLoading} className="w-full bg-blue-900 text-white hover:bg-blue-800">
                Sign In as Driver
              </Button>
              {driverError ? <p className="text-sm text-red-600">{driverError}</p> : null}
            </form>
            <p className="mt-8 text-xs leading-6 text-slate-400">
              Use your assigned driver credentials to access route and bin operations.
            </p>
          </div>

          {/* Useful Waste Links */}
          <div className="w-full max-w-md mx-auto rounded-[2rem] bg-white p-6 shadow-panel border border-slate-200">
            <div className="mb-4 flex items-center gap-2">
              <ExternalLink size={16} className="text-brand-700" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                Useful Links
              </p>
            </div>
            <div className="h-px bg-slate-200 mb-4" />
            <div className="space-y-2">
              {usefulLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-brand-50"
                >
                  <div className="mt-0.5 shrink-0 rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors group-hover:bg-brand-100 group-hover:text-brand-700">
                    <link.icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 transition-colors group-hover:text-brand-700">
                      {link.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {link.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── FOOTER — spans full width ── */}
      <footer className="col-span-full bg-slate-900 text-slate-300">
        {/* Top Band */}
        <div className="border-b border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-8 md:flex-row">
            <div className="flex items-center gap-4">
              <img src="/whitelogobin.jpeg" alt="BinWatch Logo" className="h-12 w-12 object-contain drop-shadow-sm rounded-lg border border-black" />
              <div>
                <p className="text-2xl font-semibold text-white">BinWatch</p>
                <p className="mt-1 text-sm text-slate-400">Smart Waste Management for Modern Cities</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="rounded-xl bg-slate-800 p-2.5 text-slate-400 transition hover:bg-brand-700 hover:text-white">
                <Twitter size={18} />
              </a>
              <a href="#" className="rounded-xl bg-slate-800 p-2.5 text-slate-400 transition hover:bg-brand-700 hover:text-white">
                <Linkedin size={18} />
              </a>
              <a href="#" className="rounded-xl bg-slate-800 p-2.5 text-slate-400 transition hover:bg-brand-700 hover:text-white">
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="mx-auto grid max-w-7xl gap-10 px-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-500" />
                <span>Pune Municipal Corporation, Shivajinagar, Pune 411005, Maharashtra</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-brand-500" />
                <span>+91 20 2550 1000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-brand-500" />
                <span>support@binwatch.gov.in</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="transition hover:text-brand-300">About BinWatch</a></li>
              <li><a href="#" className="transition hover:text-brand-300">Citizen Portal</a></li>
              <li><a href="#" className="transition hover:text-brand-300">Report an Issue</a></li>
              <li><a href="#" className="transition hover:text-brand-300">Collection Schedule</a></li>
              <li><a href="#" className="transition hover:text-brand-300">FAQ</a></li>
            </ul>
          </div>

          {/* Waste Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">Waste Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="transition hover:text-brand-300">SWM Rules 2016</a></li>
              <li><a href="#" className="transition hover:text-brand-300">Waste Segregation Guide</a></li>
              <li><a href="#" className="transition hover:text-brand-300">E-Waste Disposal</a></li>
              <li><a href="#" className="transition hover:text-brand-300">Composting at Home</a></li>
              <li><a href="#" className="transition hover:text-brand-300">Swachh Bharat Mission</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="transition hover:text-brand-300">Privacy Policy</a></li>
              <li><a href="#" className="transition hover:text-brand-300">Terms of Service</a></li>
              <li><a href="#" className="transition hover:text-brand-300">Data Governance</a></li>
              <li><a href="#" className="transition hover:text-brand-300">Accessibility Statement</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-8 py-5 text-xs text-slate-500 md:flex-row">
            <p>© {new Date().getFullYear()} BinWatch — Pune Municipal Corporation. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart size={12} className="text-red-500" /> for cleaner cities
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
