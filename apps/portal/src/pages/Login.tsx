import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Field, Icon, useFeedback } from "../components/ui";

export function Login() {
  const { signIn } = useAuthActions();
  const { isAuthenticated: isSignedIn, isLoading } = useConvexAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.hash.slice(1));
  const invitation = params.get("invitation") ?? "";
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const { run, message, pending } = useFeedback();
  const requestedPath: unknown = location.state?.from;
  const destination =
    typeof requestedPath === "string" &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    !requestedPath.startsWith("/login")
      ? requestedPath
      : "/";

  useEffect(() => {
    document.title = "Sofora — Log in";
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await run(() => signIn("password", { email, password, flow: invitation ? "signUp" : "signIn", ...(invitation ? { invitation } : {}) }), "Logged in.");
  }

  if (isLoading) return <p className="panel-empty" role="status">Checking your session…</p>;
  if (isSignedIn) return <Navigate to={destination} replace />;

  return (
    <main className="login-page">
      <section className="login-story" aria-labelledby="login-story-title">
        <div className="portal-brand">
          <img src="/images/sofora-logo.png" width="43" height="43" alt="" />
          <span>
            <strong>
              SOFORA<span>.</span>
            </strong>
            <small>STAFF WORKSPACE</small>
          </span>
        </div>
        <div className="login-story-copy">
          <span className="note-mark">
            <Icon name="sprout" />
          </span>
          <p className="kicker">People helping people</p>
          <h2 id="login-story-title">
            Small steps.
            <br />
            Shared progress.
          </h2>
          <p>
            A little care behind every member’s next chapter. Your workspace to
            help make it happen.
          </p>
        </div>
        <p className="login-story-footer">Sofora Cooperative Credit Union</p>
      </section>
      <section className="login-form-section" aria-labelledby="login-title">
        <div className="login-form-wrap">
          <p className="kicker">Welcome to your workspace</p>
          <h1 id="login-title">{invitation ? "Make yourself at home." : "Good to see you."}</h1>
          <p className="page-description">
            {invitation ? "Activate your staff account with your own password." : "Log in to pick up where you left off."}
          </p>
          {message}
          {import.meta.env.DEV && !invitation ? <p className="login-footnote">Development: log in as <strong>admin</strong> with password <strong>admin</strong>.</p> : null}
          <form onSubmit={submit}>
            <Field label={import.meta.env.DEV ? "Email address or username" : "Email address"}>
              <input
                type={import.meta.env.DEV ? "text" : "email"}
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@soforaccu.com"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                name="password"
                autoComplete={invitation ? "new-password" : "current-password"}
                minLength={invitation ? 12 : undefined}
                maxLength={128}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <button className="btn login-submit" disabled={pending}>
              {pending ? "Please wait…" : invitation ? "Activate account" : "Log in"} <Icon name="arrow" />
            </button>
          </form>
          <p className="login-footnote">{invitation ? "Choose a password with at least 12 characters. Activation links expire after seven days." : "Need access or help signing in? Contact your Sofora administrator."}</p>
        </div>
      </section>
    </main>
  );
}
