/**
 * V6 AUDIO ENGINE
 * Motore semplificato, guidato dagli stili e dalla struttura fissa 2+4+4.
 */

let ctx = null, masterGain, dryGain, revGain, revNode;
let nextBeatTime = 0, schedTimer = null;
const LOOK_AHEAD = 0.14;
const TICK_MS = 25;

const MIX_PROFILE = {
  master: 0.96,
  dry: 0.76,
  reverb: 0.18,
  compressor: {
    threshold: -20,
    knee: 8,
    ratio: 5,
    attack: 0.002,
    release: 0.16
  },
  metronomeLead: 4.2,
  metronomeGhost: 2.2
};

const DRUM_VOICES = {
  kick: { sample: 'kick', midi: 36, duration: 0.4, volume: 0.42 },
  snare: { sample: 'snare', midi: 48, duration: 0.22, volume: 0.28 },
  hihat: { sample: 'hihat', midi: 84, duration: 0.07, openDuration: 0.38, volume: 0.15 },
  rim: { sample: 'rim', midi: 76, duration: 0.05, volume: 0.24 }
};

function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain();
  masterGain.gain.value = MIX_PROFILE.master;
  dryGain = ctx.createGain();
  dryGain.gain.value = MIX_PROFILE.dry;
  revGain = ctx.createGain();
  revGain.gain.value = MIX_PROFILE.reverb;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = MIX_PROFILE.compressor.threshold;
  comp.knee.value = MIX_PROFILE.compressor.knee;
  comp.ratio.value = MIX_PROFILE.compressor.ratio;
  comp.attack.value = MIX_PROFILE.compressor.attack;
  comp.release.value = MIX_PROFILE.compressor.release;

  revNode = buildReverb();
  dryGain.connect(comp);
  revNode.connect(revGain);
  revGain.connect(comp);
  comp.connect(masterGain);
  masterGain.connect(ctx.destination);
}

function buildReverb() {
  const cv = ctx.createConvolver();
  const len = ctx.sampleRate * 2.2;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.7);
  }
  cv.buffer = buf;
  return cv;
}

function clickSound(t, vol = 0.65) {
  Sampler.playDrum('rim', 76, t, 0.04, vol * 3.2);
}

function metroClick(t, isOne) {
  Sampler.playDrum('rim', 76, t, 0.04, isOne ? MIX_PROFILE.metronomeLead : MIX_PROFILE.metronomeGhost);
  if (isOne) Sampler.playDrum('rim', 76, t + 0.012, 0.03, MIX_PROFILE.metronomeGhost);
}

function doCountIn(onDone) {
  isCountingIn = true;
  const spb = 60 / bpm;
  const startT = ctx.currentTime + 0.12;
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
  const delay = (audioTime - ctx.currentTime) * 1000;
  countInTimers.push(setTimeout(fn, Math.max(0, delay)));
}

function getDrumVoiceConfig(name, open = false) {
  const base = DRUM_VOICES[name];
  const duration = open ? (base.openDuration || base.duration) : base.duration;
  return {
    sample: base.sample,
    midi: base.midi,
    duration,
    volume: base.volume
  };
}

function playStyledDrum(name, t, { gain = 1, offset = 0, open = false } = {}) {
  const cfg = getDrumVoiceConfig(name, open);
  Sampler.playDrum(cfg.sample, cfg.midi, t + offset, cfg.duration, cfg.volume * gain);
}

function playDrumEvent(event, t) {
  if (event.drum === 'kick') playStyledDrum('kick', t, event);
  else if (event.drum === 'snare') playStyledDrum('snare', t, event);
  else if (event.drum === 'hihat') playStyledDrum('hihat', t, event);
  else if (event.drum === 'rim') playStyledDrum('rim', t, event);
}

function playPercBeat(beatInBar, t) {
  const events = currentVariation?.drumPattern?.[beatInBar] || [];
  for (const event of events) playDrumEvent(event, t);
}

function bNotes(r, t) {
  return CHORD_INT[t].map((interval) => r + interval);
}

function playChordAt(notes, t0, dur, sound, volScale = 1.0, withBass = false) {
  if (withBass) Sampler.playNote(sound, notes[0] - 12, t0, dur, 0.18 * volScale);
  notes.forEach((note, index) => Sampler.playNote(sound, note, t0, dur, (index === 0 ? 0.5 : 0.4) * volScale));
}

function playChordBar(chordDef, t0, spb, volScale = 1.0) {
  const notes = bNotes(chordDef.r + 12, chordDef.t);
  const pattern = currentVariation?.chordPattern?.length ? currentVariation.chordPattern : [0];
  pattern.forEach((offset, index) => {
    const hitT = t0 + offset * spb;
    const nextOffset = index + 1 < pattern.length ? pattern[index + 1] : 4;
    const dur = Math.max(0.18, (nextOffset - offset) * spb * 0.82);
    playChordAt(notes, hitT, dur, currentMainSound, volScale * (offset === 0 ? 1.0 : 0.82), false);
  });
}

function playBassBar(rootMidi, t0, spb, volScale = 1.0) {
  const pattern = currentVariation?.bassPattern?.length ? currentVariation.bassPattern : [[0, -12, 0.5]];
  pattern.forEach(([offset, semitones, length = 0.42]) => {
    Sampler.playNote(currentBassSound, rootMidi + semitones, t0 + offset * spb, spb * length, 0.26 * volScale);
  });
}

function currentSectionEnergy() {
  if (sezione === 'intro') return 0.94;
  if (sezione === 'rit') return currentVariation?.sectionLift || 1.12;
  return 1.0;
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
  const spb = 60 / bpm;
  const beatInBar = beat % 4;
  const barIndex = Math.floor(beat / 4) % 4;
  const chordDef = currentProgression.ch[barIndex];

  if (beat % 16 === 0) schedUI(() => syncStructureAtBeat(beat), t);

  playPercBeat(beatInBar, t);
  if (metronomeOn) metroClick(t, beatInBar === 0);

  if (beatInBar === 0) {
    const energy = currentSectionEnergy();
    playBassBar(chordDef.r + 12, t, spb, energy);
    playChordBar(chordDef, t, spb, energy);
    schedUI(() => highlightChord(barIndex), t);
  }

  schedUI(() => highlightBeat(beatInBar), t);

  if (endingArmed && !endingDone && barIndex === 3 && beatInBar === 3) {
    endingArmed = false;
    schedEnding(t + spb);
  }
}

function schedEnding(startT) {
  endingDone = true;
  if (schedTimer) {
    clearTimeout(schedTimer);
    schedTimer = null;
  }
  const spb = 60 / bpm;
  const chordDef = currentProgression.ch[0];
  const notes = bNotes(chordDef.r + 12, chordDef.t);
  masterGain.gain.cancelScheduledValues(startT - 0.04);
  masterGain.gain.setValueAtTime(masterGain.gain.value, startT - 0.04);
  masterGain.gain.linearRampToValueAtTime(0, startT - 0.001);
  masterGain.gain.setValueAtTime(Math.min(0.8, MIX_PROFILE.master), startT);
  playChordAt(notes, startT, spb * 0.9, currentMainSound, 1.0, true);
  playStyledDrum('kick', startT, { gain: 1.2 });
  schedUI(() => {
    highlightChord(0);
    highlightBeat(0);
  }, startT);
  schedUI(() => {
    stopAll();
    setStatus('✨ fine — sipario!', '');
  }, startT + spb);
}
