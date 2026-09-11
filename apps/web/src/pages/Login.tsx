import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink text-paper lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#4a433a_1px,transparent_1px),linear-gradient(90deg,#4a433a_1px,transparent_1px)] [background-size:48px_48px]" />
        <p className="relative text-sm tracking-[0.22em] uppercase">Dreamview Construction</p>
        <div className="relative max-w-md">
          <h1 className="display text-5xl leading-tight">Site records, kept in order.</h1>
          <p className="mt-5 text-sand">
            Manage project write-ups and photography for the public site. More content types can land here later.
          </p>
        </div>
        <p className="relative text-xs text-sand/70">Admin · projects · media</p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <p className="text-xs tracking-[0.2em] text-ink-soft uppercase">Sign in</p>
          <h2 className="display mt-2 text-4xl">Welcome back</h2>
          <label className="mt-8 block text-sm">
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-clay"
            />
          </label>
          <label className="mt-4 block text-sm">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-clay"
            />
          </label>
          {error && <p className="mt-4 text-sm text-clay">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-md bg-ink py-3 text-sm text-paper hover:bg-ink-soft disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
