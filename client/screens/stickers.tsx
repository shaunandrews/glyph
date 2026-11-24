import { useMe } from "../backend/index";
import { SETS, STICKERS } from "../../shared/stickers";
import { Header, Sticker, TabBar } from "../components/ui";

export function StickersScreen() {
  const me = useMe();
  const owned = new Set((me?.stickers ?? []).map((s) => s.sticker));
  const sets = SETS.map((name) => {
    const list = STICKERS.filter((s) => s.set === name);
    return { name, list, have: list.filter((s) => owned.has(s.id)).length };
  }).sort((a, b) => b.have / b.list.length - a.have / a.list.length);
  return (
    <>
      <Header title="Stickers" />
      <div class="g-screen" style="gap:12px">
        {sets.map((set) => (
          <div class="g-card g-stack" style="gap:16px" key={set.name}>
            <div class="g-between"><p class="g-body">{set.name}</p><p class="g-meta">{set.have} of {set.list.length}</p></div>
            <div class="g-setgrid">
              {set.list.map((s, i) => (
                <Sticker key={s.id} id={s.id} size="sm" i={i} state={owned.has(s.id) ? "" : "locked"} word={owned.has(s.id) ? s.name.toLowerCase() : undefined} />
              ))}
            </div>
          </div>
        ))}
        <p class="g-meta" style="text-align:center;padding:8px 0">Decode an emoji with no help to earn its sticker.</p>
      </div>
      <TabBar on="stickers" />
    </>
  );
}
