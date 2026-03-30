/**
 * MOTORE AUDIO
 * Gestisce Web Audio API, sintesi sonora, scheduler e percussioni.
 */

let ctx = null, masterGain, dryGain, revGain, revNode;
let nextBeatTime = 0, schedTimer = null;
const LOOK_AHEAD = 0.14, TICK_MS = 25;
const IS_FIREFOX_MOBILE = /Firefox/i.test(navigator.userAgent) && /Android|Mobile|Tablet/i.test(navigator.userAgent);

const MIX_PROFILE = IS_FIREFOX_MOBILE ? {
  master: 0.92,
  dry: 0.7,
  reverb: 0.18,
  compressor: {
    threshold: -22,
    knee: 10,
    ratio: 6,
    attack: 0.0015,
    release: 0.18
  },
  metronomeLead: 3.8,
  metronomeGhost: 2.1
} : {
  master: 1.0,
  dry: 0.76,
  reverb: 0.2,
  compressor: {
    threshold: -19,
    knee: 9,
    ratio: 5,
    attack: 0.002,
    release: 0.15
  },
  metronomeLead: 4.8,
  metronomeGhost: 2.7
};

const DRUM_STYLE_VARIATIONS = {
  swing: [
    { name: 'Feather Swing', kit: { kick: { gain: 0.96, playbackRate: 0.94, filterType: 'lowpass', filterFrequency: 950 }, snare: { gain: 0.82, playbackRate: 1.03, filterType: 'bandpass', filterFrequency: 2200, q: 0.9 }, hihat: { gain: 0.95, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 6200 }, rim: { gain: 0.72, playbackRate: 1.05, filterType: 'highpass', filterFrequency: 3400 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.66, gain: 0.72 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.66, gain: 0.76 }], [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.66, gain: 0.72 }], [{ drum: 'snare', gain: 1.05 }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.66, gain: 0.8 }] ] },
    { name: 'Late Club', kit: { kick: { gain: 0.88, playbackRate: 0.98, filterType: 'lowpass', filterFrequency: 1100 }, snare: { gain: 0.76, playbackRate: 0.98, filterType: 'bandpass', filterFrequency: 1850, q: 0.85 }, hihat: { gain: 0.92, playbackRate: 1.14, filterType: 'highpass', filterFrequency: 7000 }, rim: { gain: 0.62, playbackRate: 1.1, filterType: 'highpass', filterFrequency: 3600 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.62 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.75, gain: 0.42 }], [{ drum: 'kick', gain: 0.92 }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.62 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.75, gain: 0.46 }] ] },
    { name: 'Ride Ghost', kit: { kick: { gain: 1.02, playbackRate: 0.92, filterType: 'lowpass', filterFrequency: 880 }, snare: { gain: 0.8, playbackRate: 1.06, filterType: 'bandpass', filterFrequency: 2400, q: 1.1 }, hihat: { gain: 0.86, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 7800 }, rim: { gain: 0.74, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 3900 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.66, gain: 0.36 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.66, gain: 0.74 }], [{ drum: 'kick', gain: 0.9 }, { drum: 'hihat' }, { drum: 'rim', offset: 0.66, gain: 0.34 }], [{ drum: 'snare', gain: 1.08 }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.66, gain: 0.78 }] ] },
    { name: 'Pocket Brush', kit: { kick: { gain: 0.9, playbackRate: 1.0, filterType: 'lowpass', filterFrequency: 1150 }, snare: { gain: 0.7, playbackRate: 0.96, filterType: 'bandpass', filterFrequency: 1650, q: 0.7 }, hihat: { gain: 0.84, playbackRate: 1.12, filterType: 'highpass', filterFrequency: 6600 }, rim: { gain: 0.68, playbackRate: 1.16, filterType: 'highpass', filterFrequency: 4100 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.5, gain: 0.33 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.75, gain: 0.62 }], [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.5, gain: 0.33 }], [{ drum: 'snare', gain: 0.96 }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.75, gain: 0.68 }] ] },
    { name: 'Hard Bop', kit: { kick: { gain: 1.08, playbackRate: 0.9, filterType: 'lowpass', filterFrequency: 820 }, snare: { gain: 0.9, playbackRate: 1.02, filterType: 'bandpass', filterFrequency: 2600, q: 1.15 }, hihat: { gain: 0.9, playbackRate: 1.05, filterType: 'highpass', filterFrequency: 6100 }, rim: { gain: 0.76, playbackRate: 1.02, filterType: 'highpass', filterFrequency: 3300 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'kick', offset: 0.75, gain: 0.42 }], [{ drum: 'snare', gain: 1.08 }, { drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'kick', offset: 0.75, gain: 0.44 }], [{ drum: 'snare', gain: 1.12 }, { drum: 'hihat' }, { drum: 'rim', offset: 0.5, gain: 0.32 }] ] },
    { name: 'Cinema Swing', kit: { kick: { gain: 0.98, playbackRate: 0.95, filterType: 'lowpass', filterFrequency: 1020 }, snare: { gain: 0.78, playbackRate: 1.08, filterType: 'bandpass', filterFrequency: 2050, q: 0.8 }, hihat: { gain: 0.98, playbackRate: 1.22, filterType: 'highpass', filterFrequency: 8200 }, rim: { gain: 0.7, playbackRate: 1.14, filterType: 'highpass', filterFrequency: 4400 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.33, gain: 0.56 }, { drum: 'rim', offset: 0.66, gain: 0.26 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.66, gain: 0.74 }], [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.33, gain: 0.56 }, { drum: 'rim', offset: 0.66, gain: 0.26 }], [{ drum: 'snare', gain: 1.04 }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.66, gain: 0.8 }] ] }
  ],
  rock: [
    { name: 'Arena Tight', kit: { kick: { gain: 1.1, playbackRate: 0.92, filterType: 'lowpass', filterFrequency: 820 }, snare: { gain: 1.0, playbackRate: 0.96, filterType: 'bandpass', filterFrequency: 1900, q: 0.75 }, hihat: { gain: 1.0, playbackRate: 1.0, filterType: 'highpass', filterFrequency: 5600 }, rim: { gain: 0.5, playbackRate: 1.0, filterType: 'highpass', filterFrequency: 3000 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.7 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.76 }], [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.7 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.78 }] ] },
    { name: 'Garage Open', kit: { kick: { gain: 1.04, playbackRate: 0.98, filterType: 'lowpass', filterFrequency: 980 }, snare: { gain: 0.92, playbackRate: 1.04, filterType: 'bandpass', filterFrequency: 2250, q: 0.9 }, hihat: { gain: 0.9, playbackRate: 1.12, filterType: 'highpass', filterFrequency: 7000 }, rim: { gain: 0.48, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 3600 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat', open: true, gain: 0.86 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.66 }], [{ drum: 'kick' }, { drum: 'hihat', open: true, gain: 0.88 }, { drum: 'kick', offset: 0.75, gain: 0.44 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.68 }] ] },
    { name: 'Stomp Drive', kit: { kick: { gain: 1.16, playbackRate: 0.88, filterType: 'lowpass', filterFrequency: 760 }, snare: { gain: 0.96, playbackRate: 0.94, filterType: 'bandpass', filterFrequency: 1750, q: 0.7 }, hihat: { gain: 0.88, playbackRate: 0.98, filterType: 'highpass', filterFrequency: 5200 }, rim: { gain: 0.52, playbackRate: 0.94, filterType: 'highpass', filterFrequency: 2800 } }, pattern: [ [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.46 }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.46 }, { drum: 'hihat' }], [{ drum: 'snare', gain: 1.06 }, { drum: 'hihat' }] ] },
    { name: 'Brit Edge', kit: { kick: { gain: 0.98, playbackRate: 1.02, filterType: 'lowpass', filterFrequency: 1120 }, snare: { gain: 0.9, playbackRate: 1.1, filterType: 'bandpass', filterFrequency: 2500, q: 0.95 }, hihat: { gain: 0.95, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 7600 }, rim: { gain: 0.55, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 4200 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.25, gain: 0.26 }, { drum: 'hihat', offset: 0.5, gain: 0.66 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.7 }], [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.25, gain: 0.26 }, { drum: 'hihat', offset: 0.5, gain: 0.66 }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.72 }] ] },
    { name: 'Low Room', kit: { kick: { gain: 1.08, playbackRate: 0.9, filterType: 'lowpass', filterFrequency: 860 }, snare: { gain: 0.86, playbackRate: 0.9, filterType: 'bandpass', filterFrequency: 1600, q: 0.65 }, hihat: { gain: 0.82, playbackRate: 0.92, filterType: 'highpass', filterFrequency: 4800 }, rim: { gain: 0.46, playbackRate: 0.9, filterType: 'highpass', filterFrequency: 2500 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'kick', offset: 0.75, gain: 0.34 }], [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'kick', offset: 0.75, gain: 0.38 }] ] },
    { name: 'Radio Anthem', kit: { kick: { gain: 1.02, playbackRate: 0.96, filterType: 'lowpass', filterFrequency: 930 }, snare: { gain: 1.02, playbackRate: 1.0, filterType: 'bandpass', filterFrequency: 2100, q: 0.82 }, hihat: { gain: 1.0, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 6400 }, rim: { gain: 0.58, playbackRate: 1.06, filterType: 'highpass', filterFrequency: 3800 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.74 }, { drum: 'kick', offset: 0.75, gain: 0.34 }], [{ drum: 'snare', gain: 1.08 }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.78 }], [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.74 }], [{ drum: 'snare', gain: 1.08 }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.8 }] ] }
  ],
  funk: [
    { name: 'Dry Pocket', kit: { kick: { gain: 1.04, playbackRate: 0.96, filterType: 'lowpass', filterFrequency: 900 }, snare: { gain: 0.86, playbackRate: 1.06, filterType: 'bandpass', filterFrequency: 2350, q: 1.0 }, hihat: { gain: 0.94, playbackRate: 1.15, filterType: 'highpass', filterFrequency: 7100 }, rim: { gain: 0.68, playbackRate: 1.1, filterType: 'highpass', filterFrequency: 4100 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.62 }], [{ drum: 'snare' }, { drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.48 }, { drum: 'hihat' }], [{ drum: 'snare', gain: 1.08 }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.6 }] ] },
    { name: 'Clav Snap', kit: { kick: { gain: 0.98, playbackRate: 1.0, filterType: 'lowpass', filterFrequency: 980 }, snare: { gain: 0.82, playbackRate: 1.12, filterType: 'bandpass', filterFrequency: 2750, q: 1.1 }, hihat: { gain: 0.88, playbackRate: 1.22, filterType: 'highpass', filterFrequency: 8200 }, rim: { gain: 0.82, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 4700 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.75, gain: 0.44 }], [{ drum: 'snare' }, { drum: 'hihat', offset: 0.5, gain: 0.54 }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.42 }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'rim', offset: 0.25, gain: 0.38 }, { drum: 'hihat', offset: 0.5, gain: 0.56 }] ] },
    { name: 'Deep Bounce', kit: { kick: { gain: 1.12, playbackRate: 0.9, filterType: 'lowpass', filterFrequency: 780 }, snare: { gain: 0.8, playbackRate: 0.98, filterType: 'bandpass', filterFrequency: 1850, q: 0.8 }, hihat: { gain: 0.82, playbackRate: 1.02, filterType: 'highpass', filterFrequency: 5900 }, rim: { gain: 0.6, playbackRate: 1.0, filterType: 'highpass', filterFrequency: 3600 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'kick', offset: 0.75, gain: 0.38 }, { drum: 'hihat', offset: 0.5, gain: 0.5 }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.46 }, { drum: 'hihat' }], [{ drum: 'snare', gain: 1.04 }, { drum: 'hihat', offset: 0.5, gain: 0.52 }] ] },
    { name: 'Neon Tick', kit: { kick: { gain: 0.96, playbackRate: 1.04, filterType: 'lowpass', filterFrequency: 1180 }, snare: { gain: 0.84, playbackRate: 1.16, filterType: 'bandpass', filterFrequency: 3000, q: 1.0 }, hihat: { gain: 0.9, playbackRate: 1.26, filterType: 'highpass', filterFrequency: 8600 }, rim: { gain: 0.76, playbackRate: 1.24, filterType: 'highpass', filterFrequency: 5200 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.5, gain: 0.3 }], [{ drum: 'snare' }, { drum: 'hihat', offset: 0.5, gain: 0.48 }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.25, gain: 0.34 }, { drum: 'kick', offset: 0.75, gain: 0.34 }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'hihat', offset: 0.5, gain: 0.5 }] ] },
    { name: 'Ghost Jam', kit: { kick: { gain: 1.0, playbackRate: 0.98, filterType: 'lowpass', filterFrequency: 940 }, snare: { gain: 0.72, playbackRate: 1.08, filterType: 'bandpass', filterFrequency: 2300, q: 1.2 }, hihat: { gain: 0.86, playbackRate: 1.12, filterType: 'highpass', filterFrequency: 7200 }, rim: { gain: 0.7, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 4300 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.5, gain: 0.24 }], [{ drum: 'snare', gain: 0.92 }, { drum: 'rim', offset: 0.25, gain: 0.32 }, { drum: 'hihat', offset: 0.5, gain: 0.44 }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.38 }, { drum: 'hihat' }], [{ drum: 'snare', gain: 0.96 }, { drum: 'rim', offset: 0.75, gain: 0.28 }, { drum: 'hihat', offset: 0.5, gain: 0.46 }] ] },
    { name: 'Wide Bounce', kit: { kick: { gain: 1.08, playbackRate: 0.92, filterType: 'lowpass', filterFrequency: 850 }, snare: { gain: 0.9, playbackRate: 1.0, filterType: 'bandpass', filterFrequency: 2050, q: 0.85 }, hihat: { gain: 0.9, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 6600 }, rim: { gain: 0.66, playbackRate: 1.02, filterType: 'highpass', filterFrequency: 3900 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.58 }], [{ drum: 'snare' }, { drum: 'rim', offset: 0.75, gain: 0.34 }, { drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.42 }, { drum: 'hihat', offset: 0.75, gain: 0.46 }], [{ drum: 'snare', gain: 1.02 }, { drum: 'hihat' }, { drum: 'hihat', offset: 0.5, gain: 0.6 }] ] }
  ],
  bossa: [
    { name: 'Soft Nylon', kit: { kick: { gain: 0.92, playbackRate: 1.0, filterType: 'lowpass', filterFrequency: 1050 }, snare: { gain: 0.56, playbackRate: 1.08, filterType: 'bandpass', filterFrequency: 2500, q: 0.9 }, hihat: { gain: 0.82, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 7800 }, rim: { gain: 0.86, playbackRate: 1.06, filterType: 'highpass', filterFrequency: 3600 } }, pattern: [ [{ drum: 'kick' }, { drum: 'rim' }], [{ drum: 'hihat', open: true, gain: 0.74 }, { drum: 'rim', offset: 0.5, gain: 0.44 }], [{ drum: 'kick' }, { drum: 'rim' }], [{ drum: 'hihat', open: true, gain: 0.74 }, { drum: 'rim', offset: 0.5, gain: 0.46 }] ] },
    { name: 'Cafe Brush', kit: { kick: { gain: 0.86, playbackRate: 1.04, filterType: 'lowpass', filterFrequency: 1180 }, snare: { gain: 0.52, playbackRate: 1.14, filterType: 'bandpass', filterFrequency: 2950, q: 0.8 }, hihat: { gain: 0.76, playbackRate: 1.24, filterType: 'highpass', filterFrequency: 8600 }, rim: { gain: 0.8, playbackRate: 1.14, filterType: 'highpass', filterFrequency: 4300 } }, pattern: [ [{ drum: 'kick' }, { drum: 'rim', offset: 0.5, gain: 0.38 }], [{ drum: 'hihat', open: true, gain: 0.68 }, { drum: 'rim' }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.5, gain: 0.38 }], [{ drum: 'hihat', open: true, gain: 0.68 }, { drum: 'rim' }] ] },
    { name: 'Late Terrace', kit: { kick: { gain: 0.9, playbackRate: 0.96, filterType: 'lowpass', filterFrequency: 920 }, snare: { gain: 0.5, playbackRate: 1.02, filterType: 'bandpass', filterFrequency: 2200, q: 0.75 }, hihat: { gain: 0.8, playbackRate: 1.1, filterType: 'highpass', filterFrequency: 6900 }, rim: { gain: 0.9, playbackRate: 1.0, filterType: 'highpass', filterFrequency: 3300 } }, pattern: [ [{ drum: 'kick' }, { drum: 'rim' }, { drum: 'rim', offset: 0.75, gain: 0.24 }], [{ drum: 'hihat', open: true, gain: 0.72 }], [{ drum: 'kick' }, { drum: 'rim' }, { drum: 'rim', offset: 0.75, gain: 0.24 }], [{ drum: 'hihat', open: true, gain: 0.72 }, { drum: 'snare', gain: 0.24, offset: 0.5 }] ] },
    { name: 'Rio Pulse', kit: { kick: { gain: 0.98, playbackRate: 0.94, filterType: 'lowpass', filterFrequency: 880 }, snare: { gain: 0.62, playbackRate: 1.1, filterType: 'bandpass', filterFrequency: 2700, q: 1.0 }, hihat: { gain: 0.78, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 8000 }, rim: { gain: 0.84, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 3900 } }, pattern: [ [{ drum: 'kick' }, { drum: 'rim' }], [{ drum: 'hihat', open: true, gain: 0.66 }, { drum: 'rim', offset: 0.75, gain: 0.34 }], [{ drum: 'kick' }, { drum: 'rim' }, { drum: 'kick', offset: 0.5, gain: 0.3 }], [{ drum: 'hihat', open: true, gain: 0.68 }] ] },
    { name: 'Muted Lounge', kit: { kick: { gain: 0.82, playbackRate: 1.06, filterType: 'lowpass', filterFrequency: 1260 }, snare: { gain: 0.46, playbackRate: 1.2, filterType: 'bandpass', filterFrequency: 3100, q: 0.95 }, hihat: { gain: 0.74, playbackRate: 1.3, filterType: 'highpass', filterFrequency: 9100 }, rim: { gain: 0.76, playbackRate: 1.2, filterType: 'highpass', filterFrequency: 4700 } }, pattern: [ [{ drum: 'kick' }, { drum: 'rim', offset: 0.5, gain: 0.32 }], [{ drum: 'hihat', open: true, gain: 0.62 }, { drum: 'rim' }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.5, gain: 0.32 }], [{ drum: 'hihat', open: true, gain: 0.64 }, { drum: 'rim', offset: 0.75, gain: 0.3 }] ] },
    { name: 'Warm Sunset', kit: { kick: { gain: 0.94, playbackRate: 0.98, filterType: 'lowpass', filterFrequency: 980 }, snare: { gain: 0.54, playbackRate: 1.06, filterType: 'bandpass', filterFrequency: 2400, q: 0.82 }, hihat: { gain: 0.82, playbackRate: 1.16, filterType: 'highpass', filterFrequency: 7600 }, rim: { gain: 0.88, playbackRate: 1.04, filterType: 'highpass', filterFrequency: 3500 } }, pattern: [ [{ drum: 'kick' }, { drum: 'rim' }], [{ drum: 'hihat', open: true, gain: 0.72 }, { drum: 'rim', offset: 0.5, gain: 0.42 }], [{ drum: 'kick' }, { drum: 'rim' }, { drum: 'kick', offset: 0.75, gain: 0.28 }], [{ drum: 'hihat', open: true, gain: 0.72 }, { drum: 'rim', offset: 0.5, gain: 0.44 }] ] }
  ],
  march: [
    { name: 'Parade Brass', kit: { kick: { gain: 1.06, playbackRate: 0.9, filterType: 'lowpass', filterFrequency: 780 }, snare: { gain: 1.02, playbackRate: 1.0, filterType: 'bandpass', filterFrequency: 2100, q: 0.78 }, hihat: { gain: 0.7, playbackRate: 1.02, filterType: 'highpass', filterFrequency: 5300 }, rim: { gain: 0.44, playbackRate: 1.0, filterType: 'highpass', filterFrequency: 2800 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', gain: 0.72, offset: 0.08 }], [{ drum: 'hihat' }], [{ drum: 'kick' }], [{ drum: 'snare' }, { drum: 'hihat' }] ] },
    { name: 'Toy Theatre', kit: { kick: { gain: 0.92, playbackRate: 1.02, filterType: 'lowpass', filterFrequency: 1080 }, snare: { gain: 0.84, playbackRate: 1.16, filterType: 'bandpass', filterFrequency: 2650, q: 0.95 }, hihat: { gain: 0.76, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 7400 }, rim: { gain: 0.56, playbackRate: 1.24, filterType: 'highpass', filterFrequency: 4500 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', gain: 0.56, offset: 0.12 }], [{ drum: 'hihat' }, { drum: 'rim', offset: 0.5, gain: 0.22 }], [{ drum: 'kick' }], [{ drum: 'snare' }, { drum: 'hihat' }] ] },
    { name: 'Military Tight', kit: { kick: { gain: 1.12, playbackRate: 0.86, filterType: 'lowpass', filterFrequency: 700 }, snare: { gain: 1.06, playbackRate: 0.96, filterType: 'bandpass', filterFrequency: 1750, q: 0.7 }, hihat: { gain: 0.68, playbackRate: 0.98, filterType: 'highpass', filterFrequency: 4800 }, rim: { gain: 0.4, playbackRate: 0.94, filterType: 'highpass', filterFrequency: 2400 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', gain: 0.76, offset: 0.1 }], [{ drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.34 }], [{ drum: 'snare', gain: 1.04 }, { drum: 'hihat' }] ] },
    { name: 'Carousel Step', kit: { kick: { gain: 0.98, playbackRate: 0.98, filterType: 'lowpass', filterFrequency: 920 }, snare: { gain: 0.9, playbackRate: 1.1, filterType: 'bandpass', filterFrequency: 2350, q: 0.88 }, hihat: { gain: 0.74, playbackRate: 1.12, filterType: 'highpass', filterFrequency: 6900 }, rim: { gain: 0.5, playbackRate: 1.14, filterType: 'highpass', filterFrequency: 3900 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', gain: 0.64, offset: 0.08 }], [{ drum: 'hihat' }], [{ drum: 'kick' }], [{ drum: 'snare' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.5, gain: 0.24 }] ] },
    { name: 'Cinematic Row', kit: { kick: { gain: 1.08, playbackRate: 0.92, filterType: 'lowpass', filterFrequency: 840 }, snare: { gain: 0.94, playbackRate: 1.02, filterType: 'bandpass', filterFrequency: 2050, q: 0.8 }, hihat: { gain: 0.72, playbackRate: 1.05, filterType: 'highpass', filterFrequency: 5700 }, rim: { gain: 0.48, playbackRate: 1.02, filterType: 'highpass', filterFrequency: 3200 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', gain: 0.66, offset: 0.12 }], [{ drum: 'hihat' }, { drum: 'kick', offset: 0.75, gain: 0.26 }], [{ drum: 'kick' }], [{ drum: 'snare' }, { drum: 'hihat' }] ] },
    { name: 'Old Tape March', kit: { kick: { gain: 0.9, playbackRate: 1.06, filterType: 'lowpass', filterFrequency: 1140 }, snare: { gain: 0.82, playbackRate: 1.18, filterType: 'bandpass', filterFrequency: 2800, q: 1.0 }, hihat: { gain: 0.78, playbackRate: 1.2, filterType: 'highpass', filterFrequency: 8000 }, rim: { gain: 0.54, playbackRate: 1.2, filterType: 'highpass', filterFrequency: 4600 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', gain: 0.54, offset: 0.1 }], [{ drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.5, gain: 0.22 }], [{ drum: 'snare' }, { drum: 'hihat' }] ] }
  ],
  latin: [
    { name: 'Rumba Dry', kit: { kick: { gain: 0.98, playbackRate: 0.96, filterType: 'lowpass', filterFrequency: 920 }, snare: { gain: 0.62, playbackRate: 1.08, filterType: 'bandpass', filterFrequency: 2500, q: 0.92 }, hihat: { gain: 0.78, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 7800 }, rim: { gain: 0.88, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 3900 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'rim' }, { drum: 'hihat', offset: 0.5, gain: 0.42 }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.33, gain: 0.48 }, { drum: 'hihat' }], [{ drum: 'snare' }] ] },
    { name: 'Street Clave', kit: { kick: { gain: 0.92, playbackRate: 1.0, filterType: 'lowpass', filterFrequency: 1010 }, snare: { gain: 0.58, playbackRate: 1.14, filterType: 'bandpass', filterFrequency: 2850, q: 1.0 }, hihat: { gain: 0.72, playbackRate: 1.24, filterType: 'highpass', filterFrequency: 8600 }, rim: { gain: 0.94, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 4700 } }, pattern: [ [{ drum: 'kick' }, { drum: 'rim', offset: 0.5, gain: 0.42 }, { drum: 'hihat' }], [{ drum: 'rim' }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.33, gain: 0.52 }], [{ drum: 'snare' }, { drum: 'rim', offset: 0.66, gain: 0.36 }] ] },
    { name: 'Warm Cumbia', kit: { kick: { gain: 1.02, playbackRate: 0.92, filterType: 'lowpass', filterFrequency: 860 }, snare: { gain: 0.64, playbackRate: 1.0, filterType: 'bandpass', filterFrequency: 2200, q: 0.78 }, hihat: { gain: 0.76, playbackRate: 1.1, filterType: 'highpass', filterFrequency: 6900 }, rim: { gain: 0.82, playbackRate: 1.04, filterType: 'highpass', filterFrequency: 3400 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'rim' }, { drum: 'kick', offset: 0.75, gain: 0.28 }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.33, gain: 0.44 }, { drum: 'hihat', offset: 0.66, gain: 0.38 }], [{ drum: 'snare' }] ] },
    { name: 'Festival Snap', kit: { kick: { gain: 0.96, playbackRate: 1.02, filterType: 'lowpass', filterFrequency: 1080 }, snare: { gain: 0.68, playbackRate: 1.18, filterType: 'bandpass', filterFrequency: 3000, q: 1.05 }, hihat: { gain: 0.8, playbackRate: 1.26, filterType: 'highpass', filterFrequency: 9100 }, rim: { gain: 0.9, playbackRate: 1.22, filterType: 'highpass', filterFrequency: 5200 } }, pattern: [ [{ drum: 'kick' }, { drum: 'rim', offset: 0.5, gain: 0.34 }, { drum: 'hihat' }], [{ drum: 'rim' }, { drum: 'hihat', offset: 0.5, gain: 0.38 }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.33, gain: 0.5 }], [{ drum: 'snare' }, { drum: 'rim', offset: 0.66, gain: 0.34 }] ] },
    { name: 'Low Patio', kit: { kick: { gain: 1.04, playbackRate: 0.9, filterType: 'lowpass', filterFrequency: 760 }, snare: { gain: 0.58, playbackRate: 1.04, filterType: 'bandpass', filterFrequency: 2350, q: 0.82 }, hihat: { gain: 0.68, playbackRate: 1.04, filterType: 'highpass', filterFrequency: 6200 }, rim: { gain: 0.8, playbackRate: 1.0, filterType: 'highpass', filterFrequency: 3100 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'rim' }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.33, gain: 0.42 }, { drum: 'kick', offset: 0.66, gain: 0.28 }], [{ drum: 'snare' }] ] },
    { name: 'Bright Plaza', kit: { kick: { gain: 0.94, playbackRate: 1.04, filterType: 'lowpass', filterFrequency: 1160 }, snare: { gain: 0.7, playbackRate: 1.2, filterType: 'bandpass', filterFrequency: 3200, q: 1.1 }, hihat: { gain: 0.82, playbackRate: 1.3, filterType: 'highpass', filterFrequency: 9800 }, rim: { gain: 0.94, playbackRate: 1.24, filterType: 'highpass', filterFrequency: 5600 } }, pattern: [ [{ drum: 'kick' }, { drum: 'rim', offset: 0.5, gain: 0.36 }, { drum: 'hihat' }], [{ drum: 'rim' }, { drum: 'hihat', offset: 0.5, gain: 0.4 }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.33, gain: 0.52 }], [{ drum: 'snare' }, { drum: 'rim', offset: 0.66, gain: 0.38 }] ] }
  ],
  gospel: [
    { name: 'Church Tight', kit: { kick: { gain: 1.04, playbackRate: 0.94, filterType: 'lowpass', filterFrequency: 860 }, snare: { gain: 1.02, playbackRate: 1.0, filterType: 'bandpass', filterFrequency: 2050, q: 0.82 }, hihat: { gain: 0.84, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 6400 }, rim: { gain: 0.52, playbackRate: 1.02, filterType: 'highpass', filterFrequency: 3400 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare', gain: 1.1 }, { drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.42 }, { drum: 'hihat' }], [{ drum: 'snare', gain: 1.04 }, { drum: 'hihat' }] ] },
    { name: 'Soul Clap', kit: { kick: { gain: 0.98, playbackRate: 0.98, filterType: 'lowpass', filterFrequency: 980 }, snare: { gain: 0.94, playbackRate: 1.12, filterType: 'bandpass', filterFrequency: 2650, q: 0.96 }, hihat: { gain: 0.82, playbackRate: 1.16, filterType: 'highpass', filterFrequency: 7700 }, rim: { gain: 0.72, playbackRate: 1.16, filterType: 'highpass', filterFrequency: 4600 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.5, gain: 0.3 }], [{ drum: 'snare', gain: 1.06 }, { drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.44 }], [{ drum: 'snare' }, { drum: 'rim', offset: 0.5, gain: 0.34 }, { drum: 'hihat' }] ] },
    { name: 'Warm Organ', kit: { kick: { gain: 1.08, playbackRate: 0.9, filterType: 'lowpass', filterFrequency: 790 }, snare: { gain: 0.9, playbackRate: 0.96, filterType: 'bandpass', filterFrequency: 1750, q: 0.74 }, hihat: { gain: 0.76, playbackRate: 1.0, filterType: 'highpass', filterFrequency: 5600 }, rim: { gain: 0.48, playbackRate: 0.96, filterType: 'highpass', filterFrequency: 2900 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'kick', offset: 0.75, gain: 0.3 }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.48 }, { drum: 'hihat' }], [{ drum: 'snare', gain: 0.98 }, { drum: 'hihat' }] ] },
    { name: 'Bright Chapel', kit: { kick: { gain: 0.96, playbackRate: 1.04, filterType: 'lowpass', filterFrequency: 1120 }, snare: { gain: 1.0, playbackRate: 1.14, filterType: 'bandpass', filterFrequency: 2900, q: 1.04 }, hihat: { gain: 0.88, playbackRate: 1.22, filterType: 'highpass', filterFrequency: 8800 }, rim: { gain: 0.6, playbackRate: 1.2, filterType: 'highpass', filterFrequency: 5100 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }, { drum: 'rim', offset: 0.5, gain: 0.28 }], [{ drum: 'snare', gain: 1.08 }, { drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.4 }, { drum: 'hihat' }], [{ drum: 'snare', gain: 1.02 }, { drum: 'hihat' }, { drum: 'rim', offset: 0.5, gain: 0.3 }] ] },
    { name: 'Backbeat Lift', kit: { kick: { gain: 1.0, playbackRate: 0.96, filterType: 'lowpass', filterFrequency: 900 }, snare: { gain: 0.96, playbackRate: 1.04, filterType: 'bandpass', filterFrequency: 2300, q: 0.88 }, hihat: { gain: 0.82, playbackRate: 1.1, filterType: 'highpass', filterFrequency: 6800 }, rim: { gain: 0.54, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 3700 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare', gain: 1.12 }, { drum: 'rim', offset: 0.25, gain: 0.26 }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.44 }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'hihat' }] ] },
    { name: 'Big Hall', kit: { kick: { gain: 1.06, playbackRate: 0.92, filterType: 'lowpass', filterFrequency: 840 }, snare: { gain: 1.04, playbackRate: 0.98, filterType: 'bandpass', filterFrequency: 1950, q: 0.8 }, hihat: { gain: 0.8, playbackRate: 1.06, filterType: 'highpass', filterFrequency: 6200 }, rim: { gain: 0.5, playbackRate: 1.0, filterType: 'highpass', filterFrequency: 3300 } }, pattern: [ [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare', gain: 1.14 }, { drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5, gain: 0.46 }, { drum: 'hihat' }], [{ drum: 'snare', gain: 1.08 }, { drum: 'hihat' }, { drum: 'kick', offset: 0.75, gain: 0.3 }] ] }
  ],
  tango: [
    { name: 'Bandoneon Step', kit: { kick: { gain: 1.0, playbackRate: 0.94, filterType: 'lowpass', filterFrequency: 860 }, snare: { gain: 0.84, playbackRate: 1.02, filterType: 'bandpass', filterFrequency: 2200, q: 0.86 }, hihat: { gain: 0.6, playbackRate: 1.0, filterType: 'highpass', filterFrequency: 5900 }, rim: { gain: 0.9, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 3800 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', gain: 0.84, offset: 0.04 }], [{ drum: 'rim' }], [{ drum: 'kick' }], [{ drum: 'rim' }] ] },
    { name: 'Dark Salon', kit: { kick: { gain: 1.08, playbackRate: 0.88, filterType: 'lowpass', filterFrequency: 740 }, snare: { gain: 0.76, playbackRate: 0.98, filterType: 'bandpass', filterFrequency: 1800, q: 0.72 }, hihat: { gain: 0.54, playbackRate: 0.94, filterType: 'highpass', filterFrequency: 4700 }, rim: { gain: 0.82, playbackRate: 1.0, filterType: 'highpass', filterFrequency: 3100 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', offset: 0.05, gain: 0.76 }], [{ drum: 'rim' }, { drum: 'kick', offset: 0.75, gain: 0.24 }], [{ drum: 'kick' }], [{ drum: 'rim' }] ] },
    { name: 'Knife Edge', kit: { kick: { gain: 0.94, playbackRate: 1.02, filterType: 'lowpass', filterFrequency: 1090 }, snare: { gain: 0.82, playbackRate: 1.16, filterType: 'bandpass', filterFrequency: 2850, q: 1.0 }, hihat: { gain: 0.58, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 8200 }, rim: { gain: 0.96, playbackRate: 1.18, filterType: 'highpass', filterFrequency: 5100 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', offset: 0.04, gain: 0.8 }], [{ drum: 'rim' }, { drum: 'rim', offset: 0.5, gain: 0.28 }], [{ drum: 'kick' }], [{ drum: 'rim' }] ] },
    { name: 'Cafe Notte', kit: { kick: { gain: 0.98, playbackRate: 0.98, filterType: 'lowpass', filterFrequency: 930 }, snare: { gain: 0.72, playbackRate: 1.08, filterType: 'bandpass', filterFrequency: 2450, q: 0.92 }, hihat: { gain: 0.56, playbackRate: 1.08, filterType: 'highpass', filterFrequency: 7000 }, rim: { gain: 0.88, playbackRate: 1.1, filterType: 'highpass', filterFrequency: 4200 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', offset: 0.06, gain: 0.78 }], [{ drum: 'rim' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.75, gain: 0.2 }], [{ drum: 'rim' }, { drum: 'rim', offset: 0.5, gain: 0.24 }] ] },
    { name: 'Stage Heel', kit: { kick: { gain: 1.04, playbackRate: 0.9, filterType: 'lowpass', filterFrequency: 810 }, snare: { gain: 0.86, playbackRate: 1.0, filterType: 'bandpass', filterFrequency: 2050, q: 0.78 }, hihat: { gain: 0.52, playbackRate: 0.98, filterType: 'highpass', filterFrequency: 5600 }, rim: { gain: 0.84, playbackRate: 1.02, filterType: 'highpass', filterFrequency: 3400 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', offset: 0.04, gain: 0.82 }], [{ drum: 'rim' }], [{ drum: 'kick' }], [{ drum: 'rim' }, { drum: 'kick', offset: 0.75, gain: 0.22 }] ] },
    { name: 'Velvet Drama', kit: { kick: { gain: 0.92, playbackRate: 1.04, filterType: 'lowpass', filterFrequency: 1160 }, snare: { gain: 0.78, playbackRate: 1.18, filterType: 'bandpass', filterFrequency: 2950, q: 1.05 }, hihat: { gain: 0.58, playbackRate: 1.16, filterType: 'highpass', filterFrequency: 8600 }, rim: { gain: 0.94, playbackRate: 1.2, filterType: 'highpass', filterFrequency: 5400 } }, pattern: [ [{ drum: 'kick' }, { drum: 'snare', offset: 0.04, gain: 0.8 }], [{ drum: 'rim' }, { drum: 'rim', offset: 0.5, gain: 0.3 }], [{ drum: 'kick' }], [{ drum: 'rim' }] ] }
  ]
};

const DEFAULT_DRUM_STYLE = 'swing';

let currentDrumStyle = DEFAULT_DRUM_STYLE;
let currentDrumVariation = DRUM_STYLE_VARIATIONS[DEFAULT_DRUM_STYLE][0];

// AUDIO INIT
function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain(); masterGain.gain.value = MIX_PROFILE.master;
  dryGain = ctx.createGain(); dryGain.gain.value = MIX_PROFILE.dry;
  revGain = ctx.createGain(); revGain.gain.value = MIX_PROFILE.reverb;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = MIX_PROFILE.compressor.threshold;
  comp.knee.value = MIX_PROFILE.compressor.knee;
  comp.ratio.value = MIX_PROFILE.compressor.ratio;
  comp.attack.value = MIX_PROFILE.compressor.attack;
  comp.release.value = MIX_PROFILE.compressor.release;
  revNode = buildReverb();
  dryGain.connect(comp); revNode.connect(revGain); revGain.connect(comp); comp.connect(masterGain); masterGain.connect(ctx.destination);
}

function buildReverb() {
  const cv = ctx.createConvolver(), len = ctx.sampleRate * 2.4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  cv.buffer = buf; return cv;
}

function mf(m) { return 440 * Math.pow(2, (m - 69) / 12); }

function fallbackPatternForStyle(style) {
  const spb = 1;
  switch (style) {
    case 'swing': return [[{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'hihat' }]];
    case 'rock': return [[{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'hihat' }], [{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare' }, { drum: 'hihat' }]];
    case 'funk': return [[{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5 }], [{ drum: 'snare' }, { drum: 'hihat', offset: 0.5 }]];
    case 'bossa': return [[{ drum: 'kick' }, { drum: 'rim' }], [{ drum: 'hihat', open: true }], [{ drum: 'kick' }, { drum: 'rim' }], [{ drum: 'hihat', open: true }]];
    case 'march': return [[{ drum: 'kick' }, { drum: 'snare', offset: 0.08 }], [{ drum: 'hihat' }], [{ drum: 'kick' }], [{ drum: 'snare' }, { drum: 'hihat' }]];
    case 'latin': return [[{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'rim' }], [{ drum: 'kick' }, { drum: 'rim', offset: 0.33 }], [{ drum: 'snare' }]];
    case 'gospel': return [[{ drum: 'kick' }, { drum: 'hihat' }], [{ drum: 'snare' }], [{ drum: 'kick' }, { drum: 'kick', offset: 0.5 }], [{ drum: 'snare' }]];
    case 'tango': return [[{ drum: 'kick' }, { drum: 'snare', offset: 0.04 }], [{ drum: 'rim' }], [{ drum: 'kick' }], [{ drum: 'rim' }]];
    default: return [[{ drum: 'kick' }], [{ drum: 'snare' }], [{ drum: 'kick' }], [{ drum: 'snare' }]];
  }
}

function getDrumVariationsForStyle(style) {
  return DRUM_STYLE_VARIATIONS[style] || DRUM_STYLE_VARIATIONS[DEFAULT_DRUM_STYLE];
}

function selectDrumVariation(style) {
  const variants = getDrumVariationsForStyle(style);
  currentDrumStyle = style;
  currentDrumVariation = variants[Math.floor(Math.random() * variants.length)] || variants[0];
  return currentDrumVariation;
}

window.selectDrumVariation = selectDrumVariation;

// INSTRUMENT ENGINES
function playNote(midi, t0, dur, vol, sound) {
  Sampler.playNote(sound, midi, t0, dur, vol);
}

function playChordAt(notes, t0, dur, sound, volScale = 1.0, withBass = false) {
  if (withBass) playNote(notes[0] - 12, t0, dur, 0.22 * volScale, sound);
  notes.forEach((n, i) => playNote(n, t0, dur, (i === 0 ? 0.54 : 0.46) * volScale, sound));
}

function scalePattern(pattern, spanBeats) {
  if (!pattern?.length) return [0];
  const scaled = [...new Set(pattern
    .map((offset) => Number(((offset / 4) * spanBeats).toFixed(2)))
    .filter((offset) => offset >= 0 && offset < spanBeats))];
  return scaled.length ? scaled : [0];
}

function currentSectionEnergy() {
  if (sezione === 'intro') return 0.84;
  if (sezione === 'rit') return window.currentThemeArrangement?.tensionLift || 1.14;
  return 1;
}

function playChordSegment(notes, t0, spb, spanBeats, sound, rhythmIdx, volScale = 1.0) {
  const basePattern = RHYTHM_PATTERNS[rhythmIdx % RHYTHM_PATTERNS.length];
  const offsets = scalePattern(basePattern, spanBeats);
  offsets.forEach((offset, hitIndex) => {
    const hitT = t0 + offset * spb;
    const nextOff = hitIndex + 1 < offsets.length ? offsets[hitIndex + 1] : spanBeats;
    const dur = Math.max(0.18, (nextOff - offset) * spb * 0.86);
    const isDown = offset === 0;
    playChordAt(notes, hitT, dur, sound, volScale * (isDown ? 1.0 : 0.8), false);
  });
}

// PERCUSSION
const DRUM_VOICES = {
  kick: { sample: 'kick', midi: 36, duration: 0.4, volume: 0.42 },
  snare: { sample: 'snare', midi: 48, duration: 0.22, volume: 0.28 },
  hihat: { sample: 'hihat', midi: 84, duration: 0.07, openDuration: 0.38, volume: 0.144 },
  rim: { sample: 'rim', midi: 76, duration: 0.05, volume: 0.3 }
};

function getDrumVoiceConfig(name, open = false) {
  const base = DRUM_VOICES[name];
  const kit = currentDrumVariation?.kit?.[name] || {};
  const duration = open ? (kit.openDuration || base.openDuration || base.duration) : (kit.duration || base.duration);
  return {
    sample: base.sample,
    midi: base.midi,
    duration,
    volume: base.volume * (kit.gain || 1),
    playbackRate: kit.playbackRate || 1,
    filterType: kit.filterType,
    filterFrequency: kit.filterFrequency,
    q: kit.q
  };
}

function playStyledDrum(name, t, { gain = 1, offset = 0, open = false } = {}) {
  const cfg = getDrumVoiceConfig(name, open);
  Sampler.playDrum(cfg.sample, cfg.midi, t + offset, cfg.duration, cfg.volume * gain, {
    playbackRate: cfg.playbackRate,
    filterType: cfg.filterType,
    filterFrequency: cfg.filterFrequency,
    q: cfg.q
  });
}

function kick(t, opts = {}) { playStyledDrum('kick', t, opts); }
function snare(t, opts = {}) { playStyledDrum('snare', t, opts); }
function hihat(t, opts = {}) { playStyledDrum('hihat', t, opts); }
function rim(t, opts = {}) { playStyledDrum('rim', t, opts); }
function metroClick(t, isOne) {
  const leadVol = isOne ? MIX_PROFILE.metronomeLead : MIX_PROFILE.metronomeGhost;
  Sampler.playDrum('rim', 76, t, 0.04, leadVol);
  if (isOne) Sampler.playDrum('rim', 76, t + 0.012, 0.03, MIX_PROFILE.metronomeGhost);
}
function clickSound(t, vol = 0.65) {
  Sampler.playDrum('rim', 76, t, 0.04, vol * 3.2);
}

function perc(beat, t, type) {
  const spb = 60 / bpm;
  const events = (currentDrumVariation?.pattern || fallbackPatternForStyle(type))[beat] || [];
  for (const event of events) {
    const hitTime = t + (event.offset || 0) * spb;
    const gain = event.gain || 1;
    const open = Boolean(event.open);
    if (event.drum === 'kick') kick(hitTime, { gain });
    else if (event.drum === 'snare') snare(hitTime, { gain });
    else if (event.drum === 'hihat') hihat(hitTime, { gain, open });
    else if (event.drum === 'rim') rim(hitTime, { gain });
  }
}

function playBass(rootMidi, t0, spb, patternIdx, spanBeats = 4, volScale = 1.0) {
  const pattern = BASS_PATTERNS[patternIdx % BASS_PATTERNS.length];
  const scaledPattern = pattern
    .map(([offset, semitones]) => [Number(((offset / 4) * spanBeats).toFixed(2)), semitones])
    .filter(([offset]) => offset >= 0 && offset < spanBeats);
  const hits = scaledPattern.length ? scaledPattern : [[0, -12]];

  hits.forEach(([offset, semitones]) => {
    const note = rootMidi + semitones;
    const hitT = t0 + offset * spb;
    const dur = Math.max(spb * 0.4, spanBeats * spb * 0.38);

    Sampler.playNote(window.currentBassSound || 'bass_electric', note, hitT, dur, 0.24 * volScale);
  });
}

function getBarPlan(theme, barIndex) {
  const arrangement = window.currentThemeArrangement;
  return arrangement?.barPlans?.[barIndex] || {
    rhythm: 'steady',
    bass: 'step',
    events: [{ chordIndex: barIndex, offset: 0, span: 4 }]
  };
}

function scheduler() {
  while (nextBeatTime < ctx.currentTime + LOOK_AHEAD) {
    scheduleBeat(totalBeats, nextBeatTime);
    nextBeatTime += 60 / bpm;
    totalBeats++;
  }
  schedTimer = setTimeout(scheduler, TICK_MS);
}

function scheduleBeat(beat, t) {
  const theme = THEMES[themeIdx], spb = 60 / bpm, bpc = 4;
  const cIdx = Math.floor(beat / bpc) % 4, bInC = beat % bpc;
  const sectionEnergy = currentSectionEnergy();
  perc(bInC, t, theme.perc);
  if (metronomeOn) metroClick(t, bInC === 0);
  if (bInC === 0) {
    const barPlan = getBarPlan(theme, cIdx);
    const primaryEvent = barPlan.events[0];
    const primaryChord = theme.ch[primaryEvent.chordIndex];
    if (!endingDone) {
      const bassEvents = (barPlan.bass === 'pedal' && barPlan.events.length > 1) ? [primaryEvent] : barPlan.events;
      bassEvents.forEach((event, eventIdx) => {
        const chord = theme.ch[event.chordIndex];
        playBass(chord.r + 12, t + event.offset * spb, spb, bassPatterns[cIdx], event.span, sectionEnergy * (eventIdx === 0 ? 1 : 0.92));
      });
    }
    if (!endingDone) {
      barPlan.events.forEach((event, eventIdx) => {
        const chord = theme.ch[event.chordIndex];
        const notes = bNotes(chord.r + 12, chord.t);
        playChordSegment(notes, t + event.offset * spb, spb, event.span, theme.sound, chordRhythms[cIdx], sectionEnergy * (eventIdx === 0 ? 1 : 0.94));
        schedUI(() => highlightChord(event.chordIndex), t + event.offset * spb);
      });
    }
    schedUI(() => highlightChord(primaryEvent.chordIndex), t);
  }
  schedUI(() => highlightBeat(bInC), t);
  if (beat === 0) schedUI(() => { introGiro = 1; setStruttura('intro'); }, t);
  if (beat === 16) schedUI(() => { introGiro = 2; updateProgressDisplay(); setStatus('🎵 Intro — giro 2 di 2', 'sec-intro'); }, t);
  if (beat === 32) schedUI(() => { sezCounter.strofa = 1; setStruttura('strofa'); }, t);
  if (beat > 32 && beat % 16 === 0) {
    schedUI(() => {
      if (sezione === 'strofa') {
        if (sezCounter.strofa < targets.strofa) {
          sezCounter.strofa++; updateStrutturaStatus(); updateProgressDisplay();
          if (sezCounter.strofa > targets.strofa) toggleSezioneMusicale();
        } else { toggleSezioneMusicale(); }
      } else if (sezione === 'rit') {
        if (sezCounter.rit < targets.rit) {
          sezCounter.rit++; updateStrutturaStatus(); updateProgressDisplay();
          if (sezCounter.rit > targets.rit) toggleSezioneMusicale();
        } else { toggleSezioneMusicale(); }
      }
    }, t);
  }
  if (endingArmed && !endingDone && cIdx === 3 && bInC === 3) {
    endingArmed = false; schedEnding(t + spb);
  }
}

function schedEnding(startT) {
  endingDone = true;
  clearTimeout(schedTimer); schedTimer = null;
  const theme = THEMES[themeIdx], spb = 60 / bpm;
  const cd = theme.ch[0], notes = bNotes(cd.r + 12, cd.t);
  masterGain.gain.cancelScheduledValues(startT - 0.04);
  masterGain.gain.setValueAtTime(masterGain.gain.value, startT - 0.04);
  masterGain.gain.linearRampToValueAtTime(0, startT - 0.001);
  masterGain.gain.setValueAtTime(Math.min(0.8, MIX_PROFILE.master), startT);
  playChordAt(notes, startT, spb * 0.9, theme.sound, 1.0, true);
  kick(startT);
  schedUI(() => { highlightChord(0); highlightBeat(0); }, startT);
  schedUI(() => { stopAll(true); setStatus('✨ fine — sipario!', ''); }, startT + spb * 1);
}
