/**
 * DATABASE MUSICALE
 * Contiene note, accordi, progressioni, strumenti e pattern ritmici.
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
  grandpiano: 'Grand Piano',
  jazzpiano: 'Jazz Piano',
  elecpiano: 'Rhodes',
  organ: 'Hammond Organ',
  pipeorgan: 'Pipe Organ',
  accordion: 'Fisarmonica',
  strings: 'Archi',
  brass: 'Ottoni',
  nylonguitar: 'Chitarra Classica',
  distguitar: 'Chitarra Elettrica',
  steelguitar: 'Steel Guitar',
  honkytonk: 'Honky-Tonk Piano',
  synthpad: 'Synth Pad',
  vibraphone: 'Vibrafono',
  harpsichord: 'Clavicembalo',
  marimba: 'Marimba'
};

const THEMES = [
  // ── POP/BROADWAY classici ─────────────────────────────
  { name: "I - IV - V - I", emoji: "🎹", tempo: 120, perc: "swing", sound: "grandpiano", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'IV', 'V', 'I'], lg: 'teatro' },
  { name: "I - vi - IV - V", emoji: "🌟", tempo: 118, perc: "rock", sound: "grandpiano", ch: [{ r: 60, t: 'maj' }, { r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['I', 'vi', 'IV', 'V'], lg: 'teatro' },
  { name: "I - V - vi - IV", emoji: "✨", tempo: 116, perc: "swing", sound: "grandpiano", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'maj' }, { r: 69, t: 'min' }, { r: 65, t: 'maj' }], fn: ['I', 'V', 'vi', 'IV'], lg: 'magico' },
  { name: "I - IV - I - V7", emoji: "⛪", tempo: 110, perc: "gospel", sound: "organ", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'IV', 'I', 'V7'], lg: 'sacro' },
  { name: "I - ii - V - I", emoji: "🎷", tempo: 124, perc: "swing", sound: "jazzpiano", ch: [{ r: 60, t: 'maj' }, { r: 62, t: 'min' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj' }], fn: ['I', 'ii', 'V7', 'I'], lg: 'locale' },

  // ── JAZZ ii-V-I e variazioni ──────────────────────────
  { name: "ii7 - V7 - Imaj7 - IVmaj7", emoji: "🎷", tempo: 140, perc: "swing", sound: "jazzpiano", ch: [{ r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj7' }, { r: 65, t: 'maj7' }], fn: ['ii7', 'V7', 'Imaj7', 'IVmaj7'], lg: 'locale' },
  { name: "i7 - IV7 - I7 - V7", emoji: "🎺", tempo: 148, perc: "swing", sound: "brass", ch: [{ r: 65, t: 'dom7' }, { r: 70, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 67, t: 'dom7' }], fn: ['IV7', 'bVII7', 'IV7', 'V7'], lg: 'locale' },
  { name: "Imaj7 - vi7 - ii7 - V7", emoji: "🔔", tempo: 112, perc: "swing", sound: "vibraphone", ch: [{ r: 60, t: 'maj7' }, { r: 69, t: 'min7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['Imaj7', 'vi7', 'ii7', 'V7'], lg: 'locale' },
  { name: "III7 - VI7 - II7 - V7", emoji: "🎩", tempo: 152, perc: "swing", sound: "jazzpiano", ch: [{ r: 64, t: 'dom7' }, { r: 69, t: 'dom7' }, { r: 62, t: 'dom7' }, { r: 67, t: 'dom7' }], fn: ['III7', 'VI7', 'II7', 'V7'], lg: 'storico' },
  { name: "i - iv7 - V7 - bIII", emoji: "🥐", tempo: 104, perc: "bossa", sound: "accordion", ch: [{ r: 69, t: 'min' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj7' }], fn: ['i', 'iv7', 'V7', 'bIII'], lg: 'storico' },
  { name: "Imaj7 - ii7 - V7 - Imaj7", emoji: "🎵", tempo: 108, perc: "bossa", sound: "jazzpiano", ch: [{ r: 60, t: 'maj7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj7' }], fn: ['Imaj7', 'ii7', 'V7', 'Imaj7'], lg: 'locale' },

  // ── BLUES e derivati ──────────────────────────────────
  { name: "I7 - IV7 - I7 - V7", emoji: "🎸", tempo: 128, perc: "swing", sound: "honkytonk", ch: [{ r: 60, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 60, t: 'dom7' }, { r: 67, t: 'dom7' }], fn: ['I7', 'IV7', 'I7', 'V7'], lg: 'locale' },
  { name: "IV7 - bVII7 - IV7 - I7", emoji: "🎹", tempo: 144, perc: "swing", sound: "honkytonk", ch: [{ r: 65, t: 'dom7' }, { r: 70, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 60, t: 'dom7' }], fn: ['IV7', 'bVII7', 'IV7', 'I7'], lg: 'storico' },
  { name: "I7 - IV7 - V7 - IV7", emoji: "🕺", tempo: 112, perc: "funk", sound: "elecpiano", ch: [{ r: 60, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 67, t: 'dom7' }, { r: 65, t: 'dom7' }], fn: ['I7', 'IV7', 'V7', 'IV7'], lg: 'locale' },
  { name: "I7 - bVII7 - IV7 - I7", emoji: "⚡", tempo: 136, perc: "rock", sound: "distguitar", ch: [{ r: 60, t: 'dom7' }, { r: 70, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 60, t: 'dom7' }], fn: ['I7', 'bVII7', 'IV7', 'I7'], lg: 'locale' },

  // ── ACCORDI PRESTATI (borrowed) ───────────────────────
  { name: "I - bVI - bVII - I", emoji: "🏆", tempo: 120, perc: "march", sound: "brass", ch: [{ r: 60, t: 'maj' }, { r: 68, t: 'maj' }, { r: 70, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'bVI', 'bVII', 'I'], lg: 'storico' },
  { name: "I - bVI - IV - V", emoji: "🚀", tempo: 112, perc: "march", sound: "strings", ch: [{ r: 60, t: 'maj' }, { r: 68, t: 'maj' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['I', 'bVI', 'IV', 'V'], lg: 'fantascientifico' },
  { name: "i - bVI - bVII - i", emoji: "💃", tempo: 130, perc: "tango", sound: "accordion", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 69, t: 'min' }], fn: ['i', 'bVI', 'bVII', 'i'], lg: 'esotico' },
  { name: "I - bIII - IV - I", emoji: "📼", tempo: 128, perc: "rock", sound: "distguitar", ch: [{ r: 60, t: 'maj' }, { r: 63, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'bIII', 'IV', 'I'], lg: 'storico' },
  { name: "i - bVII - bVI - V", emoji: "🪄", tempo: 124, perc: "tango", sound: "accordion", ch: [{ r: 69, t: 'min' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }, { r: 64, t: 'dom7' }], fn: ['i', 'bVII', 'bVI', 'V'], lg: 'storico' },
  { name: "I - bVII - IV - I", emoji: "🍀", tempo: 152, perc: "march", sound: "nylonguitar", ch: [{ r: 60, t: 'maj' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'bVII', 'IV', 'I'], lg: 'esotico' },

  // ── CADENZE MODALI ────────────────────────────────────
  { name: "i - iv - V7 - i (minore)", emoji: "🔥", tempo: 120, perc: "tango", sound: "nylonguitar", ch: [{ r: 69, t: 'min' }, { r: 62, t: 'min' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }], fn: ['i', 'iv', 'V7', 'i'], lg: 'esotico' },
  { name: "i - VII - VI - V (Frigio)", emoji: "🏛️", tempo: 116, perc: "tango", sound: "nylonguitar", ch: [{ r: 69, t: 'min' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }, { r: 64, t: 'maj' }], fn: ['i', 'VII', 'VI', 'V'], lg: 'esotico' },
  { name: "I - II - IV - I (Lidio)", emoji: "🌌", tempo: 108, perc: "rock", sound: "synthpad", ch: [{ r: 60, t: 'maj' }, { r: 62, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'II', 'IV', 'I'], lg: 'fantascientifico' },
  { name: "I - VII - vi - V (Misolidio)", emoji: "🎸", tempo: 132, perc: "rock", sound: "distguitar", ch: [{ r: 60, t: 'maj' }, { r: 70, t: 'maj' }, { r: 69, t: 'min' }, { r: 67, t: 'maj' }], fn: ['I', 'bVII', 'vi', 'V'], lg: 'locale' },
  { name: "i - bII - V - i (Frigio flamenco)", emoji: "🌹", tempo: 120, perc: "tango", sound: "nylonguitar", ch: [{ r: 69, t: 'min' }, { r: 70, t: 'maj' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }], fn: ['i', 'bII', 'V7', 'i'], lg: 'esotico' },

  // ── PROGRESSIONI CROMATICHE ───────────────────────────
  { name: "I - #Idim7 - ii - V", emoji: "🎼", tempo: 138, perc: "march", sound: "harpsichord", ch: [{ r: 60, t: 'maj' }, { r: 61, t: 'dim7' }, { r: 62, t: 'min' }, { r: 67, t: 'dom7' }], fn: ['I', '#Idim', 'ii', 'V7'], lg: 'storico' },
  { name: "I - III7 - IV - V7", emoji: "🎠", tempo: 144, perc: "march", sound: "honkytonk", ch: [{ r: 60, t: 'maj' }, { r: 64, t: 'dom7' }, { r: 65, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'III7', 'IV', 'V7'], lg: 'magico' },
  { name: "I - I7 - IV - #IVdim7", emoji: "🕵️", tempo: 112, perc: "swing", sound: "jazzpiano", ch: [{ r: 60, t: 'maj' }, { r: 60, t: 'dom7' }, { r: 65, t: 'maj' }, { r: 66, t: 'dim7' }], fn: ['I', 'I7', 'IV', '#IVdim'], lg: 'locale' },
  { name: "i - #idim - ii°- V7", emoji: "🎻", tempo: 152, perc: "march", sound: "strings", ch: [{ r: 69, t: 'min' }, { r: 70, t: 'dim7' }, { r: 71, t: 'dim7' }, { r: 64, t: 'dom7' }], fn: ['i', '#i°', 'ii°', 'V7'], lg: 'magico' },

  // ── GIRI LATINI ───────────────────────────────────────
  { name: "Imaj7 - vi7 - ii7 - V7 (Bossa)", emoji: "🌴", tempo: 108, perc: "bossa", sound: "nylonguitar", ch: [{ r: 60, t: 'maj7' }, { r: 69, t: 'min7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['Imaj7', 'vi7', 'ii7', 'V7'], lg: 'esotico' },
  { name: "i - V7 - i - V7 (Tarantella)", emoji: "🍕", tempo: 168, perc: "latin", sound: "nylonguitar", ch: [{ r: 69, t: 'min' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }, { r: 64, t: 'dom7' }], fn: ['i', 'V7', 'i', 'V7'], lg: 'esotico' },
  { name: "I - IV - V7 - IV (Rumba)", emoji: "🌊", tempo: 112, perc: "latin", sound: "nylonguitar", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 67, t: 'dom7' }, { r: 65, t: 'maj' }], fn: ['I', 'IV', 'V7', 'IV'], lg: 'esotico' },
  { name: "Imaj7 - III7 - vi7 - II7 (Samba)", emoji: "🥁", tempo: 136, perc: "latin", sound: "nylonguitar", ch: [{ r: 60, t: 'maj7' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min7' }, { r: 62, t: 'dom7' }], fn: ['Imaj7', 'III7', 'vi7', 'II7'], lg: 'esotico' },
  { name: "i - VI - bVII - i (Tango)", emoji: "💃", tempo: 128, perc: "tango", sound: "accordion", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 69, t: 'min' }], fn: ['i', 'VI', 'VII', 'i'], lg: 'esotico' },
  { name: "I - IV - I - V7 (Cumbia)", emoji: "🎊", tempo: 128, perc: "latin", sound: "accordion", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'IV', 'I', 'V7'], lg: 'esotico' },

  // ── MARCE E LITURGICO ─────────────────────────────────
  { name: "I - I - V - V7", emoji: "🏅", tempo: 120, perc: "march", sound: "brass", ch: [{ r: 60, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'I', 'V', 'V7'], lg: 'storico' },
  { name: "I - IV - ii - V7", emoji: "🙏", tempo: 100, perc: "gospel", sound: "organ", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 62, t: 'min' }, { r: 67, t: 'dom7' }], fn: ['I', 'IV', 'ii', 'V7'], lg: 'sacro' },
  { name: "I - IV - V - IV", emoji: "🎄", tempo: 112, perc: "march", sound: "grandpiano", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['I', 'IV', 'V', 'IV'], lg: 'sacro' },
  { name: "I - V - IV - I", emoji: "⚓", tempo: 120, perc: "march", sound: "accordion", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'V', 'IV', 'I'], lg: 'magico' },
  { name: "I - V7 - I - IV", emoji: "🇺🇸", tempo: 120, perc: "march", sound: "brass", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['I', 'V7', 'I', 'IV'], lg: 'storico' },

  // ── SOUL / GOSPEL ─────────────────────────────────────
  { name: "I - bVII - IV - I (Gospel rock)", emoji: "✨", tempo: 116, perc: "gospel", sound: "organ", ch: [{ r: 60, t: 'maj' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'bVII', 'IV', 'I'], lg: 'sacro' },
  { name: "I - IV - I7 - IV (Soul)", emoji: "🎤", tempo: 104, perc: "funk", sound: "elecpiano", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'dom7' }, { r: 65, t: 'maj' }], fn: ['I', 'IV', 'I7', 'IV'], lg: 'locale' },
  { name: "I - iii - IV - V (Motown)", emoji: "🎤", tempo: 116, perc: "funk", sound: "elecpiano", ch: [{ r: 60, t: 'maj' }, { r: 64, t: 'min' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['I', 'iii', 'IV', 'V'], lg: 'storico' },
  { name: "I7 - IV7 - I7 - IV7 (Funk)", emoji: "🕺", tempo: 104, perc: "funk", sound: "elecpiano", ch: [{ r: 60, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 60, t: 'dom7' }, { r: 65, t: 'dom7' }], fn: ['I7', 'IV7', 'I7', 'IV7'], lg: 'locale' },

  // ── ROCK ──────────────────────────────────────────────
  { name: "I - II - IV - I (Rock)", emoji: "🎸", tempo: 132, perc: "rock", sound: "distguitar", ch: [{ r: 60, t: 'maj' }, { r: 62, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'II', 'IV', 'I'], lg: 'locale' },
  { name: "vi - IV - I - V", emoji: "🌸", tempo: 120, perc: "rock", sound: "grandpiano", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['vi', 'IV', 'I', 'V'], lg: 'teatro' },
  { name: "I - V - II - IV", emoji: "📼", tempo: 128, perc: "rock", sound: "grandpiano", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'maj' }, { r: 62, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['I', 'V', 'II', 'IV'], lg: 'storico' },
  { name: "I - bVI - bVII - IV", emoji: "💎", tempo: 136, perc: "rock", sound: "distguitar", ch: [{ r: 60, t: 'maj' }, { r: 68, t: 'maj' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['I', 'bVI', 'bVII', 'IV'], lg: 'teatro' },
  { name: "vi - iii - IV - I", emoji: "❤️", tempo: 108, perc: "rock", sound: "grandpiano", ch: [{ r: 69, t: 'min' }, { r: 64, t: 'min' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['vi', 'iii', 'IV', 'I'], lg: 'teatro' },
  { name: "I - IV - bVII - IV", emoji: "🌅", tempo: 108, perc: "rock", sound: "grandpiano", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['I', 'IV', 'bVII', 'IV'], lg: 'teatro' },

  // ── CIRCO / MAGICO ────────────────────────────────────
  { name: "I - III7 - vi - V (Circo)", emoji: "Carousel", tempo: 144, perc: "march", sound: "honkytonk", ch: [{ r: 60, t: 'maj' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }, { r: 67, t: 'maj' }], fn: ['I', 'III7', 'vi', 'V'], lg: 'magico' },
  { name: "i - #idim - V7 - i", emoji: "🧙", tempo: 144, perc: "march", sound: "honkytonk", ch: [{ r: 69, t: 'min' }, { r: 70, t: 'dim7' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }], fn: ['i', '#i°', 'V7', 'i'], lg: 'magico' },
  { name: "I - II7 - V - I (Circo barocco)", emoji: "🎪", tempo: 144, perc: "march", sound: "harpsichord", ch: [{ r: 60, t: 'maj' }, { r: 62, t: 'dom7' }, { r: 67, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'II7', 'V', 'I'], lg: 'storico' },
  { name: "Imaj7 - Vmaj7 - IVmaj7 - vi7", emoji: "🌲", tempo: 100, perc: "swing", sound: "strings", ch: [{ r: 60, t: 'maj7' }, { r: 67, t: 'maj7' }, { r: 65, t: 'maj7' }, { r: 69, t: 'min7' }], fn: ['Imaj7', 'Vmaj7', 'IVmaj7', 'vi7'], lg: 'magico' },
  { name: "i - bVI - bVII - bVI", emoji: "🔮", tempo: 144, perc: "tango", sound: "accordion", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['i', 'bVI', 'bVII', 'bVI'], lg: 'magico' },

  // ── SYNTH / MODERNO ───────────────────────────────────
  { name: "vi7 - Vmaj7 - ii7 - III7", emoji: "🤖", tempo: 122, perc: "funk", sound: "synthpad", ch: [{ r: 69, t: 'min7' }, { r: 67, t: 'maj7' }, { r: 62, t: 'min7' }, { r: 64, t: 'dom7' }], fn: ['vi7', 'Vmaj7', 'ii7', 'III7'], lg: 'fantascientifico' },
  { name: "I - bVI - bIII - V7", emoji: "🚀", tempo: 108, perc: "march", sound: "synthpad", ch: [{ r: 60, t: 'maj' }, { r: 68, t: 'maj' }, { r: 63, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'bVI', 'bIII', 'V7'], lg: 'fantascientifico' },
  { name: "vi7 - IV - I - V (Anthem)", emoji: "🌟", tempo: 118, perc: "funk", sound: "elecpiano", ch: [{ r: 69, t: 'min7' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['vi7', 'IV', 'I', 'V'], lg: 'teatro' },
  { name: "I - bIII - IV - bVI", emoji: "🌌", tempo: 120, perc: "funk", sound: "synthpad", ch: [{ r: 60, t: 'maj' }, { r: 63, t: 'maj' }, { r: 65, t: 'maj' }, { r: 68, t: 'maj' }], fn: ['I', 'bIII', 'IV', 'bVI'], lg: 'fantascientifico' },
  { name: "ii7 - V7 - iii7 - VI7", emoji: "🎛️", tempo: 116, perc: "funk", sound: "synthpad", ch: [{ r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 64, t: 'min7' }, { r: 69, t: 'dom7' }], fn: ['ii7', 'V7', 'iii7', 'VI7'], lg: 'fantascientifico' },

  // ── POLKA / VALZER ────────────────────────────────────
  { name: "I - V7 - I - V7 (Polka)", emoji: "🪗", tempo: 152, perc: "march", sound: "accordion", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'V7', 'I', 'V7'], lg: 'storico' },
  { name: "I - V7 - IV - V7 (Valzer)", emoji: "Carousel", tempo: 132, perc: "march", sound: "grandpiano", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'dom7' }, { r: 65, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'V7', 'IV', 'V7'], lg: 'storico' },
  { name: "i - V7 - VII - V7 (Gypsy)", emoji: "🔮", tempo: 148, perc: "tango", sound: "accordion", ch: [{ r: 69, t: 'min' }, { r: 64, t: 'dom7' }, { r: 67, t: 'maj' }, { r: 64, t: 'dom7' }], fn: ['i', 'V7', 'VII', 'V7'], lg: 'magico' },

  // ── VARIAZIONI SU DOMINANTE ───────────────────────────
  { name: "I - #IVm7b5 - IV - I", emoji: "🎼", tempo: 138, perc: "swing", sound: "jazzpiano", ch: [{ r: 60, t: 'maj' }, { r: 66, t: 'min7' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', '#IVm7', 'IV', 'I'], lg: 'locale' },
  { name: "I - IV - #IVdim - V", emoji: "🎹", tempo: 120, perc: "swing", sound: "grandpiano", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 66, t: 'dim7' }, { r: 67, t: 'maj' }], fn: ['I', 'IV', '#IVdim', 'V'], lg: 'teatro' },
  { name: "I - vi - ii7 - V7", emoji: "💕", tempo: 100, perc: "swing", sound: "grandpiano", ch: [{ r: 60, t: 'maj' }, { r: 69, t: 'min' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['I', 'vi', 'ii7', 'V7'], lg: 'teatro' },
  { name: "I - iii7 - IV - V", emoji: "🇮🇹", tempo: 112, perc: "swing", sound: "grandpiano", ch: [{ r: 60, t: 'maj' }, { r: 64, t: 'min7' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['I', 'iii7', 'IV', 'V'], lg: 'teatro' },
  { name: "i - iv - bVII - bIII", emoji: "🌙", tempo: 104, perc: "swing", sound: "jazzpiano", ch: [{ r: 69, t: 'min' }, { r: 62, t: 'min' }, { r: 67, t: 'maj' }, { r: 63, t: 'maj' }], fn: ['i', 'iv', 'bVII', 'bIII'], lg: 'locale' },
];

const RHYTHM_PATTERNS = [
  [0], [0], [0, 2], [0, 2], [0, 1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1.5, 3], [0, 2, 2.5]
];

const BASS_PATTERNS = [
  [[0, -12]], [[0, -12], [2, -12]], [[0, -12], [2, -12], [3, -5]],
  [[0, -12], [1, -5], [2, -12], [3, -5]], [[0, -12], [0.5, -12], [2, -12], [3, -12]],
  [[0, -12], [2, -5], [3, -7]], [[0, -12], [1, -7], [2, -12], [3, -7]], [[0, -12], [2.5, -12]]
];

const BASS_NAMES = ['Electric Jazz', 'Fretless/Upright', 'Slap Bass', 'Motown Walking'];

const SOUND_LIST = Object.keys(SOUND_NAMES);
const PIANO_SOUNDS = ['grandpiano', 'grandpiano', 'grandpiano', 'jazzpiano', 'elecpiano', 'honkytonk'];
