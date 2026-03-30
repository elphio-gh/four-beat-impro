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
  { name: "I - IV - V - I", tempo: 120, perc: "swing", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'IV', 'V', 'I'], lg: 'teatro' },
  { name: "I - vi - IV - V", tempo: 118, perc: "rock", ch: [{ r: 60, t: 'maj' }, { r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['I', 'vi', 'IV', 'V'], lg: 'teatro' },
  { name: "I - V - vi - IV", tempo: 116, perc: "swing", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'maj' }, { r: 69, t: 'min' }, { r: 65, t: 'maj' }], fn: ['I', 'V', 'vi', 'IV'], lg: 'magico' },
  { name: "I - IV - I - V7", tempo: 110, perc: "gospel", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'IV', 'I', 'V7'], lg: 'sacro' },
  { name: "I - ii - V - I", tempo: 124, perc: "swing", ch: [{ r: 60, t: 'maj' }, { r: 62, t: 'min' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj' }], fn: ['I', 'ii', 'V7', 'I'], lg: 'locale' },

  // ── JAZZ ii-V-I e variazioni ──────────────────────────
  { name: "ii7 - V7 - Imaj7 - IVmaj7", tempo: 140, perc: "swing", ch: [{ r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj7' }, { r: 65, t: 'maj7' }], fn: ['ii7', 'V7', 'Imaj7', 'IVmaj7'], lg: 'locale' },
  { name: "i7 - IV7 - I7 - V7", tempo: 148, perc: "swing", ch: [{ r: 65, t: 'dom7' }, { r: 70, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 67, t: 'dom7' }], fn: ['IV7', 'bVII7', 'IV7', 'V7'], lg: 'locale' },
  { name: "Imaj7 - vi7 - ii7 - V7", tempo: 112, perc: "swing", ch: [{ r: 60, t: 'maj7' }, { r: 69, t: 'min7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['Imaj7', 'vi7', 'ii7', 'V7'], lg: 'locale' },
  { name: "III7 - VI7 - II7 - V7", tempo: 152, perc: "swing", ch: [{ r: 64, t: 'dom7' }, { r: 69, t: 'dom7' }, { r: 62, t: 'dom7' }, { r: 67, t: 'dom7' }], fn: ['III7', 'VI7', 'II7', 'V7'], lg: 'storico' },
  { name: "i - iv7 - V7 - bIII", tempo: 104, perc: "bossa", ch: [{ r: 69, t: 'min' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj7' }], fn: ['i', 'iv7', 'V7', 'bIII'], lg: 'storico' },
  { name: "Imaj7 - ii7 - V7 - Imaj7", tempo: 108, perc: "bossa", ch: [{ r: 60, t: 'maj7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj7' }], fn: ['Imaj7', 'ii7', 'V7', 'Imaj7'], lg: 'locale' },

  // ── BLUES e derivati ──────────────────────────────────
  { name: "I7 - IV7 - I7 - V7", tempo: 128, perc: "swing", ch: [{ r: 60, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 60, t: 'dom7' }, { r: 67, t: 'dom7' }], fn: ['I7', 'IV7', 'I7', 'V7'], lg: 'locale' },
  { name: "IV7 - bVII7 - IV7 - I7", tempo: 144, perc: "swing", ch: [{ r: 65, t: 'dom7' }, { r: 70, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 60, t: 'dom7' }], fn: ['IV7', 'bVII7', 'IV7', 'I7'], lg: 'storico' },
  { name: "I7 - IV7 - V7 - IV7", tempo: 112, perc: "funk", ch: [{ r: 60, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 67, t: 'dom7' }, { r: 65, t: 'dom7' }], fn: ['I7', 'IV7', 'V7', 'IV7'], lg: 'locale' },
  { name: "I7 - bVII7 - IV7 - I7", tempo: 136, perc: "rock", ch: [{ r: 60, t: 'dom7' }, { r: 70, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 60, t: 'dom7' }], fn: ['I7', 'bVII7', 'IV7', 'I7'], lg: 'locale' },

  // ── ACCORDI PRESTATI (borrowed) ───────────────────────
  { name: "I - bVI - bVII - I", tempo: 120, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 68, t: 'maj' }, { r: 70, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'bVI', 'bVII', 'I'], lg: 'storico' },
  { name: "I - bVI - IV - V", tempo: 112, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 68, t: 'maj' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['I', 'bVI', 'IV', 'V'], lg: 'fantascientifico' },
  { name: "i - bVI - bVII - i", tempo: 130, perc: "tango", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 69, t: 'min' }], fn: ['i', 'bVI', 'bVII', 'i'], lg: 'esotico' },
  { name: "I - bIII - IV - I", tempo: 128, perc: "rock", ch: [{ r: 60, t: 'maj' }, { r: 63, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'bIII', 'IV', 'I'], lg: 'storico' },
  { name: "i - bVII - bVI - V", tempo: 124, perc: "tango", ch: [{ r: 69, t: 'min' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }, { r: 64, t: 'dom7' }], fn: ['i', 'bVII', 'bVI', 'V'], lg: 'storico' },
  { name: "I - bVII - IV - I", tempo: 152, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'bVII', 'IV', 'I'], lg: 'esotico' },

  // ── CADENZE MODALI ────────────────────────────────────
  { name: "i - iv - V7 - i (minore)", tempo: 120, perc: "tango", ch: [{ r: 69, t: 'min' }, { r: 62, t: 'min' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }], fn: ['i', 'iv', 'V7', 'i'], lg: 'esotico' },
  { name: "i - VII - VI - V (Frigio)", tempo: 116, perc: "tango", ch: [{ r: 69, t: 'min' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }, { r: 64, t: 'maj' }], fn: ['i', 'VII', 'VI', 'V'], lg: 'esotico' },
  { name: "I - II - IV - I (Lidio)", tempo: 108, perc: "rock", ch: [{ r: 60, t: 'maj' }, { r: 62, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'II', 'IV', 'I'], lg: 'fantascientifico' },
  { name: "I - VII - vi - V (Misolidio)", tempo: 132, perc: "rock", ch: [{ r: 60, t: 'maj' }, { r: 70, t: 'maj' }, { r: 69, t: 'min' }, { r: 67, t: 'maj' }], fn: ['I', 'bVII', 'vi', 'V'], lg: 'locale' },
  { name: "i - bII - V - i (Frigio flamenco)", tempo: 120, perc: "tango", ch: [{ r: 69, t: 'min' }, { r: 70, t: 'maj' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }], fn: ['i', 'bII', 'V7', 'i'], lg: 'esotico' },

  // ── PROGRESSIONI CROMATICHE ───────────────────────────
  { name: "I - #Idim7 - ii - V", tempo: 138, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 61, t: 'dim7' }, { r: 62, t: 'min' }, { r: 67, t: 'dom7' }], fn: ['I', '#Idim', 'ii', 'V7'], lg: 'storico' },
  { name: "I - III7 - IV - V7", tempo: 144, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 64, t: 'dom7' }, { r: 65, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'III7', 'IV', 'V7'], lg: 'magico' },
  { name: "I - I7 - IV - #IVdim7", tempo: 112, perc: "swing", ch: [{ r: 60, t: 'maj' }, { r: 60, t: 'dom7' }, { r: 65, t: 'maj' }, { r: 66, t: 'dim7' }], fn: ['I', 'I7', 'IV', '#IVdim'], lg: 'locale' },
  { name: "i - #idim - ii°- V7", tempo: 152, perc: "march", ch: [{ r: 69, t: 'min' }, { r: 70, t: 'dim7' }, { r: 71, t: 'dim7' }, { r: 64, t: 'dom7' }], fn: ['i', '#i°', 'ii°', 'V7'], lg: 'magico' },

  // ── GIRI LATINI ───────────────────────────────────────
  { name: "Imaj7 - vi7 - ii7 - V7 (Bossa)", tempo: 108, perc: "bossa", ch: [{ r: 60, t: 'maj7' }, { r: 69, t: 'min7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['Imaj7', 'vi7', 'ii7', 'V7'], lg: 'esotico' },
  { name: "i - V7 - i - V7 (Tarantella)", tempo: 168, perc: "latin", ch: [{ r: 69, t: 'min' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }, { r: 64, t: 'dom7' }], fn: ['i', 'V7', 'i', 'V7'], lg: 'esotico' },
  { name: "I - IV - V7 - IV (Rumba)", tempo: 112, perc: "latin", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 67, t: 'dom7' }, { r: 65, t: 'maj' }], fn: ['I', 'IV', 'V7', 'IV'], lg: 'esotico' },
  { name: "Imaj7 - III7 - vi7 - II7 (Samba)", tempo: 136, perc: "latin", ch: [{ r: 60, t: 'maj7' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min7' }, { r: 62, t: 'dom7' }], fn: ['Imaj7', 'III7', 'vi7', 'II7'], lg: 'esotico' },
  { name: "i - VI - bVII - i (Tango)", tempo: 128, perc: "tango", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 69, t: 'min' }], fn: ['i', 'VI', 'VII', 'i'], lg: 'esotico' },
  { name: "I - IV - I - V7 (Cumbia)", tempo: 128, perc: "latin", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'IV', 'I', 'V7'], lg: 'esotico' },

  // ── MARCE E LITURGICO ─────────────────────────────────
  { name: "I - I - V - V7", tempo: 120, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'I', 'V', 'V7'], lg: 'storico' },
  { name: "I - IV - ii - V7", tempo: 100, perc: "gospel", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 62, t: 'min' }, { r: 67, t: 'dom7' }], fn: ['I', 'IV', 'ii', 'V7'], lg: 'sacro' },
  { name: "I - IV - V - IV", tempo: 112, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['I', 'IV', 'V', 'IV'], lg: 'sacro' },
  { name: "I - V - IV - I", tempo: 120, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'V', 'IV', 'I'], lg: 'magico' },
  { name: "I - V7 - I - IV", tempo: 120, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['I', 'V7', 'I', 'IV'], lg: 'storico' },

  // ── SOUL / GOSPEL ─────────────────────────────────────
  { name: "I - bVII - IV - I (Gospel rock)", tempo: 116, perc: "gospel", ch: [{ r: 60, t: 'maj' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'bVII', 'IV', 'I'], lg: 'sacro' },
  { name: "I - IV - I7 - IV (Soul)", tempo: 104, perc: "funk", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'dom7' }, { r: 65, t: 'maj' }], fn: ['I', 'IV', 'I7', 'IV'], lg: 'locale' },
  { name: "I - iii - IV - V (Motown)", tempo: 116, perc: "funk", ch: [{ r: 60, t: 'maj' }, { r: 64, t: 'min' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['I', 'iii', 'IV', 'V'], lg: 'storico' },
  { name: "I7 - IV7 - I7 - IV7 (Funk)", tempo: 104, perc: "funk", ch: [{ r: 60, t: 'dom7' }, { r: 65, t: 'dom7' }, { r: 60, t: 'dom7' }, { r: 65, t: 'dom7' }], fn: ['I7', 'IV7', 'I7', 'IV7'], lg: 'locale' },

  // ── ROCK ──────────────────────────────────────────────
  { name: "I - II - IV - I (Rock)", tempo: 132, perc: "rock", ch: [{ r: 60, t: 'maj' }, { r: 62, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'II', 'IV', 'I'], lg: 'locale' },
  { name: "vi - IV - I - V", tempo: 120, perc: "rock", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['vi', 'IV', 'I', 'V'], lg: 'teatro' },
  { name: "I - V - II - IV", tempo: 128, perc: "rock", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'maj' }, { r: 62, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['I', 'V', 'II', 'IV'], lg: 'storico' },
  { name: "I - bVI - bVII - IV", tempo: 136, perc: "rock", ch: [{ r: 60, t: 'maj' }, { r: 68, t: 'maj' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['I', 'bVI', 'bVII', 'IV'], lg: 'teatro' },
  { name: "vi - iii - IV - I", tempo: 108, perc: "rock", ch: [{ r: 69, t: 'min' }, { r: 64, t: 'min' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['vi', 'iii', 'IV', 'I'], lg: 'teatro' },
  { name: "I - IV - bVII - IV", tempo: 108, perc: "rock", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['I', 'IV', 'bVII', 'IV'], lg: 'teatro' },

  // ── CIRCO / MAGICO ────────────────────────────────────
  { name: "I - III7 - vi - V (Circo)", tempo: 144, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }, { r: 67, t: 'maj' }], fn: ['I', 'III7', 'vi', 'V'], lg: 'magico' },
  { name: "i - #idim - V7 - i", tempo: 144, perc: "march", ch: [{ r: 69, t: 'min' }, { r: 70, t: 'dim7' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }], fn: ['i', '#i°', 'V7', 'i'], lg: 'magico' },
  { name: "I - II7 - V - I (Circo barocco)", tempo: 144, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 62, t: 'dom7' }, { r: 67, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', 'II7', 'V', 'I'], lg: 'storico' },
  { name: "Imaj7 - Vmaj7 - IVmaj7 - vi7", tempo: 100, perc: "swing", ch: [{ r: 60, t: 'maj7' }, { r: 67, t: 'maj7' }, { r: 65, t: 'maj7' }, { r: 69, t: 'min7' }], fn: ['Imaj7', 'Vmaj7', 'IVmaj7', 'vi7'], lg: 'magico' },
  { name: "i - bVI - bVII - bVI", tempo: 144, perc: "tango", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['i', 'bVI', 'bVII', 'bVI'], lg: 'magico' },

  // ── SYNTH / MODERNO ───────────────────────────────────
  { name: "vi7 - Vmaj7 - ii7 - III7", tempo: 122, perc: "funk", ch: [{ r: 69, t: 'min7' }, { r: 67, t: 'maj7' }, { r: 62, t: 'min7' }, { r: 64, t: 'dom7' }], fn: ['vi7', 'Vmaj7', 'ii7', 'III7'], lg: 'fantascientifico' },
  { name: "I - bVI - bIII - V7", tempo: 108, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 68, t: 'maj' }, { r: 63, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'bVI', 'bIII', 'V7'], lg: 'fantascientifico' },
  { name: "vi7 - IV - I - V (Anthem)", tempo: 118, perc: "funk", ch: [{ r: 69, t: 'min7' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['vi7', 'IV', 'I', 'V'], lg: 'teatro' },
  { name: "I - bIII - IV - bVI", tempo: 120, perc: "funk", ch: [{ r: 60, t: 'maj' }, { r: 63, t: 'maj' }, { r: 65, t: 'maj' }, { r: 68, t: 'maj' }], fn: ['I', 'bIII', 'IV', 'bVI'], lg: 'fantascientifico' },
  { name: "ii7 - V7 - iii7 - VI7", tempo: 116, perc: "funk", ch: [{ r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 64, t: 'min7' }, { r: 69, t: 'dom7' }], fn: ['ii7', 'V7', 'iii7', 'VI7'], lg: 'fantascientifico' },

  // ── POLKA / VALZER ────────────────────────────────────
  { name: "I - V7 - I - V7 (Polka)", tempo: 152, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'V7', 'I', 'V7'], lg: 'storico' },
  { name: "I - V7 - IV - V7 (Valzer)", tempo: 132, perc: "march", ch: [{ r: 60, t: 'maj' }, { r: 67, t: 'dom7' }, { r: 65, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['I', 'V7', 'IV', 'V7'], lg: 'storico' },
  { name: "i - V7 - VII - V7 (Gypsy)", tempo: 148, perc: "tango", ch: [{ r: 69, t: 'min' }, { r: 64, t: 'dom7' }, { r: 67, t: 'maj' }, { r: 64, t: 'dom7' }], fn: ['i', 'V7', 'VII', 'V7'], lg: 'magico' },

  // ── VARIAZIONI SU DOMINANTE ───────────────────────────
  { name: "I - #IVm7b5 - IV - I", tempo: 138, perc: "swing", ch: [{ r: 60, t: 'maj' }, { r: 66, t: 'min7' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['I', '#IVm7', 'IV', 'I'], lg: 'locale' },
  { name: "I - IV - #IVdim - V", tempo: 120, perc: "swing", ch: [{ r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 66, t: 'dim7' }, { r: 67, t: 'maj' }], fn: ['I', 'IV', '#IVdim', 'V'], lg: 'teatro' },
  { name: "I - vi - ii7 - V7", tempo: 100, perc: "swing", ch: [{ r: 60, t: 'maj' }, { r: 69, t: 'min' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['I', 'vi', 'ii7', 'V7'], lg: 'teatro' },
  { name: "I - iii7 - IV - V", tempo: 112, perc: "swing", ch: [{ r: 60, t: 'maj' }, { r: 64, t: 'min7' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['I', 'iii7', 'IV', 'V'], lg: 'teatro' },
  { name: "i - iv - bVII - bIII", tempo: 104, perc: "swing", ch: [{ r: 69, t: 'min' }, { r: 62, t: 'min' }, { r: 67, t: 'maj' }, { r: 63, t: 'maj' }], fn: ['i', 'iv', 'bVII', 'bIII'], lg: 'locale' },
  // ── ESPANSIONI VARIOPINTE ────────────────────────────
  { name: "i - bVImaj7 - iv - V7", tempo: 98, perc: "bossa", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj7' }, { r: 62, t: 'min' }, { r: 64, t: 'dom7' }], fn: ['i', 'bVImaj7', 'iv', 'V7'], lg: 'esotico' },
  { name: "i7 - iv7 - bVII - bIIImaj7", tempo: 106, perc: "swing", ch: [{ r: 69, t: 'min7' }, { r: 62, t: 'min7' }, { r: 67, t: 'maj' }, { r: 60, t: 'maj7' }], fn: ['i7', 'iv7', 'bVII', 'bIIImaj7'], lg: 'locale' },
  { name: "vi - ii - V - iii", tempo: 118, perc: "rock", ch: [{ r: 69, t: 'min' }, { r: 62, t: 'min' }, { r: 67, t: 'maj' }, { r: 64, t: 'min' }], fn: ['vi', 'ii', 'V', 'iii'], lg: 'teatro' },
  { name: "vi7 - IVmaj7 - ii7 - V7", tempo: 110, perc: "funk", ch: [{ r: 69, t: 'min7' }, { r: 65, t: 'maj7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['vi7', 'IVmaj7', 'ii7', 'V7'], lg: 'teatro' },
  { name: "ii - V - vi - IV", tempo: 122, perc: "rock", ch: [{ r: 62, t: 'min' }, { r: 67, t: 'maj' }, { r: 69, t: 'min' }, { r: 65, t: 'maj' }], fn: ['ii', 'V', 'vi', 'IV'], lg: 'teatro' },
  { name: "ii7 - bIII - i7 - V7", tempo: 108, perc: "bossa", ch: [{ r: 62, t: 'min7' }, { r: 60, t: 'maj' }, { r: 69, t: 'min7' }, { r: 64, t: 'dom7' }], fn: ['ii7', 'bIII', 'i7', 'V7'], lg: 'magico' },
  { name: "iii - vi - ii - V7", tempo: 126, perc: "swing", ch: [{ r: 64, t: 'min' }, { r: 69, t: 'min' }, { r: 62, t: 'min' }, { r: 67, t: 'dom7' }], fn: ['iii', 'vi', 'ii', 'V7'], lg: 'locale' },
  { name: "iii7 - vi7 - ii7 - V7", tempo: 132, perc: "swing", ch: [{ r: 64, t: 'min7' }, { r: 69, t: 'min7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['iii7', 'vi7', 'ii7', 'V7'], lg: 'locale' },
  { name: "iv - i - bVII - V7", tempo: 116, perc: "tango", ch: [{ r: 62, t: 'min' }, { r: 69, t: 'min' }, { r: 67, t: 'maj' }, { r: 64, t: 'dom7' }], fn: ['iv', 'i', 'bVII', 'V7'], lg: 'esotico' },
  { name: "iv7 - bVII7 - i - V7", tempo: 114, perc: "gospel", ch: [{ r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 69, t: 'min' }, { r: 64, t: 'dom7' }], fn: ['iv7', 'bVII7', 'i', 'V7'], lg: 'sacro' },
  { name: "i6 - iv - bVII - i6", tempo: 96, perc: "latin", ch: [{ r: 69, t: 'min6' }, { r: 62, t: 'min' }, { r: 67, t: 'maj' }, { r: 69, t: 'min6' }], fn: ['i6', 'iv', 'bVII', 'i6'], lg: 'esotico' },
  { name: "vi6 - IV - I - V", tempo: 112, perc: "rock", ch: [{ r: 69, t: 'min6' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['vi6', 'IV', 'I', 'V'], lg: 'teatro' },
  { name: "Isus2 - IV - vi - V", tempo: 120, perc: "rock", ch: [{ r: 60, t: 'sus2' }, { r: 65, t: 'maj' }, { r: 69, t: 'min' }, { r: 67, t: 'maj' }], fn: ['Isus2', 'IV', 'vi', 'V'], lg: 'locale' },
  { name: "isus2 - bVI - bVII - i", tempo: 118, perc: "tango", ch: [{ r: 69, t: 'sus2' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }, { r: 69, t: 'min' }], fn: ['isus2', 'bVI', 'bVII', 'i'], lg: 'esotico' },
  { name: "IVsus2 - I - V - IV", tempo: 124, perc: "latin", ch: [{ r: 65, t: 'sus2' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['IVsus2', 'I', 'V', 'IV'], lg: 'esotico' },
  { name: "Vsus4 - IV - I - V", tempo: 128, perc: "rock", ch: [{ r: 67, t: 'sus4' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['Vsus4', 'IV', 'I', 'V'], lg: 'locale' },
  { name: "Isus4 - bVII - IV - I", tempo: 116, perc: "gospel", ch: [{ r: 60, t: 'sus4' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['Isus4', 'bVII', 'IV', 'I'], lg: 'sacro' },
  { name: "isus4 - iv - bII - V7", tempo: 122, perc: "tango", ch: [{ r: 69, t: 'sus4' }, { r: 62, t: 'min' }, { r: 70, t: 'maj' }, { r: 64, t: 'dom7' }], fn: ['isus4', 'iv', 'bII', 'V7'], lg: 'magico' },
  { name: "ivsus4 - i - bVII - V7", tempo: 102, perc: "latin", ch: [{ r: 62, t: 'sus4' }, { r: 69, t: 'min' }, { r: 67, t: 'maj' }, { r: 64, t: 'dom7' }], fn: ['ivsus4', 'i', 'bVII', 'V7'], lg: 'esotico' },
  { name: "iisus2 - V7 - I - vi", tempo: 114, perc: "bossa", ch: [{ r: 62, t: 'sus2' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj' }, { r: 69, t: 'min' }], fn: ['iisus2', 'V7', 'I', 'vi'], lg: 'locale' },
  { name: "visus2 - IV - I - V", tempo: 118, perc: "rock", ch: [{ r: 69, t: 'sus2' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['visus2', 'IV', 'I', 'V'], lg: 'teatro' },
  { name: "isus2 - V7 - bVI - bVII", tempo: 126, perc: "latin", ch: [{ r: 69, t: 'sus2' }, { r: 64, t: 'dom7' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['isus2', 'V7', 'bVI', 'bVII'], lg: 'magico' },
  { name: "Isus4 - II - IV - I", tempo: 112, perc: "rock", ch: [{ r: 60, t: 'sus4' }, { r: 62, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['Isus4', 'II', 'IV', 'I'], lg: 'fantascientifico' },
  { name: "ivsus4 - i - V7 - i", tempo: 100, perc: "tango", ch: [{ r: 62, t: 'sus4' }, { r: 69, t: 'min' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }], fn: ['ivsus4', 'i', 'V7', 'i'], lg: 'esotico' },
  { name: "#Idim7 - ii - V7 - I", tempo: 134, perc: "swing", ch: [{ r: 61, t: 'dim7' }, { r: 62, t: 'min' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj' }], fn: ['#Idim7', 'ii', 'V7', 'I'], lg: 'storico' },
  { name: "vii°7 - i - iv - V7", tempo: 128, perc: "march", ch: [{ r: 71, t: 'dim7' }, { r: 69, t: 'min' }, { r: 62, t: 'min' }, { r: 64, t: 'dom7' }], fn: ['vii°7', 'i', 'iv', 'V7'], lg: 'magico' },
  { name: "#iv°7 - V - I - vi", tempo: 130, perc: "march", ch: [{ r: 66, t: 'dim7' }, { r: 67, t: 'maj' }, { r: 60, t: 'maj' }, { r: 69, t: 'min' }], fn: ['#iv°7', 'V', 'I', 'vi'], lg: 'storico' },
  { name: "ii°7 - V7 - i - bVI", tempo: 122, perc: "tango", ch: [{ r: 71, t: 'dim7' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }, { r: 65, t: 'maj' }], fn: ['ii°7', 'V7', 'i', 'bVI'], lg: 'magico' },
  { name: "i - #i°7 - ii°7 - V7", tempo: 118, perc: "march", ch: [{ r: 69, t: 'min' }, { r: 70, t: 'dim7' }, { r: 71, t: 'dim7' }, { r: 64, t: 'dom7' }], fn: ['i', '#i°7', 'ii°7', 'V7'], lg: 'magico' },
  { name: "I+ - IV - ii - V", tempo: 124, perc: "rock", ch: [{ r: 60, t: 'aug' }, { r: 65, t: 'maj' }, { r: 62, t: 'min' }, { r: 67, t: 'maj' }], fn: ['I+', 'IV', 'ii', 'V'], lg: 'locale' },
  { name: "bVI+ - V - i - iv", tempo: 108, perc: "tango", ch: [{ r: 65, t: 'aug' }, { r: 64, t: 'maj' }, { r: 69, t: 'min' }, { r: 62, t: 'min' }], fn: ['bVI+', 'V', 'i', 'iv'], lg: 'esotico' },
  { name: "III+ - vi - ii - V7", tempo: 126, perc: "swing", ch: [{ r: 64, t: 'aug' }, { r: 69, t: 'min' }, { r: 62, t: 'min' }, { r: 67, t: 'dom7' }], fn: ['III+', 'vi', 'ii', 'V7'], lg: 'locale' },
  { name: "i°7 - bII - i - V7", tempo: 132, perc: "march", ch: [{ r: 69, t: 'dim7' }, { r: 70, t: 'maj' }, { r: 69, t: 'min' }, { r: 64, t: 'dom7' }], fn: ['i°7', 'bII', 'i', 'V7'], lg: 'magico' },
  { name: "vi°7 - I - IV - V", tempo: 120, perc: "march", ch: [{ r: 69, t: 'dim7' }, { r: 60, t: 'maj' }, { r: 65, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['vi°7', 'I', 'IV', 'V'], lg: 'storico' },
  { name: "ii°7 - bIII - iv - V7", tempo: 116, perc: "tango", ch: [{ r: 71, t: 'dim7' }, { r: 60, t: 'maj' }, { r: 62, t: 'min' }, { r: 64, t: 'dom7' }], fn: ['ii°7', 'bIII', 'iv', 'V7'], lg: 'magico' },
  { name: "i7 - bIIImaj7 - iv7 - bVII7", tempo: 102, perc: "funk", ch: [{ r: 69, t: 'min7' }, { r: 60, t: 'maj7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['i7', 'bIIImaj7', 'iv7', 'bVII7'], lg: 'locale' },
  { name: "ii7 - V7 - I6 - vi7", tempo: 108, perc: "bossa", ch: [{ r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj6' }, { r: 69, t: 'min7' }], fn: ['ii7', 'V7', 'I6', 'vi7'], lg: 'locale' },
  { name: "vi7 - ii7 - V7 - I6", tempo: 112, perc: "funk", ch: [{ r: 69, t: 'min7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 60, t: 'maj6' }], fn: ['vi7', 'ii7', 'V7', 'I6'], lg: 'teatro' },
  { name: "iii7 - bIIImaj7 - ii7 - V7", tempo: 118, perc: "swing", ch: [{ r: 64, t: 'min7' }, { r: 63, t: 'maj7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['iii7', 'bIIImaj7', 'ii7', 'V7'], lg: 'locale' },
  { name: "iv7 - Imaj7 - bVII7 - III7", tempo: 104, perc: "gospel", ch: [{ r: 62, t: 'min7' }, { r: 60, t: 'maj7' }, { r: 70, t: 'dom7' }, { r: 64, t: 'dom7' }], fn: ['iv7', 'Imaj7', 'bVII7', 'III7'], lg: 'sacro' },
  { name: "i7 - VImaj7 - iv7 - V7", tempo: 96, perc: "bossa", ch: [{ r: 69, t: 'min7' }, { r: 65, t: 'maj7' }, { r: 62, t: 'min7' }, { r: 64, t: 'dom7' }], fn: ['i7', 'VImaj7', 'iv7', 'V7'], lg: 'esotico' },
  { name: "ii7 - V7 - iii7 - vi7", tempo: 124, perc: "swing", ch: [{ r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 64, t: 'min7' }, { r: 69, t: 'min7' }], fn: ['ii7', 'V7', 'iii7', 'vi7'], lg: 'locale' },
  { name: "vi7 - bVIImaj7 - Imaj7 - V7", tempo: 114, perc: "funk", ch: [{ r: 69, t: 'min7' }, { r: 70, t: 'maj7' }, { r: 60, t: 'maj7' }, { r: 67, t: 'dom7' }], fn: ['vi7', 'bVIImaj7', 'Imaj7', 'V7'], lg: 'fantascientifico' },
  { name: "i7 - iv7 - Imaj7 - bVII7", tempo: 100, perc: "gospel", ch: [{ r: 69, t: 'min7' }, { r: 62, t: 'min7' }, { r: 60, t: 'maj7' }, { r: 67, t: 'dom7' }], fn: ['i7', 'iv7', 'Imaj7', 'bVII7'], lg: 'sacro' },
  { name: "iv7 - V7 - iii7 - vi7", tempo: 120, perc: "funk", ch: [{ r: 65, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 64, t: 'min7' }, { r: 69, t: 'min7' }], fn: ['iv7', 'V7', 'iii7', 'vi7'], lg: 'locale' },
  { name: "ii7 - IVmaj7 - Imaj7 - V7", tempo: 106, perc: "bossa", ch: [{ r: 62, t: 'min7' }, { r: 65, t: 'maj7' }, { r: 60, t: 'maj7' }, { r: 67, t: 'dom7' }], fn: ['ii7', 'IVmaj7', 'Imaj7', 'V7'], lg: 'locale' },
  { name: "iii7 - IVmaj7 - ii7 - V7", tempo: 122, perc: "swing", ch: [{ r: 64, t: 'min7' }, { r: 65, t: 'maj7' }, { r: 62, t: 'min7' }, { r: 67, t: 'dom7' }], fn: ['iii7', 'IVmaj7', 'ii7', 'V7'], lg: 'locale' },
  { name: "i - V7 - i - bVI", tempo: 132, perc: "latin", ch: [{ r: 69, t: 'min' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }, { r: 65, t: 'maj' }], fn: ['i', 'V7', 'i', 'bVI'], lg: 'esotico' },
  { name: "iv - bVII - i - V7", tempo: 128, perc: "tango", ch: [{ r: 62, t: 'min' }, { r: 67, t: 'maj' }, { r: 69, t: 'min' }, { r: 64, t: 'dom7' }], fn: ['iv', 'bVII', 'i', 'V7'], lg: 'esotico' },
  { name: "i - bII - V7 - i", tempo: 124, perc: "tango", ch: [{ r: 69, t: 'min' }, { r: 70, t: 'maj' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min' }], fn: ['i', 'bII', 'V7', 'i'], lg: 'esotico' },
  { name: "vi - bVII - I - V", tempo: 120, perc: "rock", ch: [{ r: 69, t: 'min' }, { r: 70, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['vi', 'bVII', 'I', 'V'], lg: 'locale' },
  { name: "ii - IV - I - vi", tempo: 114, perc: "latin", ch: [{ r: 62, t: 'min' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 69, t: 'min' }], fn: ['ii', 'IV', 'I', 'vi'], lg: 'teatro' },
  { name: "i - VI - III - VII", tempo: 126, perc: "march", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['i', 'VI', 'III', 'VII'], lg: 'storico' },
  { name: "i7 - V7 - bIII - bVII", tempo: 116, perc: "latin", ch: [{ r: 69, t: 'min7' }, { r: 64, t: 'dom7' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['i7', 'V7', 'bIII', 'bVII'], lg: 'magico' },
  { name: "iv - i - bVI - V7", tempo: 108, perc: "tango", ch: [{ r: 62, t: 'min' }, { r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 64, t: 'dom7' }], fn: ['iv', 'i', 'bVI', 'V7'], lg: 'esotico' },
  { name: "ii7 - V7 - i - VI", tempo: 112, perc: "bossa", ch: [{ r: 62, t: 'min7' }, { r: 67, t: 'dom7' }, { r: 69, t: 'min' }, { r: 65, t: 'maj' }], fn: ['ii7', 'V7', 'i', 'VI'], lg: 'locale' },
  { name: "i6 - V7 - i6 - iv", tempo: 98, perc: "latin", ch: [{ r: 69, t: 'min6' }, { r: 64, t: 'dom7' }, { r: 69, t: 'min6' }, { r: 62, t: 'min' }], fn: ['i6', 'V7', 'i6', 'iv'], lg: 'esotico' },
  { name: "vi - IV - ii - V", tempo: 118, perc: "rock", ch: [{ r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 62, t: 'min' }, { r: 67, t: 'maj' }], fn: ['vi', 'IV', 'ii', 'V'], lg: 'teatro' },
  { name: "vi7 - I - bVII - IV", tempo: 110, perc: "funk", ch: [{ r: 69, t: 'min7' }, { r: 60, t: 'maj' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['vi7', 'I', 'bVII', 'IV'], lg: 'teatro' },
  { name: "Isus2 - V - IV - I", tempo: 122, perc: "rock", ch: [{ r: 60, t: 'sus2' }, { r: 67, t: 'maj' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['Isus2', 'V', 'IV', 'I'], lg: 'locale' },
  { name: "Vsus4 - vi - IV - I", tempo: 116, perc: "rock", ch: [{ r: 67, t: 'sus4' }, { r: 69, t: 'min' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['Vsus4', 'vi', 'IV', 'I'], lg: 'locale' },
  { name: "i - bVII - IV - i", tempo: 120, perc: "rock", ch: [{ r: 69, t: 'min' }, { r: 67, t: 'maj' }, { r: 62, t: 'maj' }, { r: 69, t: 'min' }], fn: ['i', 'bVII', 'IV', 'i'], lg: 'magico' },
  { name: "vi - I - bVII - IV", tempo: 112, perc: "funk", ch: [{ r: 69, t: 'min' }, { r: 60, t: 'maj' }, { r: 70, t: 'maj' }, { r: 65, t: 'maj' }], fn: ['vi', 'I', 'bVII', 'IV'], lg: 'fantascientifico' },
  { name: "iv - bVI - i - V7", tempo: 106, perc: "tango", ch: [{ r: 62, t: 'min' }, { r: 65, t: 'maj' }, { r: 69, t: 'min' }, { r: 64, t: 'dom7' }], fn: ['iv', 'bVI', 'i', 'V7'], lg: 'esotico' },
  { name: "i7 - bVImaj7 - bIIImaj7 - bVII7", tempo: 94, perc: "gospel", ch: [{ r: 69, t: 'min7' }, { r: 65, t: 'maj7' }, { r: 60, t: 'maj7' }, { r: 67, t: 'dom7' }], fn: ['i7', 'bVImaj7', 'bIIImaj7', 'bVII7'], lg: 'sacro' },
  { name: "iii - IV - I - vi", tempo: 118, perc: "rock", ch: [{ r: 64, t: 'min' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 69, t: 'min' }], fn: ['iii', 'IV', 'I', 'vi'], lg: 'teatro' },
  { name: "iisus4 - IV - I - V", tempo: 114, perc: "latin", ch: [{ r: 62, t: 'sus4' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'maj' }], fn: ['iisus4', 'IV', 'I', 'V'], lg: 'esotico' },
  { name: "vi6 - iii7 - IV - I", tempo: 104, perc: "funk", ch: [{ r: 69, t: 'min6' }, { r: 64, t: 'min7' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }], fn: ['vi6', 'iii7', 'IV', 'I'], lg: 'teatro' },
  { name: "#iv°7 - IV - I - V7", tempo: 126, perc: "march", ch: [{ r: 66, t: 'dim7' }, { r: 65, t: 'maj' }, { r: 60, t: 'maj' }, { r: 67, t: 'dom7' }], fn: ['#iv°7', 'IV', 'I', 'V7'], lg: 'storico' },
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
