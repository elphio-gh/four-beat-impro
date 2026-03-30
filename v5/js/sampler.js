/**
 * SAMPLER ENGINE (v4 - mobile-first sample packs)
 * Usa pack di sample audio locali e leggeri invece dei soundfont completi in JS/base64.
 * Obiettivo: avvio rapido e consumo dati ridotto su smartphone.
 */

const SAMPLE_PACKS = {
  grandpiano: {
    kind: 'pitched',
    gain: 2.0,
    release: 0.35,
    samples: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  elecpiano: {
    kind: 'pitched',
    gain: 1.8,
    release: 0.28,
    samples: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  organ: {
    kind: 'pitched',
    gain: 1.6,
    release: 0.18,
    samples: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  accordion: {
    kind: 'pitched',
    gain: 1.7,
    release: 0.2,
    samples: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  vibraphone: {
    kind: 'pitched',
    gain: 1.7,
    release: 0.5,
    samples: ['C4', 'F4', 'Bb4', 'D5', 'G5', 'C6']
  },
  bass_electric: {
    kind: 'pitched',
    gain: 1.2,
    release: 0.18,
    samples: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  bass_acoustic: {
    kind: 'pitched',
    gain: 1.05,
    release: 0.18,
    samples: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  bass_fretless: {
    kind: 'pitched',
    gain: 1.15,
    release: 0.22,
    samples: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  bass_synth: {
    kind: 'pitched',
    gain: 1.35,
    release: 0.16,
    samples: ['C3', 'F3', 'Bb3', 'D4', 'G4', 'C5']
  },
  kick: {
    kind: 'oneshot',
    gain: 0.25,
    samples: ['C2']
  },
  snare: {
    kind: 'oneshot',
    gain: 0.25,
    samples: ['C3']
  },
  hihat: {
    kind: 'oneshot',
    gain: 0.25,
    samples: ['C6']
  },
  rim: {
    kind: 'oneshot',
    gain: 0.25,
    samples: ['E5']
  }
};

const SAMPLE_ALIASES = {
  jazzpiano: 'vibraphone',
  pipeorgan: 'organ',
  strings: 'organ',
  brass: 'organ',
  synthpad: 'organ',
  nylonguitar: 'accordion',
  honkytonk: 'grandpiano',
  harpsichord: 'grandpiano',
  distguitar: 'elecpiano',
  steelguitar: 'elecpiano',
  vibraphone: 'vibraphone',
  marimba: 'elecpiano'
};

const Sampler = {
  instruments: {},
  loading: {},
  baseUrl: 'samples/',

  normalizeInstrumentName(name) {
    return SAMPLE_PACKS[name] ? name : (SAMPLE_ALIASES[name] || 'grandpiano');
  },

  assetUrl(path) {
    return `${this.baseUrl}${path}`;
  },

  async loadStartupPreset(mainName = 'grandpiano', bassName = 'bass_electric') {
    await Promise.all([
      this.loadInstrument(mainName),
      this.loadInstrument(bassName),
      this.loadDrums()
    ]);
  },

  async loadInstrument(name) {
    const packName = this.normalizeInstrumentName(name);
    const pack = SAMPLE_PACKS[packName];

    if (!pack) return Promise.resolve();
    if (this.instruments[packName]) return Promise.resolve();
    if (this.loading[packName]) return this.loading[packName];

    if (!ctx) {
      console.warn(`[Sampler] AudioContext non inizializzato. Caricamento di "${packName}" rimandato.`);
      return Promise.resolve();
    }

    const loadPromise = (async () => {
      try {
        console.log(`[Sampler] Caricamento pack leggero: ${packName}`);
        const samples = [];

        for (const note of pack.samples) {
          const url = this.assetUrl(`${packName}/${note}.ogg`);
          const buffer = await this.fetchAudioBuffer(url);
          samples.push({ note, midi: this.nameToMidi(note), buffer });
        }

        this.instruments[packName] = {
          kind: pack.kind,
          gain: pack.gain,
          release: pack.release,
          samples
        };

        if (window.onInstrumentLoaded) window.onInstrumentLoaded(packName);
      } catch (err) {
        console.error(`[Sampler] Errore caricamento "${packName}":`, err);
      } finally {
        delete this.loading[packName];
      }
    })();

    this.loading[packName] = loadPromise;
    return loadPromise;
  },

  async loadDrums() {
    await Promise.all(['kick', 'snare', 'hihat', 'rim'].map((name) => this.loadInstrument(name)));
  },

  async fetchAudioBuffer(url) {
    const response = await fetch(url, { cache: 'default' });
    if (!response.ok) throw new Error(`HTTP ${response.status} per ${url}`);
    const bytes = await response.arrayBuffer();
    return ctx.decodeAudioData(bytes.slice(0));
  },

  playDrum(name, midi, time, duration, volume, options = {}) {
    const packName = this.normalizeInstrumentName(name);
    const inst = this.instruments[packName];
    if (!inst || !inst.samples.length) return false;

    const sample = inst.samples[0];
    const source = ctx.createBufferSource();
    source.buffer = sample.buffer;
    source.playbackRate.setValueAtTime(options.playbackRate || 1, time);

    let signalNode = source;
    if (options.filterType && options.filterFrequency) {
      const filter = ctx.createBiquadFilter();
      filter.type = options.filterType;
      filter.frequency.setValueAtTime(options.filterFrequency, time);
      filter.Q.setValueAtTime(options.q || 0.7, time);
      signalNode.connect(filter);
      signalNode = filter;
    }

    const gain = ctx.createGain();
    const peakVol = Math.min(volume * inst.gain, 1.5);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peakVol, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, time + Math.max(duration, 0.05) + 0.9);

    signalNode.connect(gain);
    gain.connect(dryGain);
    gain.connect(revNode);

    source.start(time);
    source.stop(time + Math.max(duration, 0.05) + 1.3);
    return true;
  },

  playNote(name, midi, time, duration, volume) {
    const packName = this.normalizeInstrumentName(name);
    const inst = this.instruments[packName];
    if (!inst || !inst.samples.length) return false;

    const sample = this.pickNearestSample(inst.samples, midi);
    if (!sample) return false;

    const source = ctx.createBufferSource();
    source.buffer = sample.buffer;
    source.playbackRate.setValueAtTime(Math.pow(2, (midi - sample.midi) / 12), time);

    const gain = ctx.createGain();
    const safeDur = Math.max(duration, 0.1);
    const peakVol = Math.min(volume * inst.gain, 1.1);
    const attack = 0.012;
    const holdTime = Math.max(time + attack, time + safeDur - 0.06);
    const release = Math.max(inst.release || 0.3, 0.36);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peakVol, time + attack);
    gain.gain.setValueAtTime(peakVol, holdTime);
    gain.gain.exponentialRampToValueAtTime(0.001, time + safeDur + release);

    source.connect(gain);
    gain.connect(dryGain);
    gain.connect(revNode);

    source.start(time);
    source.stop(time + safeDur + release + 0.18);
    return true;
  },

  pickNearestSample(samples, midi) {
    let best = null;
    let bestDistance = Infinity;

    for (const sample of samples) {
      const distance = Math.abs(sample.midi - midi);
      if (distance < bestDistance) {
        best = sample;
        bestDistance = distance;
      }
    }

    return best;
  },

  nameToMidi(noteName) {
    const match = noteName.match(/^([A-G])([b#]?)(-?\d+)$/);
    if (!match) throw new Error(`Nota non valida: ${noteName}`);

    const [, letter, accidental, octaveRaw] = match;
    const octave = Number(octaveRaw);
    const base = {
      C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
    }[letter];
    const accidentalOffset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
    return (octave + 1) * 12 + base + accidentalOffset;
  }
};
