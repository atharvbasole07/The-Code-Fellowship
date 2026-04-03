import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Leaf } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { heroImages, testimonials } from "../lib/demoData";
import { useAuth } from "../context/AuthContext";
import { Button, Field, Input, PasswordInput } from "../components/ui";

export function LandingPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [email, setEmail] = useState("commissioner@pune.gov.in");
  const [password, setPassword] = useState("binwatch-demo");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[1.9fr_1fr]">
      <section className="flex min-h-screen flex-col">
        <div className="relative h-[60vh] overflow-hidden">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
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
        </div>
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
                  className="h-20 w-20 rounded-full object-cover"
                />
                <div>
                  <p className="text-lg leading-8 text-slate-700">“{testimonials[activeTestimonial].quote}”</p>
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
                    className={`h-2.5 rounded-full transition-all ${index === activeTestimonial ? "w-10 bg-brand-700" : "w-2.5 bg-brand-200"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
        <div className="w-full max-w-md rounded-[2rem] border-l-4 border-brand-700 bg-white p-8 shadow-panel">
          <div className="mb-6">
            <p className="text-3xl font-semibold text-brand-900">BinWatch</p>
            <p className="mt-2 text-sm text-slate-500">Municipal Login</p>
          </div>
          <div className="mb-6 h-px bg-slate-200" />
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field label="Email Address">
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@municipality.gov.in" required />
            </Field>
            <Field label="Password">
              <PasswordInput value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" />
            </Field>
            <Button type="submit" loading={loading} className="w-full bg-brand-900 text-white hover:bg-brand-700">
              Sign In
            </Button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
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
      </aside>
    </main>
  );
}
