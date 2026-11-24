import type { Day } from "../../../shared/types";
export default {
  date: "2026-11-24",
  flip: [
    { topic: "Pixar", clues: [{ s: "down_arrow", w: "down", o: "up" }], answer: "Up", choices: ["Cars", "Up", "Coco", "Brave"] },
    { topic: "Bands", clues: [{ s: "fire", w: "hot", o: "cold" }, { s: "pause_button", w: "pause", o: "play" }], answer: "Coldplay", choices: ["Radiohead", "Oasis", "Coldplay", "Muse"] },
    { topic: "Movies", clues: [{ s: "turtle", w: "slow", o: "fast" }, { s: "relieved_face", w: "calm", o: "furious" }], answer: "Fast and Furious", choices: ["Speed", "Drive", "Baby Driver", "Fast and Furious"] },
  ],
  pairs: {
    pairs: [
      [{ s: "sun", w: "day" }, { s: "crescent_moon", w: "night" }],
      [{ s: "elephant", w: "big" }, { s: "ant", w: "small" }],
      [{ s: "fire", w: "hot" }, { s: "snowflake", w: "cold" }],
      [{ s: "smiling_face_with_halo", w: "good" }, { s: "smiling_face_with_horns", w: "evil" }],
      [{ s: "turtle", w: "slow" }, { s: "leopard", w: "fast" }],
      [{ s: "baby", w: "young" }, { s: "old_man", w: "old" }],
      [{ s: "stop_sign", w: "stop" }, { s: "green_circle", w: "go" }],
      [{ s: "cactus", w: "dry" }, { s: "water_wave", w: "wet" }],
    ],
    order: ["fire", "baby", "leopard", "stop_sign", "cactus", "snowflake", "turtle", "old_man", "water_wave", "elephant", "green_circle", "crescent_moon", "smiling_face_with_horns", "ant", "sun", "smiling_face_with_halo"],
    herrings: [["fire", "water_wave"], ["elephant", "turtle"]],
  },
  ladder: [
    [{ w: "COLD" }, { w: "CORD", s: "electric_plug" }, { w: "CARD", s: "joker" }, { w: "WARD", s: "hospital" }, { w: "WARM" }],
    [{ w: "HEAD" }, { w: "HEAL", s: "adhesive_bandage" }, { w: "TEAL", s: "duck" }, { w: "TELL", s: "speaking_head" }, { w: "TALL", s: "giraffe" }, { w: "TAIL" }],
  ],
  chain: { links: [{ w: "FIRE", s: "fire" }, { w: "WORK" }, { w: "OUT" }, { w: "SIDE" }, { w: "WALK" }, { w: "WAY", s: "motorway" }] },
} satisfies Day;
