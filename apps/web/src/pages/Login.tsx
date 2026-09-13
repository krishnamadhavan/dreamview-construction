import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowIcon } from "../components/ArrowIcon";
import { useAuth } from "../auth";

export function LoginPage() {
  const { admin, ready, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (ready && admin) return <Navigate to="/admin" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
    } catch {
      setError("Invalid email or password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-app grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/mrooyq3a/image/upload/w_1600,q_auto,f_auto/v1787422033/projects/5cf5d9d8-0642-4e0f-a594-bd3efe48435f/home-img1-9d0c6766-webp.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/30" />
        <p className="relative text-[13px] tracking-[0.4em] uppercase">Dreamview</p>
        <div className="relative max-w-md">
          <p className="text-[11px] tracking-[0.3em] text-gold uppercase">Admin</p>
          <h1 className="display mt-3 text-6xl leading-[0.94]">We keep the record.</h1>
          <p className="mt-5 text-paper/70">
            Projects, photography, and the public site — one studio desk.
          </p>
        </div>
        <p className="relative text-[11px] tracking-[0.18em] text-paper/40 uppercase">Work · media · publish</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <p className="text-[11px] tracking-[0.3em] text-gold uppercase">Sign in</p>
          <h2 className="display mt-2 text-5xl">Welcome back</h2>
          <label className="mt-8 block text-sm text-paper/80">
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="admin-field"
            />
          </label>
          <label className="mt-4 block text-sm text-paper/80">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="admin-field"
            />
          </label>
          {error && <p className="mt-4 text-sm text-gold">{error}</p>}
          <button type="submit" disabled={busy} className="admin-btn mt-8">
            {busy ? "Signing in…" : "Continue"}
            <ArrowIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
