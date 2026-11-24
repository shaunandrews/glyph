// The sticker catalogue: every sticker id, its emoji, its name and its set.
// Images are Fluent 3D emoji (MIT), served from the glyph-art Space.

export const ART = "https://glyph-art.space.fast/s/";

export type Sticker = { id: string; e: string; name: string; set: string };

const S = (set: string, list: [string, string, string][]) => list.map(([id, e, name]) => ({ id, e, name, set }));

export const SETS = ["Weather", "Animals", "Faces", "Signs", "Things"] as const;

export const STICKERS: Sticker[] = [
  ...S("Weather", [
    ["sun", "☀️", "Sun"], ["crescent_moon", "🌙", "Crescent moon"], ["new_moon", "🌑", "New moon"],
    ["fire", "🔥", "Fire"], ["snowflake", "❄️", "Snowflake"], ["ice", "🧊", "Ice"],
    ["water_wave", "🌊", "Wave"], ["cloud_with_rain", "🌧️", "Rain cloud"], ["rainbow", "🌈", "Rainbow"],
    ["cactus", "🌵", "Cactus"], ["national_park", "🏞️", "Park"], ["wood", "🪵", "Wood"],
  ]),
  ...S("Animals", [
    ["elephant", "🐘", "Elephant"], ["ant", "🐜", "Ant"], ["turtle", "🐢", "Turtle"], ["leopard", "🐆", "Leopard"],
    ["rabbit", "🐇", "Rabbit"], ["snail", "🐌", "Snail"], ["lion", "🦁", "Lion"], ["mouse", "🐁", "Mouse"],
    ["owl", "🦉", "Owl"], ["rooster", "🐓", "Rooster"], ["duck", "🦆", "Duck"], ["fish", "🐟", "Fish"],
    ["giraffe", "🦒", "Giraffe"], ["honeybee", "🐝", "Bee"], ["worm", "🪱", "Worm"],
  ]),
  ...S("Faces", [
    ["smiling_face_with_halo", "😇", "Halo"], ["smiling_face_with_horns", "😈", "Horns"], ["grinning_face", "😀", "Grin"],
    ["crying_face", "😢", "Tears"], ["angry_face", "😠", "Angry"], ["relieved_face", "😌", "Relieved"],
    ["hot_face", "🥵", "Hot face"], ["cold_face", "🥶", "Cold face"], ["sleeping_face", "😴", "Asleep"],
    ["zany_face", "🤪", "Zany"], ["baby", "👶", "Baby"], ["old_man", "👴", "Old man"],
    ["man", "👨", "Man"], ["woman", "👩", "Woman"], ["speaking_head", "🗣️", "Speaking"],
  ]),
  ...S("Signs", [
    ["stop_sign", "🛑", "Stop"], ["green_circle", "🟢", "Green"], ["red_circle", "🔴", "Red"],
    ["up_arrow", "⬆️", "Up"], ["down_arrow", "⬇️", "Down"], ["plus", "➕", "Plus"], ["minus", "➖", "Minus"],
    ["play_button", "▶️", "Play"], ["pause_button", "⏸️", "Pause"], ["speaker_high_volume", "🔊", "Loud"],
    ["muted_speaker", "🔇", "Muted"], ["speech_balloon", "💬", "Speech"],
  ]),
  ...S("Things", [
    ["balloon", "🎈", "Balloon"], ["anchor", "⚓", "Anchor"], ["key", "🔑", "Key"], ["locked", "🔒", "Lock"],
    ["light_bulb", "💡", "Bulb"], ["magnet", "🧲", "Magnet"], ["electric_plug", "🔌", "Plug"], ["joker", "🃏", "Joker"],
    ["hospital", "🏥", "Hospital"], ["motorway", "🛣️", "Motorway"], ["adhesive_bandage", "🩹", "Bandage"],
    ["hot_pepper", "🌶️", "Pepper"], ["soft_ice_cream", "🍦", "Ice cream"], ["crown", "👑", "Crown"],
    ["hiking_boot", "🥾", "Boot"], ["thumbs_up", "👍", "Thumbs up"], ["bed", "🛏️", "Bed"], ["gear", "⚙️", "Gear"],
    ["hamburger", "🍔", "Burger"], ["yarn", "🧶", "Yarn"],
  ]),
];

export const BY_ID: Record<string, Sticker> = Object.fromEntries(STICKERS.map((s) => [s.id, s]));
export const img = (id: string) => `${ART}${id}.png`;
