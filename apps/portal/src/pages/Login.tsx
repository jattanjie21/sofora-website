import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Field, Icon, useFeedback } from "../components/ui";
import { Bone } from "../components/Skeleton";

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

  if (isLoading)
    return (
      <main className="login-page">
        <LoginPhoto />
        <section className="login-form-section">
          <p className="sr-only" role="status">
            Checking your session…
          </p>
          <div className="login-card skeleton-lines" aria-hidden="true">
            <Bone width={48} height={48} />
            <Bone width="70%" height={34} />
            <Bone width="55%" height={13} />
            <Bone width={120} height={12} />
            <Bone width="100%" height={50} />
            <Bone width={90} height={12} />
            <Bone width="100%" height={50} />
            <Bone width="100%" height={50} />
          </div>
        </section>
      </main>
    );
  if (isSignedIn) return <Navigate to={destination} replace />;

  return (
    <main className="login-page">
      <LoginPhoto />
      <section className="login-form-section" aria-labelledby="login-title">
        <div className="login-card">
          <img className="login-logo" src="/images/sofora-logo.png" width="52" height="52" alt="Sofora" />
          <h1 id="login-title">{invitation ? "Activate your account" : "Welcome back"}</h1>
          {invitation ? <p className="login-lead">Choose your own password to finish setting up your staff account.</p> : null}
          {message}
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
                placeholder={invitation ? "At least 12 characters" : "Your password"}
              />
            </Field>
            <button className="btn login-submit" disabled={pending}>
              {pending ? "Please wait…" : invitation ? "Activate account" : "Sign in"} <Icon name="arrow" />
            </button>
          </form>
          <p className="login-footnote">{invitation ? "Activation links expire after seven days." : "Need access or help signing in? Contact your Sofora administrator."}</p>
        </div>
      </section>
    </main>
  );
}

// The photo panel beside the form; static, so it also shows while the session is checked.
function LoginPhoto() {
  return (
    <aside className="login-photo">
      <img className="login-photo-image" src="/images/sofora-community.jpg" alt="" />
      <div className="login-photo-content">
        <div className="login-photo-brand">
          <img src="/images/logo-white.png" width="40" height="40" alt="" />
          <strong>Sofora</strong>
        </div>
        <div className="login-photo-copy">
          <p className="login-photo-kicker">People helping people</p>
          <h2>Small steps. Shared progress.</h2>
          <p>Sofora Cooperative Credit Union</p>
        </div>
      </div>
    </aside>
  );
}
