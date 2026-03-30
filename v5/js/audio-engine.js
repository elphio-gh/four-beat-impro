/**
 * MOTORE AUDIO
 * Gestisce Web Audio API, sintesi sonora, scheduler e percussioni.
 */

let ctx = null, masterGain, dryGain, revGain, revNode;
let nextBeatTime = 0, schedTimer = null;
const LOOK_AHEAD = 0.14, TICK_MS = 25;

// AUDIO INIT
function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain(); masterGain.gain.value = 0.8;
  dryGain = ctx.createGain(); dryGain.gain.value = 0.7;
  revGain = ctx.createGain(); revGain.gain.value = 0.3;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.12;
  revNode = buildReverb();
  dryGain.connect(comp); revNode.connect(revGain); revGain.connect(comp); comp.connect(masterGain); masterGain.connect(ctx.destination);
}

function buildReverb() {
  const cv = ctx.createConvolver(), len = ctx.sampleRate * 2.4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  cv.buffer = buf; return cv;
}

function mf(m) { return 440 * Math.pow(2, (m - 69) / 12); }

// INSTRUMENT ENGINES
function playNote(midi, t0, dur, vol, sound) {
  Sampler.playNote(sound, midi, t0, dur, vol);
}

function playChordAt(notes, t0, dur, sound, volScale = 1.0, withBass = false) {
  if (withBass) playNote(notes[0] - 12, t0, dur, 0.46 * volScale, sound);
  notes.forEach((n, i) => playNote(n, t0, dur, (i === 0 ? 0.24 : 0.19) * volScale, sound));
}

// PERCUSSION
function kick(t) { Sampler.playDrum('kick', 36, t, 0.4, 0.65 * 1.5); }
function snare(t, vol = 0.4) { Sampler.playDrum('snare', 48, t, 0.22, vol * 1.5); }
function hihat(t, vol = 0.12, open = false) { 
  const dur = open ? 0.38 : 0.07;
  Sampler.playDrum('hihat', 84, t, dur, vol * 2.0); 
}
function rim(t) { Sampler.playDrum('rim', 76, t, 0.05, 0.3); }
function metroClick(t, isOne) {
  const vol = isOne ? 0.9 : 0.5;
  const pit = isOne ? 84 : 76;
  Sampler.playDrum('rim', pit, t, 0.05, vol * 1.5);
}
function clickSound(t, vol = 0.65) { 
  Sampler.playDrum('rim', 76, t, 0.05, vol * 1.5); 
}

function perc(beat, t, type) {
  const spb = 60 / bpm;
  switch (type) {
    case 'swing': hihat(t, 0.09); if (beat === 0 || beat === 2) kick(t); if (beat === 1 || beat === 3) snare(t, 0.32); break;
    case 'rock': hihat(t, 0.11); if (beat === 0 || beat === 2) kick(t); if (beat === 1 || beat === 3) snare(t, 0.38); break;
    case 'funk': hihat(t, 0.07); if (beat === 0) kick(t); if (beat === 1) snare(t, 0.28); if (beat === 2) { kick(t); kick(t + spb * 0.5); } if (beat === 3) { snare(t, 0.32); hihat(t + spb * 0.5, 0.06); } break;
    case 'bossa': if (beat === 0 || beat === 2) kick(t); rim(t); if (beat === 1 || beat === 3) hihat(t, 0.14, true); break;
    case 'march': if (beat === 0) { kick(t); snare(t, 0.45); } if (beat === 1) hihat(t, 0.07); if (beat === 2) kick(t); if (beat === 3) { snare(t, 0.28); hihat(t, 0.07); } break;
    case 'latin': hihat(t, 0.06); if (beat === 0) kick(t); if (beat === 1) rim(t); if (beat === 2) { kick(t); rim(t + spb * 0.33); } if (beat === 3) snare(t, 0.22); break;
    case 'gospel': hihat(t, 0.08); if (beat === 0) kick(t); if (beat === 1) snare(t, 0.48); if (beat === 2) { kick(t); kick(t + spb * 0.5); } if (beat === 3) snare(t, 0.42); break;
    case 'tango': if (beat === 0) { kick(t); snare(t, 0.38); } if (beat === 2) kick(t); if (beat === 1 || beat === 3) rim(t); break;
  }
}

function playBass(rootMidi, t0, spb, patternIdx) {
  const pattern = BASS_PATTERNS[patternIdx % BASS_PATTERNS.length];
  
  pattern.forEach(([offset, semitones]) => {
    const note = rootMidi + semitones;
    const hitT = t0 + offset * spb;
    const dur = spb * 0.55;

    Sampler.playNote('bass', note, hitT, dur, 0.6);
  });
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
  perc(bInC, t, theme.perc);
  if (metronomeOn) metroClick(t, bInC === 0);
  if (bInC === 0) {
    const cd = theme.ch[cIdx];
    if (!endingDone) playBass(cd.r + 12, t, spb, bassPatterns[cIdx]);
    if (!endingDone) {
      const notes = bNotes(cd.r + 12, cd.t);
      const pattern = RHYTHM_PATTERNS[chordRhythms[cIdx]];
      pattern.forEach((offset, hi) => {
        const hitT = t + offset * spb;
        const nextOff = hi + 1 < pattern.length ? pattern[hi + 1] : 4;
        const dur = (nextOff - offset) * spb * 0.86;
        const isDown = offset === 0;
        playChordAt(notes, hitT, dur, theme.sound, isDown ? 1.0 : 0.78, false);
      });
    }
    schedUI(() => highlightChord(cIdx), t);
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
  masterGain.gain.setValueAtTime(0.8, startT);
  playChordAt(notes, startT, spb * 0.9, theme.sound, 1.0, true);
  kick(startT);
  schedUI(() => { highlightChord(0); highlightBeat(0); }, startT);
  schedUI(() => { stopAll(true); setStatus('✨ fine — sipario!', ''); }, startT + spb * 1);
}
