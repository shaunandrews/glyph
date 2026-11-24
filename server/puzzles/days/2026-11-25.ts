import type { Day } from "../../../shared/types";
export default {
  date: "2026-11-25",
  flip: [
    { topic: "Bands", clues: [{ s: "red_circle", w: "red", o: "green" }, { s: "crescent_moon", w: "night", o: "day" }], answer: "Green Day", choices: ["Blur", "Weezer", "Green Day", "Pearl Jam"] },
    { topic: "Movies", clues: [{ s: "ant", w: "small", o: "big" }], answer: "Big", choices: ["Big", "Elf", "Splash", "Cast Away"] },
    { topic: "TV", clues: [{ s: "adhesive_bandage", w: "fixing", o: "breaking" }, { s: "smiling_face_with_halo", w: "good", o: "bad" }], answer: "Breaking Bad", choices: ["The Wire", "Lost", "Ozark", "Breaking Bad"] },
  ],
  pairs: {
    pairs: [
      [{ s: "up_arrow", w: "up" }, { s: "down_arrow", w: "down" }],
      [{ s: "hot_face", w: "hot" }, { s: "cold_face", w: "cold" }],
      [{ s: "grinning_face", w: "happy" }, { s: "crying_face", w: "sad" }],
      [{ s: "rabbit", w: "fast" }, { s: "snail", w: "slow" }],
      [{ s: "angry_face", w: "angry" }, { s: "relieved_face", w: "calm" }],
      [{ s: "play_button", w: "play" }, { s: "pause_button", w: "pause" }],
      [{ s: "sun", w: "sunny" }, { s: "cloud_with_rain", w: "rainy" }],
      [{ s: "owl", w: "night" }, { s: "rooster", w: "morning" }],
    ],
    order: ["hot_face", "snail", "sun", "pause_button", "grinning_face", "owl", "down_arrow", "relieved_face", "rabbit", "cloud_with_rain", "angry_face", "up_arrow", "rooster", "crying_face", "play_button", "cold_face"],
    herrings: [["hot_face", "angry_face"], ["sun", "owl"]],
  },
  ladder: [
    [{ w: "GIVE" }, { w: "HIVE", s: "honeybee" }, { w: "HIKE", s: "hiking_boot" }, { w: "LIKE", s: "thumbs_up" }, { w: "LAKE", s: "national_park" }, { w: "TAKE" }],
    [{ w: "CAT" }, { w: "COT", s: "bed" }, { w: "COG", s: "gear" }, { w: "DOG" }],
  ],
  chain: { links: [{ w: "RAIN", s: "cloud_with_rain" }, { w: "BOW" }, { w: "TIE" }, { w: "BREAK" }, { w: "FAST" }, { w: "FOOD", s: "hamburger" }] },
} satisfies Day;
