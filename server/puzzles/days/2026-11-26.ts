import type { Day } from "../../../shared/types";
export default {
  date: "2026-11-26",
  flip: [
    { topic: "Bands", clues: [{ s: "crown", w: "king", o: "queen" }], answer: "Queen", choices: ["Abba", "Queen", "Kiss", "Blondie"] },
    { topic: "Movies", clues: [{ s: "elephant", w: "big", o: "little" }, { s: "man", w: "men", o: "women" }], answer: "Little Women", choices: ["Emma", "Lady Bird", "Little Women", "Atonement"] },
    { topic: "TV", clues: [{ s: "relieved_face", w: "calm", o: "mad" }, { s: "woman", w: "women", o: "men" }], answer: "Mad Men", choices: ["Suits", "Mad Men", "The Office", "Lost"] },
  ],
  pairs: {
    pairs: [
      [{ s: "fire", w: "hot" }, { s: "ice", w: "cold" }],
      [{ s: "balloon", w: "float" }, { s: "anchor", w: "sink" }],
      [{ s: "baby", w: "young" }, { s: "old_man", w: "old" }],
      [{ s: "cactus", w: "dry" }, { s: "water_wave", w: "wet" }],
      [{ s: "speaker_high_volume", w: "loud" }, { s: "muted_speaker", w: "quiet" }],
      [{ s: "key", w: "open" }, { s: "locked", w: "shut" }],
      [{ s: "light_bulb", w: "light" }, { s: "new_moon", w: "dark" }],
      [{ s: "plus", w: "plus" }, { s: "minus", w: "minus" }],
    ],
    order: ["balloon", "ice", "key", "muted_speaker", "light_bulb", "cactus", "minus", "old_man", "fire", "anchor", "speaker_high_volume", "new_moon", "water_wave", "plus", "locked", "baby"],
    herrings: [["fire", "light_bulb"], ["water_wave", "ice"]],
  },
  ladder: [
    [{ w: "WARM" }, { w: "WORM", s: "worm" }, { w: "WORD", s: "speech_balloon" }, { w: "WOOD", s: "wood" }, { w: "WOOL", s: "yarn" }, { w: "COOL" }],
  ],
  chain: { links: [{ w: "MOON", s: "crescent_moon" }, { w: "LIGHT" }, { w: "HOUSE" }, { w: "HOLD" }, { w: "UP", s: "up_arrow" }] },
} satisfies Day;
