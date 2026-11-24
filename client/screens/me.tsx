import { useAccountCalls, useMe } from "../backend/index";
import { Button, Header, TabBar } from "../components/ui";
import { SignIn } from "./signin";

export function MeScreen() {
  const me = useMe();
  const calls = useAccountCalls();
  const row = (a: string, b: string | number) => (
    <div class="g-row"><span class="g-body">{a}</span><span class="g-body">{b}</span></div>
  );
  return (
    <>
      <Header title="Me" />
      <div class="g-screen" style="gap:16px">
        {me?.username ? <h1 class="g-display">{me.username}</h1> : null}
        <div class="g-list">
          {row("Streak", me?.streak ?? 0)}
          {row("Longest streak", me?.best ?? 0)}
          {row("Days played", me?.days ?? 0)}
          {row("Games finished", me?.games ?? 0)}
          {row("Stickers", me?.stickers.length ?? 0)}
        </div>
        {me && !me.username ? <SignIn /> : null}
        <div class="g-grow" />
        {me?.username ? <Button quiet onClick={() => calls.signOut()}>Sign out</Button> : null}
      </div>
      <TabBar on="me" />
    </>
  );
}
