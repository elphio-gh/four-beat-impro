/**
 * V6 STYLE DATABASE
 * Ogni stile definisce: progressioni, palette strumenti, colori e 3 variazioni ritmiche.
 */

const NOTES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

const CHORD_INT = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  sus4: [0, 5, 7],
  sus2: [0, 2, 7],
  maj6: [0, 4, 7, 9],
  dim7: [0, 3, 6, 9],
  aug: [0, 4, 8],
  min6: [0, 3, 7, 9]
};

const SOUND_NAMES = {
  grandpiano: 'Pianoforte',
  jazzpiano: 'Piano jazz',
  elecpiano: 'Rhodes',
  organ: 'Hammond',
  pipeorgan: 'Organo a canne',
  accordion: 'Fisarmonica',
  strings: 'Archi',
  brass: 'Sezione fiati',
  nylonguitar: 'Chitarra classica',
  distguitar: 'Chitarra distorta',
  steelguitar: 'Chitarra steel',
  honkytonk: 'Honky-Tonk',
  synthpad: 'Pad synth',
  vibraphone: 'Vibrafono',
  marimba: 'Marimba',
  harpsichord: 'Clavicembalo',
  bass_electric: 'Basso elettrico',
  bass_pick: 'Basso col plettro',
  bass_slap: 'Basso slap',
  bass_acoustic: 'Contrabbasso',
  bass_fretless: 'Basso fretless',
  bass_synth: 'Basso synth',
  bass_sub: 'Sub-basso synth'
};

const C = 60;
const D = 62;
const E = 64;
const F = 65;
const G = 67;
const A = 69;
const B = 71;
const Bb = 70;
const Ab = 68;
const Eb = 63;

function chord(r, t) {
  return { r, t };
}

function progression(name, fn, ch) {
  return { name, fn, ch };
}

function variation(id, label, chordPattern, bassPattern, drumPattern, sectionLift = 1.12) {
  return { id, label, chordPattern, bassPattern, drumPattern, sectionLift };
}

function k(offset = 0, gain = 1) { return { drum: 'kick', offset, gain }; }
function s(offset = 0, gain = 1) { return { drum: 'snare', offset, gain }; }
function h(offset = 0, gain = 1, open = false) { return { drum: 'hihat', offset, gain, open }; }
function r(offset = 0, gain = 1) { return { drum: 'rim', offset, gain }; }

const STYLE_CHORD_FLAVORS = {
  jazz_swing: { density: 0.9, maj: ['maj6', 'maj7'], min: ['min7', 'min6'], dom7: ['dom7', 'sus4'] },
  reggae: { density: 0.45, maj: ['maj', 'sus2'], min: ['min', 'min7'], dom7: ['dom7', 'sus4'] },
  ska: { density: 0.5, maj: ['maj', 'sus2', 'sus4'], min: ['min', 'min7'] },
  bossa_nova: { density: 0.88, maj: ['maj6', 'maj7'], min: ['min6', 'min7'], dom7: ['dom7', 'sus4'] },
  funk: { density: 0.58, maj: ['maj6'], min: ['min7', 'min6'], dom7: ['dom7', 'sus4'] },
  blues_shuffle: { density: 0.3, maj: ['maj6'], dom7: ['dom7', 'sus4'] },
  pop_rock: { density: 0.42, maj: ['maj', 'sus2'], min: ['min', 'min7'] },
  disco_70s: { density: 0.72, maj: ['maj6', 'maj7'], min: ['min7', 'min6'], dom7: ['dom7', 'sus4'] },
  hiphop_boom_bap: { density: 0.46, maj: ['maj', 'sus2'], min: ['min', 'min7'], dom7: ['dom7', 'sus4'] },
  punk_rock: { density: 0.2, maj: ['maj', 'sus4'], min: ['min'] },
  country_bluegrass: { density: 0.4, maj: ['maj', 'maj6', 'sus2'], dom7: ['dom7', 'sus4'] },
  motown_soul: { density: 0.68, maj: ['maj6', 'maj7'], min: ['min7', 'min6'], dom7: ['dom7', 'sus4'] },
  salsa_montuno: { density: 0.7, maj: ['maj6', 'maj7'], min: ['min7', 'min6'], dom7: ['dom7', 'sus4'] },
  gospel: { density: 0.84, maj: ['maj6', 'maj7', 'sus2'], min: ['min7', 'min6'], dom7: ['dom7', 'sus4'] },
  synthwave_80s: { density: 0.52, maj: ['maj', 'sus2'], min: ['min', 'min7'], dom7: ['dom7', 'sus4'] },
  tango: { density: 0.52, maj: ['maj', 'maj6'], min: ['min', 'min6'], dom7: ['dom7', 'sus4'] },
  indie_folk: { density: 0.48, maj: ['maj', 'sus2'], min: ['min', 'min7'] }
};

const CHORD_FN_SUFFIX = {
  maj: '',
  min: '',
  dom7: '7',
  maj7: 'maj7',
  min7: 'm7',
  sus4: 'sus4',
  sus2: 'sus2',
  maj6: '6',
  min6: 'm6'
};

function pickOne(array) {
  if (!Array.isArray(array) || !array.length) return null;
  return array[Math.floor(Math.random() * array.length)];
}

function decorateRomanFn(baseFn, chordType) {
  const bare = String(baseFn || 'I')
    .replace(/maj7|m7|dim7|sus4|sus2|m6|6|7|\+$/g, '')
    .trim();
  return `${bare}${CHORD_FN_SUFFIX[chordType] ?? ''}`;
}

function colorizeChord(styleId, chordDef) {
  const profile = STYLE_CHORD_FLAVORS[styleId];
  if (!profile || Math.random() > profile.density) return chordDef;
  const options = profile[chordDef.t];
  const nextType = pickOne(options);
  return nextType ? { ...chordDef, t: nextType } : chordDef;
}

function createStyledProgression(style, progressionDef) {
  const coloredChords = progressionDef.ch.map((chordDef) => colorizeChord(style.id, chordDef));
  return {
    ...progressionDef,
    fn: progressionDef.fn.map((baseFn, index) => decorateRomanFn(baseFn, coloredChords[index].t)),
    ch: coloredChords
  };
}

const VARIATIONS = {
  jazzSwing: [
    variation('feather', 'Feather Swing', [0, 2], [[0, -12, 0.5], [1, -9, 0.4], [2, -7, 0.4], [3, -5, 0.4]], [
      [k(), h(0), h(0.66, 0.72)],
      [s(), h(0), h(0.66, 0.76)],
      [k(), h(0), h(0.66, 0.72)],
      [s(0, 1.05), h(0), h(0.66, 0.8)]
    ], 1.16),
    variation('ride', 'Ride Ghost', [0, 1.5, 3], [[0, -12, 0.45], [1, -10, 0.35], [2, -8, 0.35], [3, -7, 0.35]], [
      [k(), h(0), r(0.66, 0.34)],
      [s(), h(0), h(0.66, 0.72)],
      [k(0, 0.94), h(0), r(0.66, 0.3)],
      [s(0, 1.08), h(0), h(0.66, 0.76)]
    ], 1.18),
    variation('hardbop', 'Hard Bop', [0, 2, 3], [[0, -12, 0.45], [1, -9, 0.35], [2, -7, 0.35], [3, -4, 0.35]], [
      [k(), h(0), k(0.75, 0.38)],
      [s(0, 1.06), h(0)],
      [k(), h(0), k(0.75, 0.42)],
      [s(0, 1.1), h(0), r(0.5, 0.3)]
    ], 1.2)
  ],
  reggae: [
    variation('oneDrop', 'One Drop', [1.5, 3], [[0, -12, 0.55], [2, -12, 0.45]], [
      [h(0), h(0.5, 0.7)],
      [r(0.5, 0.48), h(0)],
      [k(0, 0.88), s(0, 0.86), h(0)],
      [r(0.5, 0.52), h(0)]
    ], 1.1),
    variation('skank', 'Skank Pocket', [1, 2, 3], [[0, -12, 0.5], [1.5, -7, 0.35], [3, -12, 0.4]], [
      [h(0), h(0.5, 0.72)],
      [r(0.5, 0.42), h(0)],
      [k(0, 0.82), s(0, 0.8), h(0)],
      [r(0.5, 0.48), h(0)]
    ], 1.12),
    variation('dub', 'Dub Space', [2, 3.25], [[0, -12, 0.65], [2.5, -5, 0.45]], [
      [h(0), h(0.5, 0.66)],
      [r(0.75, 0.34)],
      [k(0, 0.9), s(0, 0.82), h(0)],
      [r(0.75, 0.4), h(0.5, 0.54)]
    ], 1.14)
  ],
  ska: [
    variation('upstroke', 'Upstroke', [0.5, 1.5, 2.5, 3.5], [[0, -12, 0.35], [1, -9, 0.3], [2, -7, 0.3], [3, -5, 0.3]], [
      [k(), h(0), h(0.5, 0.72)],
      [s(), h(0), h(0.5, 0.76)],
      [k(), h(0), h(0.5, 0.72)],
      [s(0, 1.05), h(0), h(0.5, 0.78)]
    ], 1.18),
    variation('chase', 'Chase Scene', [0.5, 1, 1.5, 2.5, 3.5], [[0, -12, 0.3], [1, -7, 0.28], [2, -12, 0.28], [3, -5, 0.28]], [
      [k(), h(0), r(0.25, 0.26), h(0.5, 0.68)],
      [s(), h(0), h(0.5, 0.74)],
      [k(), h(0), r(0.25, 0.26), h(0.5, 0.68)],
      [s(0, 1.06), h(0), h(0.5, 0.76)]
    ], 1.2),
    variation('tight', 'Tight Horns', [0.5, 1.5, 2.5, 3], [[0, -12, 0.34], [1.5, -9, 0.26], [2.5, -7, 0.26]], [
      [k(), h(0)],
      [s(), h(0), r(0.75, 0.34)],
      [k(), h(0)],
      [s(), h(0), r(0.75, 0.36)]
    ], 1.18)
  ],
  bossaNova: [
    variation('nylon', 'Soft Nylon', [0, 2], [[0, -12, 0.55], [2, -7, 0.45]], [
      [k(), r()],
      [h(0, 0.74, true), r(0.5, 0.44)],
      [k(), r()],
      [h(0, 0.74, true), r(0.5, 0.46)]
    ], 1.1),
    variation('terrace', 'Terrace', [0, 1.5, 3], [[0, -12, 0.52], [2, -5, 0.36], [3, -7, 0.3]], [
      [k(), r(), r(0.75, 0.24)],
      [h(0, 0.72, true)],
      [k(), r(), r(0.75, 0.24)],
      [h(0, 0.72, true), s(0.5, 0.24)]
    ], 1.12),
    variation('rio', 'Rio Pulse', [0, 2, 3], [[0, -12, 0.5], [2, -8, 0.34], [3, -7, 0.28]], [
      [k(), r()],
      [h(0, 0.66, true), r(0.75, 0.34)],
      [k(), r(), k(0.5, 0.3)],
      [h(0, 0.68, true)]
    ], 1.14)
  ],
  funk: [
    variation('dry', 'Dry Pocket', [0, 1.25, 2, 2.75, 3.5], [[0, -12, 0.3], [0.75, -12, 0.2], [1.5, -5, 0.2], [2, -10, 0.22], [2.75, -7, 0.2], [3.5, -12, 0.2]], [
      [k(), h(0), h(0.5, 0.58)],
      [s(0, 1.02), h(0), k(0.75, 0.32)],
      [k(), h(0), h(0.5, 0.56)],
      [s(0, 1.06), h(0), k(0.5, 0.34)]
    ], 1.18),
    variation('clav', 'Clav Snap', [0.25, 1, 1.75, 2.5, 3.25], [[0, -12, 0.28], [1, -10, 0.22], [1.75, -7, 0.2], [2.5, -5, 0.2], [3.25, -10, 0.22]], [
      [k(), h(0), r(0.25, 0.24), h(0.5, 0.54)],
      [s(), h(0), r(0.75, 0.3)],
      [k(0, 0.94), h(0), h(0.5, 0.52)],
      [s(0, 1.04), r(0.25, 0.34), h(0.5, 0.56)]
    ], 1.2),
    variation('bounce', 'Wide Bounce', [0, 0.75, 1.5, 2.5, 3.25], [[0, -12, 0.3], [0.75, -5, 0.2], [1.5, -10, 0.22], [2.5, -7, 0.22], [3.25, -12, 0.22]], [
      [k(), h(0), h(0.5, 0.56)],
      [s(), h(0), k(0.75, 0.28)],
      [k(), h(0), r(0.25, 0.22), h(0.5, 0.54)],
      [s(0, 1.02), h(0), k(0.5, 0.32)]
    ], 1.2)
  ],
  bluesShuffle: [
    variation('shuffle', 'Shuffle Ride', [0, 2], [[0, -12, 0.48], [1, -7, 0.34], [2, -5, 0.34], [3, -7, 0.34]], [
      [k(), h(0), h(0.66, 0.72)],
      [s(), h(0), h(0.66, 0.76)],
      [k(), h(0), h(0.66, 0.72)],
      [s(0, 1.04), h(0), h(0.66, 0.78)]
    ], 1.16),
    variation('hero', 'Antihero', [0, 1.5, 3], [[0, -12, 0.5], [2, -8, 0.38], [3, -10, 0.34]], [
      [k(), h(0), r(0.66, 0.3)],
      [s(), h(0), h(0.66, 0.7)],
      [k(0, 0.92), h(0), r(0.66, 0.3)],
      [s(0, 1.05), h(0), h(0.66, 0.74)]
    ], 1.18),
    variation('ironic', 'Ironic Wink', [0, 2, 3], [[0, -12, 0.46], [1, -9, 0.32], [2, -7, 0.32]], [
      [k(), h(0)],
      [s(), h(0), r(0.75, 0.3)],
      [k(), h(0)],
      [s(), h(0), r(0.75, 0.34)]
    ], 1.16)
  ],
  popRock: [
    variation('anthem', 'Anthem', [0, 2], [[0, -12, 0.58], [2, -7, 0.42]], [
      [k(), h(0), h(0.5, 0.72)],
      [s(0, 1.02), h(0), h(0.5, 0.76)],
      [k(), h(0), h(0.5, 0.72)],
      [s(0, 1.04), h(0), h(0.5, 0.8)]
    ], 1.18),
    variation('drive', 'Drive', [0, 1.5, 2.5], [[0, -12, 0.5], [1.5, -7, 0.34], [3, -5, 0.34]], [
      [k(), h(0), h(0.5, 0.68)],
      [s(), h(0), h(0.5, 0.72)],
      [k(), k(0.75, 0.34), h(0)],
      [s(), h(0), h(0.5, 0.74)]
    ], 1.2),
    variation('radio', 'Radio Lift', [0, 2, 3], [[0, -12, 0.56], [2, -8, 0.34], [3, -7, 0.28]], [
      [k(), h(0), h(0.5, 0.74)],
      [s(0, 1.06), h(0), h(0.5, 0.78)],
      [k(), h(0), h(0.5, 0.74)],
      [s(0, 1.08), h(0), h(0.5, 0.8)]
    ], 1.22)
  ],
  disco70: [
    variation('floor', 'Four On The Floor', [0, 2], [[0, -12, 0.42], [1, -12, 0.32], [2, -7, 0.32], [3, -12, 0.32]], [
      [k(), h(0), h(0.5, 0.72)],
      [k(), s(), h(0), h(0.5, 0.76)],
      [k(), h(0), h(0.5, 0.72)],
      [k(), s(0, 1.04), h(0), h(0.5, 0.78)]
    ], 1.2),
    variation('mirrorball', 'Mirrorball', [0, 1, 2, 3], [[0, -12, 0.34], [1, -10, 0.28], [2, -7, 0.28], [3, -5, 0.28]], [
      [k(), h(0), h(0.5, 0.74)],
      [k(), s(), h(0), r(0.75, 0.24)],
      [k(), h(0), h(0.5, 0.74)],
      [k(), s(), h(0), r(0.75, 0.26)]
    ], 1.22),
    variation('strut', 'Strut', [0, 2, 3], [[0, -12, 0.35], [1, -7, 0.26], [2, -9, 0.26], [3, -5, 0.26]], [
      [k(), h(0), h(0.5, 0.7)],
      [k(), s(), h(0), h(0.5, 0.74)],
      [k(), h(0), h(0.5, 0.7)],
      [k(), s(0, 1.06), h(0), h(0.5, 0.76)]
    ], 1.2)
  ],
  hipHopBoomBap: [
    variation('boom', 'Boom Bap', [0], [[0, -12, 0.72], [1.5, -7, 0.42], [3, -12, 0.36]], [
      [k(), h(0.5, 0.44)],
      [s(0, 1.06)],
      [k(), h(0.5, 0.4)],
      [s(), r(0.75, 0.28)]
    ], 1.1),
    variation('battle', 'Battle', [0, 2.5], [[0, -12, 0.7], [2, -5, 0.4]], [
      [k(), h(0.5, 0.4)],
      [s(0, 1.08), r(0.25, 0.24)],
      [k(), h(0.5, 0.42)],
      [s(), r(0.75, 0.3)]
    ], 1.14),
    variation('grit', 'Dusty Loop', [0, 3], [[0, -12, 0.76], [3, -7, 0.36]], [
      [k(), h(0.5, 0.34)],
      [s()],
      [k(0, 0.94), h(0.5, 0.34)],
      [s(0, 1.02), r(0.75, 0.26)]
    ], 1.12)
  ],
  punkRock: [
    variation('downstroke', 'Downstroke', [0, 1, 2, 3], [[0, -12, 0.34], [1, -12, 0.3], [2, -7, 0.3], [3, -7, 0.3]], [
      [k(), h(0), h(0.5, 0.78)],
      [s(0, 1.08), h(0), h(0.5, 0.8)],
      [k(), h(0), h(0.5, 0.78)],
      [s(0, 1.1), h(0), h(0.5, 0.82)]
    ], 1.22),
    variation('rage', 'Rage', [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], [[0, -12, 0.28], [1, -7, 0.26], [2, -12, 0.26], [3, -5, 0.26]], [
      [k(), h(0), h(0.5, 0.76)],
      [s(0, 1.12), h(0), h(0.5, 0.8)],
      [k(), h(0), h(0.5, 0.76)],
      [s(0, 1.12), h(0), h(0.5, 0.8)]
    ], 1.24),
    variation('garage', 'Garage', [0, 1, 2.5, 3.5], [[0, -12, 0.34], [1.5, -7, 0.26], [3, -5, 0.26]], [
      [k(), h(0)],
      [s(0, 1.04), h(0), r(0.75, 0.22)],
      [k(), h(0)],
      [s(0, 1.08), h(0), r(0.75, 0.24)]
    ], 1.22)
  ],
  countryBluegrass: [
    variation('train', 'Train Beat', [0, 2], [[0, -12, 0.36], [1, -7, 0.3], [2, -12, 0.3], [3, -5, 0.3]], [
      [k(), h(0), h(0.5, 0.62)],
      [r(), h(0.5, 0.58)],
      [k(), h(0), h(0.5, 0.62)],
      [r(), h(0.5, 0.58)]
    ], 1.12),
    variation('clap', 'Barn Clap', [0, 1.5, 3], [[0, -12, 0.34], [1.5, -7, 0.26], [3, -5, 0.26]], [
      [k(), h(0)],
      [r(), h(0.5, 0.52)],
      [k(), h(0)],
      [r(), h(0.5, 0.54)]
    ], 1.14),
    variation('wagon', 'Wagon Roll', [0, 2, 3], [[0, -12, 0.34], [1, -9, 0.26], [2, -7, 0.26], [3, -5, 0.26]], [
      [k(), h(0)],
      [r(), h(0.5, 0.54)],
      [k(), h(0)],
      [r(), h(0.5, 0.56)]
    ], 1.14)
  ],
  motownSoul: [
    variation('backbeat', 'Backbeat', [0, 2], [[0, -12, 0.42], [1, -7, 0.3], [2, -10, 0.3], [3, -5, 0.3]], [
      [k(), s(0, 0.8), h(0.5, 0.52)],
      [k(), s(0, 0.96), h(0.5, 0.54)],
      [k(), s(0, 0.82), h(0.5, 0.52)],
      [k(), s(0, 1.0), h(0.5, 0.56)]
    ], 1.18),
    variation('clapline', 'Clapline', [0, 1.5, 3], [[0, -12, 0.4], [2, -7, 0.3], [3, -9, 0.26]], [
      [k(), s(0, 0.76), h(0.5, 0.5)],
      [k(), s(0, 0.94), h(0.5, 0.52)],
      [k(), s(0, 0.78), h(0.5, 0.5)],
      [k(), s(0, 0.98), h(0.5, 0.54)]
    ], 1.2),
    variation('wide', 'Wide Soul', [0, 2, 3], [[0, -12, 0.42], [1, -10, 0.26], [2, -7, 0.26], [3, -5, 0.26]], [
      [k(), s(0, 0.78), h(0.5, 0.48)],
      [k(), s(0, 0.96), h(0.5, 0.52)],
      [k(), s(0, 0.8), h(0.5, 0.48)],
      [k(), s(0, 1.0), h(0.5, 0.54)]
    ], 1.2)
  ],
  salsaMontuno: [
    variation('montuno', 'Montuno', [0, 1, 2.5, 3.5], [[0, -12, 0.36], [1.5, -7, 0.28], [2.5, -5, 0.28]], [
      [k(), r(0.5, 0.4), h(0)],
      [r(), h(0.5, 0.38)],
      [k(), r(0.33, 0.5)],
      [s(), r(0.66, 0.34)]
    ], 1.2),
    variation('clave', 'Clave Push', [0, 1.5, 2.5, 3], [[0, -12, 0.34], [1, -9, 0.26], [2, -7, 0.26], [3, -5, 0.26]], [
      [k(), r(0.5, 0.42), h(0)],
      [r()],
      [k(), r(0.33, 0.5)],
      [s(), r(0.66, 0.36)]
    ], 1.22),
    variation('piano', 'Percussive Keys', [0, 1, 2, 3.5], [[0, -12, 0.34], [1.5, -7, 0.26], [3, -5, 0.26]], [
      [k(), r(0.5, 0.36), h(0)],
      [r(), h(0.5, 0.36)],
      [k(), r(0.33, 0.48)],
      [s(), r(0.66, 0.34)]
    ], 1.2)
  ],
  gospel: [
    variation('church', 'Church Lift', [0, 2], [[0, -12, 0.48], [1.5, -7, 0.28], [3, -5, 0.32]], [
      [k(), h(0)],
      [s(0, 1.1), h(0)],
      [k(), k(0.5, 0.42), h(0)],
      [s(0, 1.04), h(0)]
    ], 1.22),
    variation('hall', 'Big Hall', [0, 1.5, 3], [[0, -12, 0.5], [2, -7, 0.34], [3, -9, 0.28]], [
      [k(), h(0)],
      [s(0, 1.14), h(0)],
      [k(), k(0.5, 0.46), h(0)],
      [s(0, 1.08), h(0), k(0.75, 0.3)]
    ], 1.24),
    variation('clap', 'Clap Rise', [0, 2, 3], [[0, -12, 0.48], [1, -10, 0.3], [2, -7, 0.3]], [
      [k(), h(0)],
      [s(0, 1.12), r(0.25, 0.26)],
      [k(), k(0.5, 0.44), h(0)],
      [s(), h(0)]
    ], 1.22)
  ],
  synthwave80: [
    variation('neon', 'Neon Drive', [0, 2], [[0, -12, 0.46], [1, -12, 0.28], [2, -7, 0.28], [3, -5, 0.28]], [
      [k(), h(0), h(0.5, 0.66)],
      [s(), h(0), h(0.5, 0.7)],
      [k(), h(0), h(0.5, 0.66)],
      [s(0, 1.04), h(0), h(0.5, 0.72)]
    ], 1.18),
    variation('arcade', 'Arcade', [0, 1, 2, 3], [[0, -12, 0.34], [1, -9, 0.26], [2, -7, 0.26], [3, -5, 0.26]], [
      [k(), h(0), h(0.5, 0.64)],
      [s(), h(0), r(0.75, 0.22)],
      [k(), h(0), h(0.5, 0.64)],
      [s(), h(0), r(0.75, 0.24)]
    ], 1.18),
    variation('night', 'Night Ride', [0, 2, 3], [[0, -12, 0.5], [2, -7, 0.34], [3, -10, 0.3]], [
      [k(), h(0), h(0.5, 0.62)],
      [s(), h(0), h(0.5, 0.66)],
      [k(), h(0), h(0.5, 0.62)],
      [s(0, 1.02), h(0), h(0.5, 0.68)]
    ], 1.2)
  ],
  tango: [
    variation('bandoneon', 'Bandoneon', [0, 2], [[0, -12, 0.44], [1, -7, 0.3], [2, -12, 0.3], [3, -5, 0.3]], [
      [k(), s(0.04, 0.84)],
      [r()],
      [k()],
      [r()]
    ], 1.18),
    variation('knife', 'Knife Edge', [0, 1.5, 3], [[0, -12, 0.42], [2, -7, 0.32], [3, -10, 0.28]], [
      [k(), s(0.04, 0.8)],
      [r(), r(0.5, 0.28)],
      [k()],
      [r()]
    ], 1.2),
    variation('drama', 'Velvet Drama', [0, 2, 3], [[0, -12, 0.44], [1.5, -9, 0.28], [3, -7, 0.28]], [
      [k(), s(0.04, 0.8)],
      [r(), r(0.5, 0.3)],
      [k()],
      [r()]
    ], 1.2)
  ],
  indieFolk: [
    variation('choral', 'Choral', [0, 2], [[0, -12, 0.52], [2, -7, 0.38]], [
      [k(), h(0)],
      [r(), h(0.5, 0.46)],
      [k(), h(0)],
      [r(), h(0.5, 0.5)]
    ], 1.14),
    variation('stomp', 'Stomp', [0, 2, 3], [[0, -12, 0.5], [2, -5, 0.34], [3, -7, 0.3]], [
      [k(), h(0)],
      [r(), h(0.5, 0.48)],
      [k(), h(0)],
      [r(), h(0.5, 0.52)]
    ], 1.16),
    variation('campfire', 'Campfire', [0, 1.5, 3], [[0, -12, 0.54], [2, -7, 0.34], [3, -9, 0.3]], [
      [k(), h(0)],
      [r(), h(0.5, 0.44)],
      [k(), h(0)],
      [r(), h(0.5, 0.48)]
    ], 1.14)
  ]
};

const STYLE_DEFS = [
  {
    id: 'jazz_swing',
    label: 'Jazz Swing',
    subtitle: 'Scena nel club, fumo e battute secche.',
    icon: '🎷',
    accent: { primary: '#d6b36d', surface: '#20170a', glow: 'rgba(214,179,109,.45)' },
    tempoRange: { min: 124, max: 154, default: 138 },
    mainInstrumentPool: ['jazzpiano', 'vibraphone', 'grandpiano'],
    bassInstrumentPool: ['bass_acoustic', 'bass_electric'],
    progressionPool: [
      progression('ii7 - V7 - Imaj7 - IVmaj7', ['ii7', 'V7', 'Imaj7', 'IVmaj7'], [chord(D, 'min7'), chord(G, 'dom7'), chord(C, 'maj7'), chord(F, 'maj7')]),
      progression('Imaj7 - vi7 - ii7 - V7', ['Imaj7', 'vi7', 'ii7', 'V7'], [chord(C, 'maj7'), chord(A, 'min7'), chord(D, 'min7'), chord(G, 'dom7')]),
      progression('iii7 - VI7 - ii7 - V7', ['iii7', 'VI7', 'ii7', 'V7'], [chord(E, 'min7'), chord(A, 'dom7'), chord(D, 'min7'), chord(G, 'dom7')])
    ],
    variationSet: VARIATIONS.jazzSwing
  },
  {
    id: 'reggae',
    label: 'Reggae',
    subtitle: 'Rilassata, estiva, con skank larghi e bassi profondi.',
    icon: '🌴',
    accent: { primary: '#61d36b', surface: '#0f1f10', glow: 'rgba(97,211,107,.45)' },
    tempoRange: { min: 72, max: 94, default: 84 },
    mainInstrumentPool: ['organ', 'elecpiano', 'accordion'],
    bassInstrumentPool: ['bass_fretless', 'bass_electric'],
    progressionPool: [
      progression('I - IV - I - V', ['I', 'IV', 'I', 'V'], [chord(C, 'maj'), chord(F, 'maj'), chord(C, 'maj'), chord(G, 'maj')]),
      progression('i - bVII - IV - V7', ['i', 'bVII', 'IV', 'V7'], [chord(A, 'min'), chord(G, 'maj'), chord(D, 'maj'), chord(E, 'dom7')]),
      progression('I - bVII - IV - I', ['I', 'bVII', 'IV', 'I'], [chord(C, 'maj'), chord(Bb, 'maj'), chord(F, 'maj'), chord(C, 'maj')])
    ],
    variationSet: VARIATIONS.reggae
  },
  {
    id: 'ska',
    label: 'Ska',
    subtitle: 'Scene frenetiche, inseguimenti e fiati nervosi.',
    icon: '🏁',
    accent: { primary: '#f6ce57', surface: '#1f1a08', glow: 'rgba(246,206,87,.44)' },
    tempoRange: { min: 142, max: 178, default: 160 },
    mainInstrumentPool: ['brass', 'organ', 'distguitar'],
    bassInstrumentPool: ['bass_electric', 'bass_acoustic'],
    progressionPool: [
      progression('I - IV - I - V', ['I', 'IV', 'I', 'V'], [chord(C, 'maj'), chord(F, 'maj'), chord(C, 'maj'), chord(G, 'maj')]),
      progression('I - bVII - IV - V', ['I', 'bVII', 'IV', 'V'], [chord(C, 'maj'), chord(Bb, 'maj'), chord(F, 'maj'), chord(G, 'maj')]),
      progression('I - vi - ii - V', ['I', 'vi', 'ii', 'V'], [chord(C, 'maj'), chord(A, 'min'), chord(D, 'min'), chord(G, 'maj')])
    ],
    variationSet: VARIATIONS.ska
  },
  {
    id: 'bossa_nova',
    label: 'Bossa Nova',
    subtitle: 'Romantica e sofisticata, da veranda alle due di notte.',
    icon: '🌙',
    accent: { primary: '#7fd0c6', surface: '#0d1a1a', glow: 'rgba(127,208,198,.42)' },
    tempoRange: { min: 96, max: 124, default: 108 },
    mainInstrumentPool: ['nylonguitar', 'elecpiano', 'jazzpiano'],
    bassInstrumentPool: ['bass_acoustic', 'bass_fretless'],
    progressionPool: [
      progression('Imaj7 - vi7 - ii7 - V7', ['Imaj7', 'vi7', 'ii7', 'V7'], [chord(C, 'maj7'), chord(A, 'min7'), chord(D, 'min7'), chord(G, 'dom7')]),
      progression('ii7 - V7 - Imaj7 - IVmaj7', ['ii7', 'V7', 'Imaj7', 'IVmaj7'], [chord(D, 'min7'), chord(G, 'dom7'), chord(C, 'maj7'), chord(F, 'maj7')]),
      progression('i - bVImaj7 - iv - V7', ['i', 'bVImaj7', 'iv', 'V7'], [chord(A, 'min'), chord(F, 'maj7'), chord(D, 'min'), chord(E, 'dom7')])
    ],
    variationSet: VARIATIONS.bossaNova
  },
  {
    id: 'funk',
    label: 'Funk',
    subtitle: 'Cool urbano, passi di danza e groove elastico.',
    icon: '🪩',
    accent: { primary: '#ff9b42', surface: '#241208', glow: 'rgba(255,155,66,.45)' },
    tempoRange: { min: 96, max: 122, default: 108 },
    mainInstrumentPool: ['elecpiano', 'organ', 'brass'],
    bassInstrumentPool: ['bass_slap', 'bass_electric', 'bass_pick'],
    progressionPool: [
      progression('i7 - IV7 - i7 - IV7', ['i7', 'IV7', 'i7', 'IV7'], [chord(A, 'min7'), chord(D, 'dom7'), chord(A, 'min7'), chord(D, 'dom7')]),
      progression('I7 - I7 - IV7 - I7', ['I7', 'I7', 'IV7', 'I7'], [chord(C, 'dom7'), chord(C, 'dom7'), chord(F, 'dom7'), chord(C, 'dom7')]),
      progression('i7 - bIII7 - IV7 - i7', ['i7', 'bIII7', 'IV7', 'i7'], [chord(A, 'min7'), chord(C, 'dom7'), chord(D, 'dom7'), chord(A, 'min7')])
    ],
    variationSet: VARIATIONS.funk
  },
  {
    id: 'blues_shuffle',
    label: 'Blues Shuffle',
    subtitle: 'Antieroe ironico, passi storti e mezzo sorriso.',
    icon: '😏',
    accent: { primary: '#6fb1ff', surface: '#0d1623', glow: 'rgba(111,177,255,.44)' },
    tempoRange: { min: 96, max: 132, default: 116 },
    mainInstrumentPool: ['grandpiano', 'jazzpiano', 'organ'],
    bassInstrumentPool: ['bass_acoustic', 'bass_electric'],
    progressionPool: [
      progression('I7 - IV7 - I7 - V7', ['I7', 'IV7', 'I7', 'V7'], [chord(C, 'dom7'), chord(F, 'dom7'), chord(C, 'dom7'), chord(G, 'dom7')]),
      progression('I7 - IV7 - V7 - IV7', ['I7', 'IV7', 'V7', 'IV7'], [chord(C, 'dom7'), chord(F, 'dom7'), chord(G, 'dom7'), chord(F, 'dom7')]),
      progression('IV7 - bVII7 - IV7 - I7', ['IV7', 'bVII7', 'IV7', 'I7'], [chord(F, 'dom7'), chord(Bb, 'dom7'), chord(F, 'dom7'), chord(C, 'dom7')])
    ],
    variationSet: VARIATIONS.bluesShuffle
  },
  {
    id: 'pop_rock',
    label: 'Pop-Rock',
    subtitle: 'Anthem moderno, largo, immediato e teatrale.',
    icon: '🎤',
    accent: { primary: '#ff6b6b', surface: '#231111', glow: 'rgba(255,107,107,.42)' },
    tempoRange: { min: 108, max: 136, default: 120 },
    mainInstrumentPool: ['grandpiano', 'elecpiano', 'strings'],
    bassInstrumentPool: ['bass_electric', 'bass_pick', 'bass_slap'],
    progressionPool: [
      progression('I - V - vi - IV', ['I', 'V', 'vi', 'IV'], [chord(C, 'maj'), chord(G, 'maj'), chord(A, 'min'), chord(F, 'maj')]),
      progression('vi - IV - I - V', ['vi', 'IV', 'I', 'V'], [chord(A, 'min'), chord(F, 'maj'), chord(C, 'maj'), chord(G, 'maj')]),
      progression('I - IV - vi - V', ['I', 'IV', 'vi', 'V'], [chord(C, 'maj'), chord(F, 'maj'), chord(A, 'min'), chord(G, 'maj')])
    ],
    variationSet: VARIATIONS.popRock
  },
  {
    id: 'disco_70s',
    label: 'Disco 70s',
    subtitle: 'Febbre del sabato sera, cassa in quattro e lustrini.',
    icon: '✨',
    accent: { primary: '#ff78d1', surface: '#221021', glow: 'rgba(255,120,209,.44)' },
    tempoRange: { min: 112, max: 128, default: 120 },
    mainInstrumentPool: ['elecpiano', 'strings', 'brass'],
    bassInstrumentPool: ['bass_electric', 'bass_synth'],
    progressionPool: [
      progression('vi - IV - I - V', ['vi', 'IV', 'I', 'V'], [chord(A, 'min'), chord(F, 'maj'), chord(C, 'maj'), chord(G, 'maj')]),
      progression('I - vi - IV - V', ['I', 'vi', 'IV', 'V'], [chord(C, 'maj'), chord(A, 'min'), chord(F, 'maj'), chord(G, 'maj')]),
      progression('Imaj7 - III7 - vi7 - II7', ['Imaj7', 'III7', 'vi7', 'II7'], [chord(C, 'maj7'), chord(E, 'dom7'), chord(A, 'min7'), chord(D, 'dom7')])
    ],
    variationSet: VARIATIONS.disco70
  },
  {
    id: 'hiphop_boom_bap',
    label: 'Hip-Hop / Boom Bap',
    subtitle: 'Monologo ritmato, rap battle e groove quadrato.',
    icon: '🎙️',
    accent: { primary: '#9f8cff', surface: '#151223', glow: 'rgba(159,140,255,.42)' },
    tempoRange: { min: 82, max: 102, default: 92 },
    mainInstrumentPool: ['elecpiano', 'strings', 'synthpad'],
    bassInstrumentPool: ['bass_sub', 'bass_synth', 'bass_electric'],
    progressionPool: [
      progression('i - bVII - bVI - V', ['i', 'bVII', 'bVI', 'V'], [chord(A, 'min'), chord(G, 'maj'), chord(F, 'maj'), chord(E, 'dom7')]),
      progression('i - iv - bVII - bIII', ['i', 'iv', 'bVII', 'bIII'], [chord(A, 'min'), chord(D, 'min'), chord(G, 'maj'), chord(Eb, 'maj')]),
      progression('i - bIII - bVII - iv', ['i', 'bIII', 'bVII', 'iv'], [chord(A, 'min'), chord(C, 'maj'), chord(G, 'maj'), chord(D, 'min')])
    ],
    variationSet: VARIATIONS.hipHopBoomBap
  },
  {
    id: 'punk_rock',
    label: 'Punk Rock',
    subtitle: 'Rabbia, ribellione e chitarre dritte in faccia.',
    icon: '⚡',
    accent: { primary: '#ff5252', surface: '#250d0d', glow: 'rgba(255,82,82,.46)' },
    tempoRange: { min: 156, max: 186, default: 170 },
    mainInstrumentPool: ['distguitar', 'organ', 'brass'],
    bassInstrumentPool: ['bass_pick', 'bass_electric', 'bass_synth'],
    progressionPool: [
      progression('I - bVII - IV - I', ['I', 'bVII', 'IV', 'I'], [chord(C, 'maj'), chord(Bb, 'maj'), chord(F, 'maj'), chord(C, 'maj')]),
      progression('I - IV - bVII - I', ['I', 'IV', 'bVII', 'I'], [chord(C, 'maj'), chord(F, 'maj'), chord(Bb, 'maj'), chord(C, 'maj')]),
      progression('i - bVII - bVI - bVII', ['i', 'bVII', 'bVI', 'bVII'], [chord(A, 'min'), chord(G, 'maj'), chord(F, 'maj'), chord(G, 'maj')])
    ],
    variationSet: VARIATIONS.punkRock
  },
  {
    id: 'country_bluegrass',
    label: 'Country / Bluegrass',
    subtitle: 'Scena rurale, treno in corsa e cori da portico.',
    icon: '🤠',
    accent: { primary: '#ddb86c', surface: '#21180a', glow: 'rgba(221,184,108,.42)' },
    tempoRange: { min: 116, max: 148, default: 132 },
    mainInstrumentPool: ['steelguitar', 'nylonguitar', 'honkytonk'],
    bassInstrumentPool: ['bass_acoustic', 'bass_pick', 'bass_electric'],
    progressionPool: [
      progression('I - IV - V - I', ['I', 'IV', 'V', 'I'], [chord(C, 'maj'), chord(F, 'maj'), chord(G, 'maj'), chord(C, 'maj')]),
      progression('I - V - IV - I', ['I', 'V', 'IV', 'I'], [chord(C, 'maj'), chord(G, 'maj'), chord(F, 'maj'), chord(C, 'maj')]),
      progression('I - I - IV - V', ['I', 'I', 'IV', 'V'], [chord(C, 'maj'), chord(C, 'maj'), chord(F, 'maj'), chord(G, 'maj')])
    ],
    variationSet: VARIATIONS.countryBluegrass
  },
  {
    id: 'motown_soul',
    label: 'Motown / Soul',
    subtitle: 'Rullante su ogni battito e malinconia elegante anni 60.',
    icon: '💃',
    accent: { primary: '#ff8f5b', surface: '#24130d', glow: 'rgba(255,143,91,.42)' },
    tempoRange: { min: 100, max: 122, default: 112 },
    mainInstrumentPool: ['elecpiano', 'grandpiano', 'strings'],
    bassInstrumentPool: ['bass_pick', 'bass_electric', 'bass_acoustic'],
    progressionPool: [
      progression('I - iii - IV - V', ['I', 'iii', 'IV', 'V'], [chord(C, 'maj'), chord(E, 'min'), chord(F, 'maj'), chord(G, 'maj')]),
      progression('I - vi - IV - V', ['I', 'vi', 'IV', 'V'], [chord(C, 'maj'), chord(A, 'min'), chord(F, 'maj'), chord(G, 'maj')]),
      progression('I - IV - I7 - IV', ['I', 'IV', 'I7', 'IV'], [chord(C, 'maj'), chord(F, 'maj'), chord(C, 'dom7'), chord(F, 'maj')])
    ],
    variationSet: VARIATIONS.motownSoul
  },
  {
    id: 'salsa_montuno',
    label: 'Salsa / Montuno',
    subtitle: 'Esplosione latina, piano percussivo e tensione da palco.',
    icon: '💃',
    accent: { primary: '#ff7f50', surface: '#24110d', glow: 'rgba(255,127,80,.44)' },
    tempoRange: { min: 112, max: 138, default: 124 },
    mainInstrumentPool: ['grandpiano', 'elecpiano', 'brass'],
    bassInstrumentPool: ['bass_fretless', 'bass_pick', 'bass_electric'],
    progressionPool: [
      progression('I - IV - V7 - IV', ['I', 'IV', 'V7', 'IV'], [chord(C, 'maj'), chord(F, 'maj'), chord(G, 'dom7'), chord(F, 'maj')]),
      progression('ii7 - V7 - Imaj7 - IVmaj7', ['ii7', 'V7', 'Imaj7', 'IVmaj7'], [chord(D, 'min7'), chord(G, 'dom7'), chord(C, 'maj7'), chord(F, 'maj7')]),
      progression('i - V7 - i - V7', ['i', 'V7', 'i', 'V7'], [chord(A, 'min'), chord(E, 'dom7'), chord(A, 'min'), chord(E, 'dom7')])
    ],
    variationSet: VARIATIONS.salsaMontuno
  },
  {
    id: 'gospel',
    label: 'Gospel',
    subtitle: 'Momento epico, dinamiche crescenti e mani in alto.',
    icon: '⛪',
    accent: { primary: '#9ed56a', surface: '#15210d', glow: 'rgba(158,213,106,.44)' },
    tempoRange: { min: 92, max: 118, default: 104 },
    mainInstrumentPool: ['pipeorgan', 'organ', 'grandpiano'],
    bassInstrumentPool: ['bass_pick', 'bass_electric', 'bass_acoustic'],
    progressionPool: [
      progression('I - vi - ii - V7', ['I', 'vi', 'ii', 'V7'], [chord(C, 'maj'), chord(A, 'min'), chord(D, 'min'), chord(G, 'dom7')]),
      progression('I - bVII - IV - I', ['I', 'bVII', 'IV', 'I'], [chord(C, 'maj'), chord(Bb, 'maj'), chord(F, 'maj'), chord(C, 'maj')]),
      progression('IV - I - ii - V7', ['IV', 'I', 'ii', 'V7'], [chord(F, 'maj'), chord(C, 'maj'), chord(D, 'min'), chord(G, 'dom7')])
    ],
    variationSet: VARIATIONS.gospel
  },
  {
    id: 'synthwave_80s',
    label: 'Synth-Wave / Pop 80s',
    subtitle: 'Neon, Roland e corsa notturna in città.',
    icon: '🌆',
    accent: { primary: '#ff5ed8', surface: '#1f1022', glow: 'rgba(255,94,216,.46)' },
    tempoRange: { min: 104, max: 128, default: 116 },
    mainInstrumentPool: ['synthpad', 'elecpiano', 'strings'],
    bassInstrumentPool: ['bass_sub', 'bass_synth', 'bass_electric'],
    progressionPool: [
      progression('vi - IV - I - V', ['vi', 'IV', 'I', 'V'], [chord(A, 'min'), chord(F, 'maj'), chord(C, 'maj'), chord(G, 'maj')]),
      progression('i - bVI - bIII - bVII', ['i', 'bVI', 'bIII', 'bVII'], [chord(A, 'min'), chord(F, 'maj'), chord(C, 'maj'), chord(G, 'maj')]),
      progression('I - V - vi - IV', ['I', 'V', 'vi', 'IV'], [chord(C, 'maj'), chord(G, 'maj'), chord(A, 'min'), chord(F, 'maj')])
    ],
    variationSet: VARIATIONS.synthwave80
  },
  {
    id: 'tango',
    label: 'Tango',
    subtitle: 'Tensione, gelosia e seduzione con il coltello sotto il tavolo.',
    icon: '🩸',
    accent: { primary: '#f56b6b', surface: '#230d10', glow: 'rgba(245,107,107,.44)' },
    tempoRange: { min: 116, max: 142, default: 128 },
    mainInstrumentPool: ['accordion', 'strings', 'grandpiano'],
    bassInstrumentPool: ['bass_acoustic', 'bass_fretless'],
    progressionPool: [
      progression('i - V7 - i - V7', ['i', 'V7', 'i', 'V7'], [chord(A, 'min'), chord(E, 'dom7'), chord(A, 'min'), chord(E, 'dom7')]),
      progression('i - bVI - bVII - i', ['i', 'bVI', 'bVII', 'i'], [chord(A, 'min'), chord(F, 'maj'), chord(G, 'maj'), chord(A, 'min')]),
      progression('iv - i - bVII - V7', ['iv', 'i', 'bVII', 'V7'], [chord(D, 'min'), chord(A, 'min'), chord(G, 'maj'), chord(E, 'dom7')])
    ],
    variationSet: VARIATIONS.tango
  },
  {
    id: 'indie_folk',
    label: 'Indie Folk',
    subtitle: 'Corale, dritta, da falò o finale collettivo.',
    icon: '🪵',
    accent: { primary: '#d4c78a', surface: '#1d1b10', glow: 'rgba(212,199,138,.42)' },
    tempoRange: { min: 92, max: 118, default: 104 },
    mainInstrumentPool: ['nylonguitar', 'grandpiano', 'honkytonk'],
    bassInstrumentPool: ['bass_acoustic', 'bass_electric'],
    progressionPool: [
      progression('I - V - IV - I', ['I', 'V', 'IV', 'I'], [chord(C, 'maj'), chord(G, 'maj'), chord(F, 'maj'), chord(C, 'maj')]),
      progression('vi - IV - I - V', ['vi', 'IV', 'I', 'V'], [chord(A, 'min'), chord(F, 'maj'), chord(C, 'maj'), chord(G, 'maj')]),
      progression('I - IV - I - V', ['I', 'IV', 'I', 'V'], [chord(C, 'maj'), chord(F, 'maj'), chord(C, 'maj'), chord(G, 'maj')])
    ],
    variationSet: VARIATIONS.indieFolk
  }
];

function findStyleById(styleId) {
  return STYLE_DEFS.find((style) => style.id === styleId) || STYLE_DEFS[0];
}
