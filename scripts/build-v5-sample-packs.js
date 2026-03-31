const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'v5', 'soundfonts');
const OUTPUT_DIR = path.join(ROOT, 'v5', 'samples');

const PACKS = {
  grandpiano: {
    source: 'acoustic_grand_piano',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  jazzpiano: {
    source: 'bright_acoustic_piano',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  elecpiano: {
    source: 'electric_piano_1',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  organ: {
    source: 'percussive_organ',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  pipeorgan: {
    source: 'church_organ',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  accordion: {
    source: 'accordion',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  vibraphone: {
    source: 'vibraphone',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  brass: {
    source: 'brass_section',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  strings: {
    source: 'string_ensemble_1',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  honkytonk: {
    source: 'honkytonk_piano',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  harpsichord: {
    source: 'harpsichord',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  synthpad: {
    source: 'string_ensemble_1',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  marimba: {
    source: 'marimba',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  nylonguitar: {
    source: 'acoustic_guitar_nylon',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  steelguitar: {
    source: 'acoustic_guitar_steel',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  distguitar: {
    source: 'distortion_guitar',
    notes: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  bass_pick: {
    source: 'electric_bass_pick',
    notes: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  bass_slap: {
    source: 'slap_bass_1',
    notes: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  bass_sub: {
    source: 'synth_bass_2',
    notes: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  bass_electric: {
    source: 'electric_bass_finger',
    notes: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  bass_acoustic: {
    source: 'acoustic_bass',
    notes: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  bass_fretless: {
    source: 'fretless_bass',
    notes: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  bass_synth: {
    source: 'synth_bass_1',
    notes: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  kick: {
    source: 'acoustic_kick',
    notes: ['C2']
  },
  snare: {
    source: 'acoustic_snare',
    notes: ['C3']
  },
  hihat: {
    source: 'acoustic_hihat',
    notes: ['C6']
  },
  rim: {
    source: 'acoustic_rim',
    notes: ['E5']
  },
  taiko: {
    source: 'taiko_drum',
    notes: ['C2']
  },
  synthdrum: {
    source: 'synth_drum',
    notes: ['C2']
  },
  agogo: {
    source: 'agogo',
    notes: ['C6']
  },
  woodblock: {
    source: 'woodblock',
    notes: ['E5']
  }
};

function loadSoundfont(sourceName) {
  const file = path.join(SOURCE_DIR, `${sourceName}-ogg.js`);
  const source = fs.readFileSync(file, 'utf8');
  const context = { window: {}, console };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.MIDI.Soundfont[sourceName];
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeDataUriToFile(dataUri, targetFile) {
  const [, base64] = dataUri.split(',');
  fs.writeFileSync(targetFile, Buffer.from(base64, 'base64'));
}

function main() {
  ensureDir(OUTPUT_DIR);

  for (const [packName, pack] of Object.entries(PACKS)) {
    const soundfont = loadSoundfont(pack.source);
    const packDir = path.join(OUTPUT_DIR, packName);
    ensureDir(packDir);

    for (const note of pack.notes) {
      const dataUri = soundfont[note];
      if (!dataUri) {
        throw new Error(`Nota ${note} non trovata in ${pack.source}`);
      }

      writeDataUriToFile(dataUri, path.join(packDir, `${note}.ogg`));
    }
  }
}

main();
