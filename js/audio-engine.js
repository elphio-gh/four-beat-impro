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
  const f = mf(midi);
  switch (sound) {
    case 'grandpiano': {
      const g = ctx.createGain(), filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 5200; filt.Q.value = 0.5;
      [[1, 1], [2, 0.5], [3, 0.25], [4, 0.12]].forEach(([r, a]) => { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f * r; const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(filt); o.start(t0); o.stop(t0 + dur + 0.4); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.005); g.gain.exponentialRampToValueAtTime(vol * 0.45, t0 + 0.1); g.gain.exponentialRampToValueAtTime(vol * 0.15, t0 + dur * 0.75); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.3);
      filt.connect(g); g.connect(dryGain); g.connect(revNode); break;
    }
    case 'jazzpiano': {
      const g = ctx.createGain(), filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 3000; filt.Q.value = 0.4;
      [[1, 1], [2, 0.45], [3, 0.18]].forEach(([r, a]) => { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f * r; const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(filt); o.start(t0); o.stop(t0 + dur + 0.25); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.007); g.gain.exponentialRampToValueAtTime(vol * 0.38, t0 + 0.14); g.gain.exponentialRampToValueAtTime(vol * 0.12, t0 + dur * 0.85); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.18);
      filt.connect(g); g.connect(dryGain); g.connect(revNode); break;
    }
    case 'elecpiano': {
      const g = ctx.createGain();
      const bell = ctx.createOscillator(); bell.type = 'sine'; bell.frequency.value = f * 8.5;
      const bg = ctx.createGain(); bg.gain.setValueAtTime(vol * 0.4, t0); bg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
      bell.connect(bg); bg.connect(dryGain);
      const tine = ctx.createOscillator(); tine.type = 'triangle'; tine.frequency.value = f;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(vol * 0.35, t0 + 0.18); g.gain.exponentialRampToValueAtTime(vol * 0.1, t0 + dur); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.1);
      tine.connect(g); g.connect(dryGain); g.connect(revNode);
      bell.start(t0); bell.stop(t0 + 0.12); tine.start(t0); tine.stop(t0 + dur + 0.15); break;
    }
    case 'organ': {
      const g = ctx.createGain();
      [[1, 1], [2, 0.75], [3, 0.5], [4, 0.42], [6, 0.22], [8, 0.15]].forEach(([n, a]) => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * n; const og = ctx.createGain(); og.gain.value = a * vol * 0.3; o.connect(og); og.connect(g); o.start(t0); o.stop(t0 + dur + 0.06); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + 0.015); g.gain.setValueAtTime(1, t0 + dur - 0.02); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.04);
      g.connect(dryGain); g.connect(revNode); break;
    }
    case 'pipeorgan': {
      const g = ctx.createGain();
      [[1, 1], [2, 0.6], [3, 0.4], [5, 0.3], [7, 0.15]].forEach(([n, a]) => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * n; const og = ctx.createGain(); og.gain.value = a * vol * 0.28; o.connect(og); og.connect(g); o.start(t0); o.stop(t0 + dur + 0.2); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + 0.06); g.gain.setValueAtTime(1, t0 + dur - 0.08); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.15);
      g.connect(dryGain); g.connect(revNode); break;
    }
    case 'accordion': {
      const g = ctx.createGain(), filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 900; filt.Q.value = 2.2;
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5.8;
      const lfog = ctx.createGain(); lfog.gain.value = vol * 0.05; lfo.connect(lfog); lfog.connect(g.gain);
      [0, 7, -7].forEach(d => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(filt); o.start(t0); o.stop(t0 + dur + 0.06); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol * 0.6, t0 + 0.03); g.gain.setValueAtTime(vol * 0.6, t0 + dur - 0.05); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.05);
      filt.connect(g); g.connect(dryGain); g.connect(revNode); lfo.start(t0); lfo.stop(t0 + dur + 0.06); break;
    }
    case 'strings': {
      const g = ctx.createGain(), filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 2400; filt.Q.value = 0.7;
      [0, 6, -6].forEach(d => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(filt); o.start(t0); o.stop(t0 + dur + 0.45); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.24); g.gain.setValueAtTime(vol, t0 + dur - 0.14); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.4);
      filt.connect(g); g.connect(dryGain); g.connect(revNode); break;
    }
    case 'brass': {
      const g = ctx.createGain(), filt = ctx.createBiquadFilter(); filt.type = 'lowpass';
      filt.frequency.setValueAtTime(700, t0); filt.frequency.linearRampToValueAtTime(4200, t0 + 0.06); filt.frequency.linearRampToValueAtTime(2400, t0 + dur);
      [['sawtooth', 0], ['square', 4]].forEach(([tp, d]) => { const o = ctx.createOscillator(); o.type = tp; o.frequency.value = f; o.detune.value = d; o.connect(filt); o.start(t0); o.stop(t0 + dur + 0.06); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.03); g.gain.linearRampToValueAtTime(vol * 0.7, t0 + 0.12); g.gain.setValueAtTime(vol * 0.7, t0 + dur - 0.05); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.04);
      filt.connect(g); g.connect(dryGain); g.connect(revNode); break;
    }
    case 'nylonguitar': {
      const g = ctx.createGain(), filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 2800; filt.Q.value = 1.2;
      [[1, 1], [2, 0.38], [3, 0.14]].forEach(([r, a]) => { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f * r; const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(filt); o.start(t0); o.stop(t0 + dur + 0.06); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.003); g.gain.exponentialRampToValueAtTime(vol * 0.28, t0 + 0.26); g.gain.exponentialRampToValueAtTime(0.001, t0 + Math.min(dur, 1.5));
      filt.connect(g); g.connect(dryGain); g.connect(revNode); break;
    }
    case 'distguitar': {
      const g = ctx.createGain(), dist = ctx.createWaveShaper();
      const cv = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i * 2 / 256 - 1; cv[i] = x < 0 ? -Math.pow(-x, 0.65) : Math.pow(x, 0.65); } dist.curve = cv;
      const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 3200;
      [0, 5, -5].forEach(d => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(dist); o.start(t0); o.stop(t0 + dur + 0.06); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.012); g.gain.setValueAtTime(vol * 0.78, t0 + dur - 0.05); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.04);
      dist.connect(filt); filt.connect(g); g.connect(dryGain); g.connect(revNode); break;
    }
    case 'steelguitar': {
      const g = ctx.createGain(), filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 3600;
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const slide = ctx.createOscillator(); slide.type = 'sine'; slide.frequency.value = f * 1.015;
      const sg = ctx.createGain(); sg.gain.value = 0.28;
      o.connect(filt); slide.connect(sg); sg.connect(filt);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.004); g.gain.exponentialRampToValueAtTime(vol * 0.32, t0 + 0.28); g.gain.exponentialRampToValueAtTime(0.001, t0 + Math.min(dur, 1.9));
      filt.connect(g); g.connect(dryGain); g.connect(revNode);
      o.start(t0); o.stop(t0 + dur + 0.06); slide.start(t0); slide.stop(t0 + dur + 0.06); break;
    }
    case 'honkytonk': {
      const g = ctx.createGain();
      [-15, 0, 14].forEach(d => { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = d; o.connect(g); o.start(t0); o.stop(t0 + dur + 0.18); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.004); g.gain.exponentialRampToValueAtTime(vol * 0.28, t0 + 0.22); g.gain.exponentialRampToValueAtTime(vol * 0.07, t0 + dur * 0.9); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.14);
      g.connect(dryGain); g.connect(revNode); break;
    }
    case 'synthpad': {
      const g = ctx.createGain(), filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 1800; filt.Q.value = 0.5;
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.42;
      const lfog = ctx.createGain(); lfog.gain.value = 200; lfo.connect(lfog); lfog.connect(filt.frequency);
      [['sawtooth', 0], ['sawtooth', 8], ['square', -8]].forEach(([tp, d]) => { const o = ctx.createOscillator(); o.type = tp; o.frequency.value = f; o.detune.value = d; o.connect(filt); o.start(t0); o.stop(t0 + dur + 0.55); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.32); g.gain.setValueAtTime(vol, t0 + dur - 0.22); g.gain.linearRampToValueAtTime(0, t0 + dur + 0.5);
      filt.connect(g); g.connect(dryGain); g.connect(revNode); lfo.start(t0); lfo.stop(t0 + dur + 0.55); break;
    }
    case 'vibraphone': {
      const g = ctx.createGain();
      [[1, 1], [2.756, 0.5], [5.4, 0.22], [8.9, 0.08]].forEach(([r, a]) => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * r; const og = ctx.createGain(); og.gain.value = a * vol * 0.52; o.connect(og); og.connect(g); o.start(t0); o.stop(t0 + dur + 0.7); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + 0.003); g.gain.exponentialRampToValueAtTime(0.28, t0 + 0.5); g.gain.exponentialRampToValueAtTime(0.001, t0 + Math.min(dur + 0.6, 3.8));
      g.connect(dryGain); g.connect(revNode); break;
    }
    case 'harpsichord': {
      const g = ctx.createGain(), filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 1900; filt.Q.value = 1.6;
      [[1, 'square'], [2, 'sawtooth'], [3, 'square']].forEach(([r, tp], i) => { const o = ctx.createOscillator(); o.type = tp; o.frequency.value = f * r; const og = ctx.createGain(); og.gain.value = 1 / (i + 1); o.connect(og); og.connect(filt); o.start(t0); o.stop(t0 + 0.9); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.002); g.gain.exponentialRampToValueAtTime(vol * 0.12, t0 + 0.14); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.8);
      filt.connect(g); g.connect(dryGain); g.connect(revNode); break;
    }
    case 'marimba': {
      const g = ctx.createGain();
      [[1, 1], [3, 0.48], [6, 0.14]].forEach(([r, a]) => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * r; const og = ctx.createGain(); og.gain.value = a * vol * 0.52; o.connect(og); og.connect(g); o.start(t0); o.stop(t0 + 1.6); });
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.28); g.gain.exponentialRampToValueAtTime(0.001, t0 + Math.min(dur, 1.5));
      g.connect(dryGain); g.connect(revNode); break;
    }
    default: playNote(midi, t0, dur, vol, 'grandpiano');
  }
}

function playChordAt(notes, t0, dur, sound, volScale = 1.0, withBass = false) {
  if (withBass) playNote(notes[0] - 12, t0, dur, 0.46 * volScale, sound);
  notes.forEach((n, i) => playNote(n, t0, dur, (i === 0 ? 0.24 : 0.19) * volScale, sound));
}

// PERCUSSION
function kick(t) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(155, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.15); g.gain.setValueAtTime(0.65, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.33); o.connect(g); g.connect(dryGain); o.start(t); o.stop(t + 0.4); }
function snare(t, vol = 0.4) { const sz = Math.floor(ctx.sampleRate * 0.19), buf = ctx.createBuffer(1, sz, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1; const s = ctx.createBufferSource(); s.buffer = buf; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 0.65; const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.17); const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 165; const og = ctx.createGain(); og.gain.setValueAtTime(vol * 0.3, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.07); s.connect(bp); bp.connect(g); g.connect(dryGain); o.connect(og); og.connect(dryGain); s.start(t); s.stop(t + 0.22); o.start(t); o.stop(t + 0.1); }
function hihat(t, vol = 0.12, open = false) { const dur = open ? 0.38 : 0.07, sz = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, sz, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1; const s = ctx.createBufferSource(); s.buffer = buf; const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7500; const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(hp); hp.connect(g); g.connect(dryGain); s.start(t); s.stop(t + dur + 0.02); }
function rim(t) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = 1500; g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.033); o.connect(g); g.connect(dryGain); o.start(t); o.stop(t + 0.04); }
function metroClick(t, isOne) {
  const freq = isOne ? 880 : 1320;
  const vol = isOne ? 1.8 : 1.2;
  const decay = isOne ? 0.055 : 0.035;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + decay);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(t);
  osc.stop(t + decay + 0.005);
}
function clickSound(t, vol = 0.65) { const sz = Math.floor(ctx.sampleRate * 0.008), buf = ctx.createBuffer(1, sz, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < sz; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / sz, 1.5); const s = ctx.createBufferSource(); s.buffer = buf; const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.008); s.connect(g); g.connect(masterGain); s.start(t); s.stop(t + 0.01); }

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

// BASS ENGINES
const BASS_ENGINES = [
  function bassElectric(freq, hitT, dur) {
    const osc = ctx.createOscillator(), g = ctx.createGain(), filt = ctx.createBiquadFilter();
    osc.type = 'sawtooth'; osc.frequency.value = freq;
    filt.type = 'lowpass'; filt.Q.value = 3.5;
    filt.frequency.setValueAtTime(800, hitT); filt.frequency.exponentialRampToValueAtTime(140, hitT + 0.18);
    g.gain.setValueAtTime(0, hitT); g.gain.linearRampToValueAtTime(0.68, hitT + 0.012);
    g.gain.exponentialRampToValueAtTime(0.25, hitT + 0.2); g.gain.exponentialRampToValueAtTime(0.001, hitT + dur);
    osc.connect(filt); filt.connect(g); g.connect(dryGain);
    osc.start(hitT); osc.stop(hitT + dur + 0.05);
  },
  function bassFretless(freq, hitT, dur) {
    const osc = ctx.createOscillator(), lfo = ctx.createOscillator(), lfog = ctx.createGain(), g = ctx.createGain(), filt = ctx.createBiquadFilter();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(freq * 0.97, hitT); osc.frequency.linearRampToValueAtTime(freq, hitT + 0.04);
    lfo.type = 'sine'; lfo.frequency.value = 5.5; lfog.gain.value = freq * 0.012;
    lfo.connect(lfog); lfog.connect(osc.frequency);
    filt.type = 'lowpass'; filt.frequency.value = 600; filt.Q.value = 1.2;
    g.gain.setValueAtTime(0, hitT); g.gain.linearRampToValueAtTime(0.66, hitT + 0.02);
    g.gain.exponentialRampToValueAtTime(0.22, hitT + 0.3); g.gain.exponentialRampToValueAtTime(0.001, hitT + dur);
    osc.connect(filt); filt.connect(g); g.connect(dryGain); g.connect(revNode);
    osc.start(hitT); osc.stop(hitT + dur + 0.1); lfo.start(hitT); lfo.stop(hitT + dur + 0.1);
  },
  function bassSlap(freq, hitT, dur) {
    const click = ctx.createOscillator(), cg = ctx.createGain();
    click.type = 'square'; click.frequency.setValueAtTime(freq * 3, hitT); click.frequency.exponentialRampToValueAtTime(freq, hitT + 0.025);
    cg.gain.setValueAtTime(0.5, hitT); cg.gain.exponentialRampToValueAtTime(0.001, hitT + 0.04);
    click.connect(cg); cg.connect(dryGain); click.start(hitT); click.stop(hitT + 0.05);
    const osc = ctx.createOscillator(), g = ctx.createGain(), filt = ctx.createBiquadFilter();
    osc.type = 'sawtooth'; osc.frequency.value = freq; filt.type = 'lowpass'; filt.frequency.value = 400; filt.Q.value = 2;
    g.gain.setValueAtTime(0, hitT + 0.01); g.gain.linearRampToValueAtTime(0.60, hitT + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, hitT + Math.min(dur, 0.35));
    osc.connect(filt); filt.connect(g); g.connect(dryGain);
    osc.start(hitT + 0.01); osc.stop(hitT + 0.45);
  },
  function bassMotown(freq, hitT, dur) {
    const osc = ctx.createOscillator(), dist = ctx.createWaveShaper(), g = ctx.createGain(), filt = ctx.createBiquadFilter();
    osc.type = 'triangle'; osc.frequency.value = freq;
    const cv = new Float32Array(128); for (let i = 0; i < 128; i++) { const x = i * 2 / 128 - 1; cv[i] = Math.tanh(x * 2.5) * 0.7; } dist.curve = cv;
    filt.type = 'bandpass'; filt.frequency.value = 250; filt.Q.value = 0.9;
    g.gain.setValueAtTime(0, hitT); g.gain.linearRampToValueAtTime(0.64, hitT + 0.015);
    g.gain.exponentialRampToValueAtTime(0.2, hitT + 0.22); g.gain.exponentialRampToValueAtTime(0.001, hitT + dur);
    osc.connect(dist); dist.connect(filt); filt.connect(g); g.connect(dryGain);
    osc.start(hitT); osc.stop(hitT + dur + 0.05);
  }
];

function playBass(rootMidi, t0, spb, patternIdx) {
  const pattern = BASS_PATTERNS[patternIdx % BASS_PATTERNS.length];
  const engine = BASS_ENGINES[bassEngine];
  pattern.forEach(([offset, semitones]) => {
    const note = rootMidi + semitones;
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const hitT = t0 + offset * spb;
    const dur = spb * 0.55;
    engine(freq, hitT, dur);
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
