// Sign-in: a real form with standard fields, so phones and browsers offer to make, save and fill the password.
import { useState } from "preact/hooks";
import { errorText, useAccountCalls } from "../backend/index";
import { Button } from "../components/ui";

export function SignIn(props: { line?: string }) {
  const [mode, setMode] = useState<"create" | "signin">("create");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const calls = useAccountCalls();
  async function submit(e: Event) {
    e.preventDefault();
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const u = String(f.get("username") || ""), p = String(f.get("password") || "");
    setBusy(true);
    setError("");
    try {
      if (mode === "create") await calls.createAccount(u, p);
      else await calls.signIn(u, p);
      // A finished navigation is what tells browsers to offer saving the password.
      history.pushState(null, "", location.pathname);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form class="g-card g-stack" style="gap:12px" method="post" action="/me" onSubmit={submit}>
      <p class="g-body">{mode === "create" ? props.line ?? "Keep your streak on every device" : "Sign in"}</p>
      <label class="g-field">
        <span class="g-meta">Username</span>
        <input name="username" id="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellcheck={false} required minLength={3} maxLength={20} />
      </label>
      <label class="g-field">
        <span class="g-meta">Password</span>
        <input type="password" name="password" id="password" autoComplete={mode === "create" ? "new-password" : "current-password"} required minLength={mode === "create" ? 8 : 1} />
      </label>
      {error && <p class="g-meta g-danger">{error}</p>}
      <Button type="submit" disabled={busy}>
        {mode === "create" ? "Make an account" : "Sign in"}
      </Button>
      <Button quiet onClick={() => { setMode(mode === "create" ? "signin" : "create"); setError(""); }}>
        {mode === "create" ? "I already have one" : "Make a new account"}
      </Button>
      {mode === "signin" && <p class="g-meta">Forgot it? Ask Shaun.</p>}
    </form>
  );
}
