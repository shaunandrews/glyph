// The app shell: Glyph's own routes. Every pages/ file renders this.
import { injectStyles } from "./styles";
import { usePath } from "./router";
import { TodayScreen } from "./screens/today";
import { GameScreen } from "./screens/game";
import { MeScreen } from "./screens/me";
import { StickersScreen } from "./screens/stickers";
import { WelcomeScreen } from "./screens/welcome";
import { GAMES, type GameId } from "../shared/types";
import { isDate } from "../shared/day";

injectStyles();

export default function App() {
  const path = usePath();
  const parts = path.split("/").filter(Boolean);
  let screen;
  if (parts[0] === "play" && isDate(parts[1]) && GAMES.includes(parts[2] as GameId)) screen = <GameScreen key={path} date={parts[1]} game={parts[2] as GameId} />;
  else if (parts[0] === "me") screen = <MeScreen />;
  else if (parts[0] === "stickers") screen = <StickersScreen />;
  else if (parts[0] === "welcome" || (!parts.length && typeof localStorage !== "undefined" && !localStorage.getItem("glyph.onboarded"))) screen = <WelcomeScreen />;
  else screen = <TodayScreen />;
  return <div class="g-app">{screen}</div>;
}
