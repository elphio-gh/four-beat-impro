/**
 * SAMPLER ENGINE (v3 - Pipeline corretto e robusto)
 * Gestisce il caricamento e la riproduzione di campioni reali da SoundFont FluidR3.
 * Carica i suoni on-demand da CDN per mantenere l'app leggera.
 * Ogni strumento viene scaricato come file .js contenente campioni base64-encoded,
 * quindi decodificato in AudioBuffer per la riproduzione tramite Web Audio API.
 */

const Sampler = {
  instruments: {}, // { nomeStrumento: { nomeNota: AudioBuffer } }
  loading: {},     // { nomeStrumento: Promise } durante il caricamento
  baseUrl: window.location.protocol === 'file:'
    ? 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/'
    : 'soundfonts/',
  fallbackCdnUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/',

  // Mappa nomi interni dell'app verso nomi FluidR3 del CDN
  map: {
    'grandpiano': 'acoustic_grand_piano',
    'jazzpiano': 'bright_acoustic_piano',
    'elecpiano': 'electric_piano_1',
    'organ': 'percussive_organ',
    'pipeorgan': 'church_organ',
    'accordion': 'accordion',
    'strings': 'string_ensemble_1',
    'brass': 'brass_section',
    'nylonguitar': 'acoustic_guitar_nylon',
    'distguitar': 'distortion_guitar',
    'steelguitar': 'acoustic_guitar_steel',
    'honkytonk': 'honkytonk_piano',
    'synthpad': 'synth_pad_1_new_age',
    'vibraphone': 'vibraphone',
    'harpsichord': 'harpsichord',
    'marimba': 'marimba',
    'bass_electric': 'electric_bass_finger',
    'bass_acoustic': 'acoustic_bass',
    'bass_fretless': 'fretless_bass',
    'bass_synth': 'synth_bass_1',
    'kick': 'acoustic_kick',
    'snare': 'acoustic_snare',
    'hihat': 'acoustic_hihat',
    'rim': 'acoustic_rim'
  },

  /**
   * Carica uno strumento HD dalla CDN se non gia' presente.
   * La funzione e' asincrona: il caricamento avviene in background
   * e la riproduzione HD si attiva automaticamente appena pronto.
   */
  async loadInstrument(name) {
    const internalName = this.map[name] || name;
    const assetVersion = window.APP_VERSION || '0.5b';

    // Evita caricamenti duplicati: se caricato, torna subito; se in caricamento, torna la Promise
    if (this.instruments[name]) return Promise.resolve();
    if (this.loading[name]) return this.loading[name];

    // L'AudioContext deve esistere per la decodifica dei campioni
    if (!ctx) {
      console.warn(`[Sampler] AudioContext non inizializzato. Caricamento di "${name}" rimandato.`);
      return Promise.resolve();
    }

    console.log(`[Sampler] Avvio caricamento HD: ${name} (CDN: ${internalName})...`);

    const loadPromise = (async () => {
      try {
        const sourceCandidates = [
          `${this.baseUrl}${internalName}-ogg.js?v=${encodeURIComponent(assetVersion)}`
        ];

        if (this.baseUrl !== this.fallbackCdnUrl) {
          sourceCandidates.push(`${this.fallbackCdnUrl}${internalName}-ogg.js?v=${encodeURIComponent(assetVersion)}`);
        }

        sourceCandidates.push(`${this.fallbackCdnUrl}${internalName}-mp3.js?v=${encodeURIComponent(assetVersion)}`);

        let loaded = null;
        let lastError = null;

        for (const sourceUrl of sourceCandidates) {
          try {
            loaded = await this.fetchAndDecodeSoundfont(sourceUrl, internalName, name);
            console.log(`[Sampler] HD Caricato: ${name} da ${sourceUrl} — ${loaded.decoded} note OK, ${loaded.failed} fallite`);
            break;
          } catch (err) {
            lastError = err;
            console.warn(`[Sampler] Tentativo fallito per "${name}" da ${sourceUrl}:`, err);
          } finally {
            delete window.MIDI.Soundfont[internalName];
          }
        }

        if (!loaded) {
          throw lastError || new Error(`Impossibile caricare "${name}" in nessun formato`);
        }

        this.instruments[name] = loaded.buffers;

        // Pulizia memoria globale: i dati raw non servono piu' (i buffer decodificati sono in this.instruments)
        delete window.MIDI.Soundfont[internalName];

        // Notifica la UI per aggiornare i badge [HD]
        if (window.onInstrumentLoaded) window.onInstrumentLoaded(name);

      } catch (err) {
        console.error(`[Sampler] Errore caricamento "${name}":`, err);
      } finally {
        delete this.loading[name];
      }
    })();

    this.loading[name] = loadPromise;
    return loadPromise;
  },

  async fetchAndDecodeSoundfont(sourceUrl, internalName, label) {
    const response = await fetch(sourceUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status} per ${internalName}`);

    const scriptText = await response.text();
    window.eval(scriptText);

    const soundData = window.MIDI.Soundfont[internalName];
    if (!soundData) throw new Error(`Dati non trovati per "${internalName}" dopo eval`);

    const noteKeys = Object.keys(soundData);
    console.log(`[Sampler] ${label}: trovate ${noteKeys.length} note da ${sourceUrl}, avvio decodifica...`);

    const buffers = {};
    let decoded = 0, failed = 0;

    for (const note of noteKeys) {
      try {
        const base64Data = soundData[note].split(',')[1];
        if (!base64Data) { failed++; continue; }

        const raw = atob(base64Data);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);

        // Decodifica sequenziale: su mobile Firefox evita picchi di memoria e abort sporadici.
        const audioBuffer = await ctx.decodeAudioData(arr.buffer.slice(0));
        buffers[note] = audioBuffer;
        decoded++;
      } catch (e) {
        failed++;
      }
    }

    if (decoded === 0) {
      throw new Error(`Nessun campione decodificato (${failed} falliti)`);
    }

    return { buffers, decoded, failed };
  },

  /**
   * Carica tutti gli strumenti percussivi HD.
   */
  async loadDrums() {
    await Promise.all(['kick', 'snare', 'hihat', 'rim'].map(d => this.loadInstrument(d)));
  },

  /**
   * Riproduce uno strumento percussivo HD con un inviluppo molto rapido.
   */
  playDrum(name, midi, time, duration, volume) {
    const inst = this.instruments[name];
    if (!inst) return false;

    const noteName = this.midiToName(midi);
    const buffer = inst[noteName];
    if (!buffer) return false;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    // I campioni acustici sono gia' normalizzati a 0dB e quindi molto forti.
    // Un moltiplicatore di 0.25 e' ideale per tenerli come accompagnamento (era 0.55)
    const peakVol = volume * 0.25;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peakVol, time + 0.005);
    // Le percussioni reali (SoundFont) decadono naturalmente. Diamo 1 secondo abbondante senza tagli netti.
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

    source.connect(gain);
    gain.connect(dryGain);
    gain.connect(revNode);

    source.start(time);
    source.stop(time + 1.5);
    return true;
  },

  /**
   * Riproduce una nota usando i campioni HD.
   * Ritorna true se il campione e' stato trovato e riprodotto,
   * false se lo strumento non e' ancora caricato (fallback a synth).
   */
  playNote(name, midi, time, duration, volume) {
    const inst = this.instruments[name];
    if (!inst) return false;

    const noteName = this.midiToName(midi);
    const buffer = inst[noteName];
    if (!buffer) return false;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Inviluppo ADSR per evitare click e rendere il suono naturale
    // Moltiplicatore 3.0: i campioni SoundFont hanno ampiezza intrinseca piu' bassa
    // rispetto alla sintesi (che somma piu' oscillatori/armoniche), serve compensare
    const gain = ctx.createGain();
    const safeDur = Math.max(duration, 0.1);
    const peakVol = volume * 3.0;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peakVol, time + 0.01);
    gain.gain.setValueAtTime(peakVol, time + safeDur - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + safeDur + 0.4);

    // Routing: stesso percorso del synth (dryGain + riverbero)
    source.connect(gain);
    gain.connect(dryGain);
    gain.connect(revNode);

    source.start(time);
    source.stop(time + safeDur + 0.5);
    return true;
  },

  /**
   * Converte un numero MIDI nel nome nota usato dai file FluidR3.
   * Es: MIDI 60 -> "C4", MIDI 69 -> "A4", MIDI 61 -> "Db4"
   */
  midiToName(midi) {
    const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const name = notes[midi % 12];
    const oct = Math.floor(midi / 12) - 1;
    return `${name}${oct}`;
  }
};

// Inizializza namespace globale richiesto dai file .js del soundfont CDN
// Questi file fanno: if (typeof(MIDI) === 'undefined') var MIDI = {};
// Definendolo prima evitiamo che creino un oggetto vuoto sovrascrivendo i dati
window.MIDI = window.MIDI || {};
window.MIDI.Soundfont = window.MIDI.Soundfont || {};
