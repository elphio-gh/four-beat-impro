/**
 * GESTIONE INTERFACCIA E STATO APPLICAZIONE
 * Gestisce l'interazione dell'utente, l'aggiornamento della UI e lo stato della performance.
 */

// STATE
let isPlaying = false, isCountingIn = false, endingArmed = false, endingDone = false, hasStartedPlayback = false;
let bpm = 120, themeIdx = 0, totalBeats = 0;
let metronomeOn = false;
let chordRhythms = [0, 0, 0, 0];
let bassPatterns = [0, 0, 0, 0];
let bassEngine = 0;

const MAIN_INSTRUMENT_LIST = ['grandpiano', 'elecpiano', 'brass', 'strings', 'honkytonk', 'marimba', 'nylonguitar', 'organ', 'accordion', 'vibraphone'];
const BRIGHT_MAIN_SOUNDS = ['grandpiano', 'elecpiano', 'brass', 'honkytonk', 'marimba'];
const WARM_MAIN_SOUNDS = ['grandpiano', 'elecpiano', 'nylonguitar', 'strings'];
const DRAMATIC_MAIN_SOUNDS = ['grandpiano', 'strings', 'organ', 'accordion', 'vibraphone'];
const MAIN_SOUND_ALIASES = {
  jazzpiano: 'vibraphone',
  pipeorgan: 'organ',
  strings: 'organ',
  synthpad: 'organ',
  brass: 'brass',
  strings: 'strings',
  nylonguitar: 'nylonguitar',
  distguitar: 'elecpiano',
  steelguitar: 'elecpiano',
  vibraphone: 'vibraphone',
  marimba: 'marimba',
  honkytonk: 'honkytonk',
  harpsichord: 'grandpiano'
};

const STYLE_LABELS = {
  swing: 'Swing',
  rock: 'Rock',
  funk: 'Funk',
  bossa: 'Bossa',
  march: 'Marcia',
  latin: 'Latin',
  gospel: 'Gospel',
  tango: 'Tango'
};

const COLOR_LABELS = {
  diatonico: 'Diatonico',
  tonale_esteso: 'Tonale esteso',
  minore_tonale: 'Minore tonale',
  modale_minore: 'Modale minore',
  prestito_modale: 'Prestito modale',
  cadenziale_jazz: 'Cadenziale jazz',
  blues: 'Blues',
  cromatico: 'Cromatico'
};

const THEME_QUEUE_KEY = 'themeQueue_v05i';
const THEME_RECENT_KEY = 'themeRecent_v05i';
const THEME_RECENT_FAMILY_KEY = 'themeRecentFamily_v05i';
const THEME_RECENT_SIGNATURE_KEY = 'themeRecentSignature_v05i';
const RECENT_THEME_WINDOW = 12;
const RECENT_FAMILY_WINDOW = 4;
const RECENT_SIGNATURE_WINDOW = 6;

const RHYTHM_GROUPS = {
  sparse: [0, 2],
  steady: [2, 4],
  push: [4, 5],
  busy: [4, 5, 6]
};

const BASS_PROFILE_GROUPS = {
  pedal: [0, 1],
  step: [1, 2],
  walk: [2, 3],
  ostinato: [1, 2],
  sync: [2, 3]
};

const FORM_VARIANTS = {
  balanced: { strofa: 4, rit: 4 },
  verseLead: { strofa: 5, rit: 3 },
  hookLift: { strofa: 3, rit: 4 },
  callResponse: { strofa: 3, rit: 3 },
  shortBurst: { strofa: 2, rit: 4 }
};

const ARRANGEMENT_TEMPLATES = [
  {
    id: 'wide_open',
    rhythmTag: 'sparse',
    form: 'balanced',
    bassProfile: 'pedal',
    tensionLift: 1.08,
    barPlans: [
      { rhythm: 'sparse', bass: 'pedal', events: [{ chordIndex: 0, offset: 0, span: 4 }] },
      { rhythm: 'sparse', bass: 'pedal', events: [{ chordIndex: 0, offset: 0, span: 4 }] },
      { rhythm: 'steady', bass: 'step', events: [{ chordIndex: 1, offset: 0, span: 4 }] },
      { rhythm: 'steady', bass: 'step', events: [{ chordIndex: 3, offset: 0, span: 4 }] }
    ]
  },
  {
    id: 'answer_back',
    rhythmTag: 'steady',
    form: 'callResponse',
    bassProfile: 'sync',
    tensionLift: 1.12,
    barPlans: [
      { rhythm: 'steady', bass: 'step', events: [{ chordIndex: 0, offset: 0, span: 4 }] },
      { rhythm: 'push', bass: 'sync', events: [{ chordIndex: 1, offset: 0, span: 4 }] },
      { rhythm: 'steady', bass: 'step', events: [{ chordIndex: 2, offset: 0, span: 4 }] },
      { rhythm: 'push', bass: 'sync', events: [{ chordIndex: 3, offset: 0, span: 4 }] }
    ]
  },
  {
    id: 'turnaround_push',
    rhythmTag: 'busy',
    form: 'hookLift',
    bassProfile: 'walk',
    tensionLift: 1.16,
    barPlans: [
      { rhythm: 'steady', bass: 'walk', events: [{ chordIndex: 0, offset: 0, span: 4 }] },
      { rhythm: 'push', bass: 'walk', events: [{ chordIndex: 1, offset: 0, span: 4 }] },
      { rhythm: 'busy', bass: 'walk', events: [{ chordIndex: 2, offset: 0, span: 4 }] },
      { rhythm: 'push', bass: 'walk', events: [{ chordIndex: 3, offset: 0, span: 4 }] }
    ]
  },
  {
    id: 'modal_pedal',
    rhythmTag: 'steady',
    form: 'verseLead',
    bassProfile: 'ostinato',
    tensionLift: 1.06,
    barPlans: [
      { rhythm: 'sparse', bass: 'pedal', events: [{ chordIndex: 0, offset: 0, span: 4 }] },
      { rhythm: 'steady', bass: 'ostinato', events: [{ chordIndex: 1, offset: 0, span: 4 }] },
      { rhythm: 'steady', bass: 'ostinato', events: [{ chordIndex: 2, offset: 0, span: 4 }] },
      { rhythm: 'push', bass: 'step', events: [{ chordIndex: 3, offset: 0, span: 4 }] }
    ]
  },
  {
    id: 'chorus_lift',
    rhythmTag: 'busy',
    form: 'shortBurst',
    bassProfile: 'sync',
    tensionLift: 1.2,
    barPlans: [
      { rhythm: 'push', bass: 'sync', events: [{ chordIndex: 0, offset: 0, span: 4 }] },
      { rhythm: 'steady', bass: 'step', events: [{ chordIndex: 1, offset: 0, span: 4 }] },
      { rhythm: 'push', bass: 'sync', events: [{ chordIndex: 2, offset: 0, span: 4 }] },
      { rhythm: 'busy', bass: 'sync', events: [{ chordIndex: 3, offset: 0, span: 4 }] }
    ]
  },
  {
    id: 'late_resolve',
    rhythmTag: 'steady',
    form: 'balanced',
    bassProfile: 'step',
    tensionLift: 1.1,
    barPlans: [
      { rhythm: 'sparse', bass: 'step', events: [{ chordIndex: 0, offset: 0, span: 4 }] },
      { rhythm: 'steady', bass: 'step', events: [{ chordIndex: 1, offset: 0, span: 4 }] },
      { rhythm: 'steady', bass: 'step', events: [{ chordIndex: 2, offset: 0, span: 4 }] },
      { rhythm: 'push', bass: 'sync', events: [{ chordIndex: 3, offset: 0, span: 4 }] }
    ]
  }
];

// Lista bassi mobile-first disponibili
const BASS_LIST = ['bass_electric', 'bass_acoustic', 'bass_fretless', 'bass_synth'];
const BASS_DISPLAY_NAMES = {
  'bass_electric': 'Electric Bass',
  'bass_acoustic': 'Acoustic Bass',
  'bass_fretless': 'Fretless Bass',
  'bass_synth': 'Synth Bass'
};
// Strumento basso corrente (usato da audio-engine.js tramite window.currentBassSound)
window.currentBassSound = 'bass_electric';
window.currentThemeArrangement = null;



let sezione = 'none';
let sezCounter = { strofa: 0, rit: 0 };
let introGiro = 0;
let targets = { strofa: 4, rit: 4 };

function bNotes(r, t) { return CHORD_INT[t].map(i => r + i); }
function cLabel(r, t) { const s = { maj: '', min: 'm', dom7: '7', maj7: 'maj7', min7: 'm7', sus4: 'sus4', sus2: 'sus2', maj6: '6', dim7: '°7', aug: '+', min6: 'm6' }; return NOTES[r % 12] + (s[t] ?? ''); }
function normalizeMainSound(sound) { return MAIN_INSTRUMENT_LIST.includes(sound) ? sound : (MAIN_SOUND_ALIASES[sound] || 'grandpiano'); }
function normalizeBassSound(sound) { return BASS_LIST.includes(sound) ? sound : 'bass_electric'; }
function randomFromList(list) { return list[Math.floor(Math.random() * list.length)]; }
function nextInList(list, current) {
  const idx = list.indexOf(current);
  if (idx === -1) return list[0];
  return list[(idx + 1) % list.length];
}

function randomFromPool(pool, fallbackLength) {
  const list = pool?.length ? pool : Array.from({ length: fallbackLength }, (_, idx) => idx);
  return randomFromList(list);
}

function pickBassSoundForProfile(profileName, style) {
  if (profileName === 'walk') return style === 'swing' || style === 'bossa' ? 'bass_acoustic' : 'bass_electric';
  if (profileName === 'ostinato') return style === 'latin' || style === 'tango' ? 'bass_fretless' : 'bass_electric';
  if (profileName === 'pedal') return style === 'bossa' || style === 'latin' ? 'bass_fretless' : 'bass_electric';
  if (profileName === 'sync') return 'bass_electric';
  return 'bass_electric';
}

function assignRhythms() {
  const plans = window.currentThemeArrangement?.barPlans || [];
  for (let i = 0; i < 4; i++) {
    const rhythmGroup = plans[i]?.rhythm || window.currentThemeArrangement?.rhythmTag || 'steady';
    chordRhythms[i] = randomFromPool(RHYTHM_GROUPS[rhythmGroup], RHYTHM_PATTERNS.length);
  }
}

function assignBassPatterns() {
  const plans = window.currentThemeArrangement?.barPlans || [];
  for (let i = 0; i < 4; i++) {
    const bassProfile = plans[i]?.bass || window.currentThemeArrangement?.bassProfile || 'step';
    bassPatterns[i] = randomFromPool(BASS_PROFILE_GROUPS[bassProfile], BASS_PATTERNS.length);
  }
  bassEngine = 0;
  refreshBassDisplay();
}

function refreshBassDisplay() {
  const el = document.getElementById('instrBassName');
  if (el) el.innerHTML = BASS_DISPLAY_NAMES[window.currentBassSound] || window.currentBassSound;
}

function originalPerc(theme) {
  if (!theme._sourcePerc) theme._sourcePerc = theme.perc;
  return theme._sourcePerc;
}

function shuffleList(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function themeHasFn(theme, token) {
  return theme.fn.some((fn) => fn.includes(token));
}

function countChordType(theme, type) {
  return theme.ch.filter((ch) => ch.t === type).length;
}

function isLowercaseMinorStart(theme) {
  return /^i/.test(theme.fn[0] || '');
}

function resolveOpeningType(theme) {
  const firstFn = theme.fn[0] || '';
  const firstChord = theme.ch[0]?.t || 'maj';
  if (firstChord === 'sus2' || firstChord === 'sus4') return 'suspended';
  if (firstChord === 'dom7' || /^V/.test(firstFn)) return 'dominant_launch';
  if (['min', 'min7', 'min6'].includes(firstChord) || isLowercaseMinorStart(theme)) return 'minor_launch';
  if (/^(ii|iii|vi|b)/.test(firstFn)) return 'deceptive_launch';
  return 'tonic_stable';
}

function computeBrightnessScore({ startsMinor, hasBorrowed, hasDim, hasAug, hasSus, hasBluesCadence, hasCircle, simpleDiatonic, domCount, opening, style }) {
  let score = 0;
  if (!startsMinor) score += 2;
  if (simpleDiatonic) score += 2;
  if (hasSus) score += 1;
  if (hasCircle) score += 1;
  if (hasBluesCadence) score += 1;
  if (domCount >= 2) score += 0.5;
  if (opening === 'tonic_stable' || opening === 'suspended') score += 1;
  if (style === 'rock' || style === 'gospel' || style === 'funk') score += 1;
  if (style === 'bossa' || style === 'latin') score += 0.5;
  if (hasBorrowed) score -= 1.5;
  if (startsMinor) score -= 2;
  if (hasDim || hasAug) score -= 1.5;
  if (style === 'tango' || style === 'march') score -= 1;
  return score;
}

function selectMainSoundForProfile(profile) {
  if (profile.energy === 'bright') return randomFromList(BRIGHT_MAIN_SOUNDS);
  if (profile.energy === 'lifted') return randomFromList(WARM_MAIN_SOUNDS);
  return randomFromList(DRAMATIC_MAIN_SOUNDS);
}

function resolveThemeProfile(theme) {
  if (theme._profile) return theme._profile;

  const lowerName = theme.name.toLowerCase();
  const sourcePerc = originalPerc(theme);
  const hasMaj7 = countChordType(theme, 'maj7') > 0;
  const hasMin7 = countChordType(theme, 'min7') > 0;
  const hasMin6 = countChordType(theme, 'min6') > 0;
  const hasDim = countChordType(theme, 'dim7') > 0;
  const hasAug = countChordType(theme, 'aug') > 0;
  const hasSus = countChordType(theme, 'sus2') > 0 || countChordType(theme, 'sus4') > 0;
  const domCount = countChordType(theme, 'dom7');
  const hasBorrowed = ['bII', 'bIII', 'bVI', 'bVII'].some((token) => themeHasFn(theme, token));
  const hasCircle = themeHasFn(theme, 'ii7') || themeHasFn(theme, 'V7') || themeHasFn(theme, 'III7') || themeHasFn(theme, 'VI7');
  const hasBluesCadence = themeHasFn(theme, 'I7') || themeHasFn(theme, 'IV7') || themeHasFn(theme, 'bVII7');
  const startsMinor = ['min', 'min7', 'min6'].includes(theme.ch[0].t) || isLowercaseMinorStart(theme);
  const simpleDiatonic = theme.fn.every((fn) => ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'V7', 'ii7', 'iii7', 'vi7', 'Imaj7'].includes(fn));

  let style;
  if (/(bossa|samba)/.test(lowerName) || sourcePerc === 'bossa') style = 'bossa';
  else if (/(rumba|cumbia|tarantella)/.test(lowerName) || sourcePerc === 'latin') style = 'latin';
  else if (/(tango|gypsy|frigio|flamenco)/.test(lowerName) || (startsMinor && hasBorrowed && !hasCircle)) style = 'tango';
  else if (/(gospel)/.test(lowerName) || sourcePerc === 'gospel') style = 'gospel';
  else if (/(motown|soul|funk|anthem)/.test(lowerName) || (sourcePerc === 'funk' && (hasBluesCadence || hasMin7))) style = 'funk';
  else if (/(circo|polka|valzer|barocco)/.test(lowerName) || sourcePerc === 'march' || hasDim || hasAug) style = 'march';
  else if (hasCircle || hasMaj7 || hasMin7) style = 'swing';
  else if (/(rock)/.test(lowerName) || sourcePerc === 'rock') style = 'rock';
  else style = 'rock';

  let color;
  if (hasBluesCadence && domCount >= 2) color = 'blues';
  else if (hasDim || hasAug) color = 'cromatico';
  else if (hasCircle && (hasMaj7 || hasMin7 || domCount > 0)) color = 'cadenziale_jazz';
  else if (startsMinor && hasBorrowed) color = 'modale_minore';
  else if (hasBorrowed) color = 'prestito_modale';
  else if (startsMinor || hasMin6) color = 'minore_tonale';
  else if (simpleDiatonic || hasSus) color = 'diatonico';
  else color = 'tonale_esteso';

  let family;
  if (hasBluesCadence && domCount >= 2) family = 'dominant_blues';
  else if (hasCircle && (hasMaj7 || hasMin7)) family = 'jazz_turnaround';
  else if (startsMinor && themeHasFn(theme, 'bII')) family = 'minor_phrygian';
  else if (startsMinor && hasBorrowed) family = 'minor_cinematic';
  else if (hasBorrowed) family = 'borrowed_major';
  else if (hasDim || hasAug) family = 'chromatic_theatre';
  else if (hasSus) family = 'suspended_pop';
  else if (simpleDiatonic && themeHasFn(theme, 'vi')) family = 'pop_loop';
  else if (simpleDiatonic) family = 'plain_major';
  else family = 'extended_tonal';

  const opening = resolveOpeningType(theme);
  const brightness = computeBrightnessScore({
    startsMinor,
    hasBorrowed,
    hasDim,
    hasAug,
    hasSus,
    hasBluesCadence,
    hasCircle,
    simpleDiatonic,
    domCount,
    opening,
    style
  });
  const energy = brightness >= 2.5 ? 'bright' : (brightness >= 0.5 ? 'lifted' : 'dramatic');

  theme._profile = { style, color, family, opening, brightness, energy };
  return theme._profile;
}

function applyThemeProfile(theme) {
  const profile = resolveThemeProfile(theme);
  theme.perc = profile.style;
  theme.lg = profile.color;
  return profile;
}

function buildThemeQueue() {
  const buckets = {};
  THEMES.forEach((theme, index) => {
    const { style, family, energy } = resolveThemeProfile(theme);
    const bucketKey = `${energy}::${family}::${style}`;
    if (!buckets[bucketKey]) buckets[bucketKey] = [];
    buckets[bucketKey].push(index);
  });

  const bucketKeys = shuffleList(Object.keys(buckets)).sort((a, b) => {
    const rank = { bright: 0, lifted: 1, dramatic: 2 };
    return (rank[a.split('::')[0]] ?? 99) - (rank[b.split('::')[0]] ?? 99);
  });
  bucketKeys.forEach((bucketKey) => {
    buckets[bucketKey] = shuffleList(buckets[bucketKey]);
  });

  const queue = [];
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const bucketKey of bucketKeys) {
      if (buckets[bucketKey].length) {
        queue.push(buckets[bucketKey].shift());
        remaining = true;
      }
    }
  }
  return queue;
}

function readStoredList(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {}
}

function arrangementSignature(profile, arrangement) {
  return [profile.style, profile.family, profile.opening, arrangement.id, arrangement.rhythmTag, arrangement.bassProfile].join('|');
}

function chooseArrangementTemplate(profile) {
  const recentSignatures = readStoredList(THEME_RECENT_SIGNATURE_KEY).filter((value) => typeof value === 'string');
  let candidates = ARRANGEMENT_TEMPLATES.filter((template) => {
    if (profile.family === 'jazz_turnaround') return ['turnaround_push', 'late_resolve', 'chorus_lift'].includes(template.id);
    if (profile.family === 'dominant_blues') return ['answer_back', 'chorus_lift', 'wide_open'].includes(template.id);
    if (profile.family === 'minor_phrygian' || profile.family === 'minor_cinematic') return ['answer_back', 'chorus_lift', 'late_resolve'].includes(template.id);
    if (profile.family === 'plain_major' || profile.family === 'pop_loop' || profile.family === 'suspended_pop') return ['wide_open', 'answer_back', 'chorus_lift'].includes(template.id);
    if (profile.family === 'chromatic_theatre') return ['answer_back', 'chorus_lift', 'late_resolve'].includes(template.id);
    return true;
  });

  if (profile.opening === 'dominant_launch') {
    candidates = candidates.filter((template) => template.id !== 'wide_open');
  } else if (profile.opening === 'suspended') {
    candidates = candidates.filter((template) => template.id !== 'turnaround_push');
  }

  if (profile.energy === 'bright') {
    candidates = candidates.filter((template) => ['wide_open', 'answer_back', 'chorus_lift', 'turnaround_push'].includes(template.id));
  } else if (profile.energy === 'dramatic') {
    candidates = candidates.filter((template) => template.id !== 'modal_pedal');
  }

  const fresh = candidates.filter((template) => !recentSignatures.includes(arrangementSignature(profile, template)));
  return randomFromList((fresh.length ? fresh : candidates.length ? candidates : ARRANGEMENT_TEMPLATES));
}

function buildThemeArrangement(theme) {
  const profile = resolveThemeProfile(theme);
  const template = chooseArrangementTemplate(profile);
  const arrangement = {
    ...template,
    opening: profile.opening,
    style: profile.style,
    family: profile.family,
    color: profile.color
  };

  const signature = arrangementSignature(profile, arrangement);
  const recentSignatures = readStoredList(THEME_RECENT_SIGNATURE_KEY).filter((value) => typeof value === 'string');
  writeStoredList(
    THEME_RECENT_SIGNATURE_KEY,
    [signature, ...recentSignatures.filter((value) => value !== signature)].slice(0, RECENT_SIGNATURE_WINDOW)
  );
  return arrangement;
}

function applyThemeArrangement(theme, { preserveBass = false } = {}) {
  const arrangement = buildThemeArrangement(theme);
  window.currentThemeArrangement = arrangement;
  targets = { ...(FORM_VARIANTS[arrangement.form] || FORM_VARIANTS.balanced) };
  if (!preserveBass) {
    window.currentBassSound = pickBassSoundForProfile(arrangement.bassProfile, theme.perc);
  }
  return arrangement;
}

function pickNextThemeIndex() {
  let queue = readStoredList(THEME_QUEUE_KEY).filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < THEMES.length);
  const recent = readStoredList(THEME_RECENT_KEY).filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < THEMES.length);
  const recentFamilies = readStoredList(THEME_RECENT_FAMILY_KEY).filter((family) => typeof family === 'string');

  if (!queue.length) queue = buildThemeQueue();

  let pickAt = queue.findIndex((idx) => {
    if (recent.includes(idx)) return false;
    const { family, energy } = resolveThemeProfile(THEMES[idx]);
    return energy !== 'dramatic' && !recentFamilies.includes(family);
  });
  if (pickAt === -1) {
    pickAt = queue.findIndex((idx) => {
      if (recent.includes(idx)) return false;
      const { family } = resolveThemeProfile(THEMES[idx]);
      return !recentFamilies.includes(family);
    });
  }
  if (pickAt === -1) {
    pickAt = queue.findIndex((idx) => !recent.includes(idx));
  }
  if (pickAt === -1) pickAt = 0;

  const [nextIdx] = queue.splice(pickAt, 1);
  const nextRecent = [nextIdx, ...recent.filter((idx) => idx !== nextIdx)].slice(0, RECENT_THEME_WINDOW);
  const nextFamily = resolveThemeProfile(THEMES[nextIdx]).family;
  const nextRecentFamilies = [nextFamily, ...recentFamilies.filter((family) => family !== nextFamily)].slice(0, RECENT_FAMILY_WINDOW);

  writeStoredList(THEME_QUEUE_KEY, queue);
  writeStoredList(THEME_RECENT_KEY, nextRecent);
  writeStoredList(THEME_RECENT_FAMILY_KEY, nextRecentFamilies);
  return nextIdx;
}

function getThemeSound(theme = THEMES[themeIdx]) {
  return normalizeMainSound(theme?.sound || 'grandpiano');
}

function refreshThemeMeta() {
  const theme = THEMES[themeIdx];
  const styleEl = document.getElementById('styleText');
  const moodEl = document.getElementById('moodText');
  if (styleEl) styleEl.textContent = STYLE_LABELS[theme.perc] || 'Libero';
  if (moodEl) moodEl.textContent = COLOR_LABELS[theme.lg] || theme.lg || 'Aperto';
}

// COUNT-IN
function doCountIn(onDone) {
  isCountingIn = true;
  const spb = 60 / bpm, startT = ctx.currentTime + 0.12;
  for (let i = 0; i < 4; i++) clickSound(startT + i * spb, i === 0 ? 0.95 : 0.6);
  for (let i = 1; i <= 4; i++) {
    const beat = i;
    schedUI(() => {
      for (let j = 1; j <= 4; j++) document.getElementById('cb' + j).classList.remove('active', 'count-in-active');
      document.getElementById('cb' + beat).classList.add('count-in-active');
    }, startT + (i - 1) * spb);
  }
  schedUI(() => {
    for (let j = 1; j <= 4; j++) document.getElementById('cb' + j).classList.remove('active', 'count-in-active');
    isCountingIn = false;
    onDone(startT + 4 * spb);
  }, startT + 4 * spb);
}

let countInTimers = [];
function schedUI(fn, audioTime) { 
  const d = (audioTime - ctx.currentTime) * 1000; 
  countInTimers.push(setTimeout(fn, Math.max(0, d))); 
}

// UI UPDATES
function highlightChord(idx) {
  for (let i = 0; i < 4; i++) document.getElementById('cc' + i).classList.remove('active');
  document.getElementById('cc' + idx)?.classList.add('active');
}
function highlightBeat(b) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('cb' + i);
    el.classList.remove('active', 'count-in-active');
    if (i === b + 1) el.classList.add('active');
  }
}

function refreshChordDisplay() {
  const t = THEMES[themeIdx];
  const sound = getThemeSound(t);
  document.getElementById('chordDisplay').className = 'chord-display';

  const isHD = Sampler.instruments[sound];

  for (let i = 0; i < 4; i++) {
    const card = document.getElementById('cc' + i);
    card.classList.remove('hidden');
    const cd = t.ch[i];
    document.getElementById('cnum' + i).textContent = t.fn[i] || ('Acc ' + (i + 1));
    document.getElementById('cname' + i).textContent = cLabel(cd.r, cd.t);
  }
  const icons = { grandpiano: '🎹', jazzpiano: '🎹', elecpiano: '🎹', organ: '⛪', pipeorgan: '⛩️', accordion: '🪗', strings: '🎻', brass: '🎺', nylonguitar: '🎸', distguitar: '⚡', steelguitar: '🤠', honkytonk: '🎹', synthpad: '🤖', vibraphone: '🔔', harpsichord: '🎼', marimba: '🌺' };
  document.getElementById('instrIcon').textContent = icons[sound] || '🎹';
  document.getElementById('instrName').innerHTML = (SOUND_NAMES[sound] || sound);
  refreshThemeMeta();
}

// Callback quando uno strumento HD finisce di caricare
window.onInstrumentLoaded = function(name) {
  refreshChordDisplay();
  refreshBassDisplay();
};

function selectTheme(i, keepLoc = false) {
  themeIdx = i;
  const profile = applyThemeProfile(THEMES[i]);
  applyThemeArrangement(THEMES[i], { preserveBass: false });
  assignRhythms();
  assignBassPatterns();
  THEMES[i].sound = selectMainSoundForProfile(profile);
  window.currentBassSound = normalizeBassSound(window.currentBassSound);
  if (window.selectDrumVariation) window.selectDrumVariation(THEMES[i].perc);
  bpm = THEMES[i].tempo;
  document.getElementById('tempoSlider').value = bpm;
  document.getElementById('tempoVal').textContent = bpm;
  
  // Se l'audio e' gia' inizializzato, carica i campioni
  if (ctx) {
    Sampler.loadInstrument(THEMES[i].sound);
    Sampler.loadInstrument(window.currentBassSound);
    Sampler.loadDrums();
  }

  refreshChordDisplay();
  if (!keepLoc) newLocationForTheme(i);
  if (isPlaying) totalBeats = 0;
}

function newLocationForTheme(i) {
  const el = document.getElementById('locText'); if (!el) return;
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  el.textContent = ALL_LOC[Math.floor(Math.random() * ALL_LOC.length)];
}

function newLocation() {
  const el = document.getElementById('locText');
  el.classList.remove('flash'); void el.offsetWidth;
  el.textContent = ALL_LOC[Math.floor(Math.random() * ALL_LOC.length)];
  el.classList.add('flash');
}

function doFullRandom() {
  const btn = document.getElementById('btnRandom');
  btn.classList.remove('flash'); void btn.offsetWidth; btn.classList.add('flash');
  if (isPlaying || isCountingIn) stopAll(true);
  const i = pickNextThemeIndex();
  selectTheme(i, false);
  refreshBassDisplay();
  const profile = resolveThemeProfile(THEMES[i]);
  const baseTempo = profile.energy === 'bright' ? 118 : (profile.energy === 'lifted' ? 112 : 106);
  const nb = Math.round(baseTempo + (Math.random() - 0.5) * 18);
  setTempo(Math.max(92, Math.min(132, nb)));
  document.getElementById('tempoSlider').value = bpm;
}

// STRUTTURA
function updateProgressDisplay() {
  const introActive = sezione === 'intro';
  document.getElementById('pbIntro').className = 'progress-block' + (introActive ? ' active-intro' : '');
  document.getElementById('pvIntro').textContent = introActive ? (introGiro + ' / 2') : (sezione === 'none' ? '—' : '✓');
  document.getElementById('prIntro').textContent = introActive ? (introGiro < 2 ? 'manca ancora' : 'ultimo giro') : '';

  const sCur = sezCounter.strofa, sTarget = targets.strofa;
  const sRemain = Math.max(0, sTarget - sCur);
  document.getElementById('pvStrofa').textContent = sezione === 'none' || sezione === 'intro' ? '—' : `${sCur} / ${sTarget}`;
  document.getElementById('prStrofa').textContent = sezione !== 'none' && sezione !== 'intro' ? (sRemain > 0 ? `mancano ${sRemain}` : '✓ completate') : '';
  document.getElementById('pbStrofa').className = 'progress-block' + (sezione === 'strofa' ? ' active-strofa' : '');

  const rCur = sezCounter.rit, rTarget = targets.rit;
  const rRemain = Math.max(0, rTarget - rCur);
  document.getElementById('pvRit').textContent = sezione === 'none' || sezione === 'intro' ? '—' : `${rCur} / ${rTarget}`;
  document.getElementById('prRit').textContent = sezione !== 'none' && sezione !== 'intro' ? (rRemain > 0 ? `mancano ${rRemain}` : '✓ completati') : '';
  document.getElementById('pbRit').className = 'progress-block' + (sezione === 'rit' ? ' active-rit' : '');
}

function setStruttura(s) {
  sezione = s;
  document.body.classList.remove('sec-intro', 'sec-strofa', 'sec-rit');
  if (s !== 'none') document.body.classList.add('sec-' + s);
  updateStrutturaStatus();
  updateProgressDisplay();
}

function updateStrutturaStatus() {
  const sCur = sezCounter.strofa, sTarget = targets.strofa;
  const rCur = sezCounter.rit, rTarget = targets.rit;
  if (sezione === 'intro') setStatus('🎵 intro — 2 giri vuoti', 'sec-intro');
  else if (sezione === 'strofa') setStatus(`🎤 Strofa ${sCur} di ${sTarget}  ·  rit: ${rCur}/${rTarget}`, 'sec-strofa');
  else if (sezione === 'rit') setStatus(`✨ Ritornello ${rCur} di ${rTarget}  ·  strofe: ${sCur}/${sTarget}`, 'sec-rit');
}

function resetStruttura() {
  sezione = 'none'; sezCounter = { strofa: 0, rit: 0 }; introGiro = 0;
  targets = { ...(FORM_VARIANTS[window.currentThemeArrangement?.form] || FORM_VARIANTS.balanced) };
  document.body.classList.remove('sec-intro', 'sec-strofa', 'sec-rit');
  document.getElementById('pvIntro').textContent = '—';
  document.getElementById('prIntro').textContent = '';
  document.getElementById('pvStrofa').textContent = '—';
  document.getElementById('pvRit').textContent = '—';
  document.getElementById('prStrofa').textContent = '';
  document.getElementById('prRit').textContent = '';
}

function toggleSezioneMusicale() {
  if (sezione === 'strofa') { sezCounter.rit = 1; setStruttura('rit'); }
  else if (sezione === 'rit') { sezCounter.strofa = 1; setStruttura('strofa'); }
}

// Cambia solo lo strumento principale (accordi), indipendente dal basso
// Mostra "caricamento..." durante il download del pack audio leggero
async function randomMainInstrument() {
  const cur = getThemeSound(THEMES[themeIdx]);
  const next = nextInList(MAIN_INSTRUMENT_LIST, cur);
  THEMES[themeIdx].sound = next;

  const nameEl = document.getElementById('instrName');
  const btnEl = document.getElementById('btnRndMain');
  if (btnEl) btnEl.disabled = true;
  if (nameEl) nameEl.innerHTML = '⌛ caricamento...';

  if (ctx) await Sampler.loadInstrument(next);

  if (btnEl) btnEl.disabled = false;
  refreshChordDisplay();
}

// Cambia solo il basso, indipendente dallo strumento principale
// Mostra "caricamento..." durante il download del pack audio leggero
async function randomBassInstrument() {
  const cur = window.currentBassSound;
  const next = nextInList(BASS_LIST, cur);
  window.currentBassSound = next;

  const nameEl = document.getElementById('instrBassName');
  const btnEl = document.getElementById('btnRndBass');
  if (btnEl) btnEl.disabled = true;
  if (nameEl) nameEl.innerHTML = '⌛ caricamento...';

  if (ctx) await Sampler.loadInstrument(next);

  if (btnEl) btnEl.disabled = false;
  refreshBassDisplay();
}

// Legacy: cambia entrambi (usato internamente da doFullRandom)
function randomInstrument() {
  randomMainInstrument();
  randomBassInstrument();
}

function randomWeightedSound() {
  return nextInList(MAIN_INSTRUMENT_LIST, getThemeSound(THEMES[themeIdx]));
}



function toggleMetronome() {
  metronomeOn = !metronomeOn;
  const btn = document.getElementById('metroBtn');
  btn.classList.toggle('on', metronomeOn);
  btn.textContent = metronomeOn ? 'metronomo ON' : 'metronomo OFF';
}

function setTempo(v) { bpm = v; document.getElementById('tempoVal').textContent = v; }
function setStatus(txt, cls) { const s = document.getElementById('statusBar'); s.textContent = txt; s.className = 'status-bar' + (cls ? ' ' + cls : ''); }

async function togglePlay() {
  if (isCountingIn) return;
  initAudio(); // Inizializza AudioContext al primo tocco
  
  if (isPlaying) {
    clearTimeout(schedTimer); schedTimer = null;
    ctx.suspend();
    isPlaying = false;
    document.getElementById('btnPlay').textContent = '▶ Play';
    document.getElementById('btnPlay').classList.remove('on');
    setStatus('⏸ in pausa', '');
  } else {
    if (ctx && ctx.state === 'suspended' && hasStartedPlayback) {
      await ctx.resume();
      isPlaying = true;
      document.getElementById('btnPlay').textContent = '⏸ Pausa';
      document.getElementById('btnPlay').classList.add('on');
      nextBeatTime = ctx.currentTime + 0.05;
      schedTimer = setTimeout(scheduler, TICK_MS);
      setStatus('▶ ripresa', '');
    } else {
      await startPlay();
    }
  }
}

async function startPlay() {
  initAudio();
  if (ctx.state === 'suspended') await ctx.resume();
  
  document.getElementById('btnPlay').disabled = true;
  setStatus('caricamento set audio...', '');

  await Sampler.loadStartupPreset(THEMES[themeIdx].sound, window.currentBassSound);

  setStatus('1 ... 2 ... 3 ... 4 ...', '');
  resetStruttura();
  assignRhythms();
  assignBassPatterns();
  
  doCountIn((musicStartT) => {
    isPlaying = true; hasStartedPlayback = true; endingArmed = false; endingDone = false;
    totalBeats = 0; nextBeatTime = musicStartT;
    document.getElementById('btnPlay').textContent = '⏸ Pausa';
    document.getElementById('btnPlay').classList.add('on');
    document.getElementById('btnPlay').disabled = false;
    document.getElementById('btnEnding').disabled = false;
    setStatus('♪ in scena — suona!', 'on');
    scheduler();
  });
}

function stopAll(silent = false) {
  clearTimeout(schedTimer); schedTimer = null;
  if (countInTimers) { countInTimers.forEach(t => clearTimeout(t)); countInTimers = []; }
  isPlaying = false; isCountingIn = false; hasStartedPlayback = false; endingArmed = false; endingDone = false;
  resetStruttura();
  for (let i = 1; i <= 4; i++) document.getElementById('cb' + i).classList.remove('active', 'count-in-active');
  document.getElementById('btnPlay').textContent = '▶ Play';
  document.getElementById('btnPlay').classList.remove('on');
  document.getElementById('btnPlay').disabled = false;
  document.getElementById('btnEnding').classList.remove('armed');
  document.getElementById('btnEnding').disabled = true;
  for (let i = 0; i < 4; i++) document.getElementById('cc' + i).classList.remove('active');
  if (!silent) setStatus('premi Play per iniziare', '');
}

function armEnding() { if (!isPlaying || endingDone) return; endingArmed = true; document.getElementById('btnEnding').classList.add('armed'); setStatus('🎬 Alessandro sa che stai finendo — completa il giro…', 'end'); }

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { document.getElementById('curtL').classList.add('open'); document.getElementById('curtR').classList.add('open'); }, 150);
  const i = pickNextThemeIndex();
  themeIdx = i;
  const profile = applyThemeProfile(THEMES[i]);
  applyThemeArrangement(THEMES[i], { preserveBass: false });
  THEMES[i].sound = selectMainSoundForProfile(profile);
  if (window.selectDrumVariation) window.selectDrumVariation(THEMES[i].perc);
  bassEngine = 0;
  const baseTempo = profile.energy === 'bright' ? 118 : (profile.energy === 'lifted' ? 112 : 106);
  bpm = Math.round(Math.max(92, Math.min(132, baseTempo + (Math.random() - 0.5) * 18)));
  document.getElementById('tempoSlider').value = bpm;
  document.getElementById('tempoVal').textContent = bpm;
  refreshChordDisplay(); newLocationForTheme(i); refreshBassDisplay();
});
