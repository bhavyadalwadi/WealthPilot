import { SignInForm } from "@/components/signin-form";
import { hasConfiguredAuth, normalizeNextPath } from "@/lib/auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = normalizeNextPath(params.next);
  const error =
    !hasConfiguredAuth() || params.error === "config"
      ? "Shared sign-in is not configured yet. Set `PRIVATE_ACCESS_USERNAME` and `PRIVATE_ACCESS_PASSWORD` in the active env file, then restart the app."
      : params.error === "invalid"
      ? "Incorrect username or password."
      : params.error === "server"
        ? "Sign-in failed."
        : "";

  return (
    <main className="signin-shell">
      <section className="signin-card">
        <p className="eyebrow">Private Access</p>
        <h1>Sign in to WealthPilot</h1>
        <p className="subtle-copy">
          Use the shared private credentials configured for this app.
        </p>
        <SignInForm error={error} next={next} />
      </section>
    </main>
  );
}
