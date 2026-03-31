/**
 * V6 UI MANAGER
 * App standalone orientata agli stili, con struttura fissa 2 + 4 + 4 in 4/4.
 */

const VERSION = '0.6.1';
const INTRO_GIRI = 2;
const STROFA_GIRI = 4;
const RIT_GIRI = 4;
const LOOP_GIRI = STROFA_GIRI + RIT_GIRI;
const EASY_TEMPO_MIN = 85;
const EASY_TEMPO_MAX = 115;
const EASY_TEMPO_BASE = 100;
const CUSTOM_TEMPO_MIN = 60;
const CUSTOM_TEMPO_MAX = 200;

let isPlaying = false;
let isCountingIn = false;
let endingArmed = false;
let endingDone = false;
let metronomeOn = false;
let tempoMode = 'easy';
let customTempo = 120;
let bpm = 120;
let totalBeats = 0;
let sezione = 'intro';
let currentStyle = null;
let currentProgression = null;
let currentVariation = null;
let currentMainSound = 'grandpiano';
let currentBassSound = 'bass_electric';
let structureText = 'Intro 1/2';

function byId(id) {
  return document.getElementById(id);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pick(array, avoidValue = null) {
  if (!Array.isArray(array) || !array.length) return null;
  if (array.length === 1) return array[0];
  let candidate = array[Math.floor(Math.random() * array.length)];
  if (avoidValue == null) return candidate;
  for (let i = 0; i < 8 && candidate === avoidValue; i++) {
    candidate = array[Math.floor(Math.random() * array.length)];
  }
  return candidate;
}

function chordLabel(chordDef) {
  const root = NOTES[chordDef.r % 12];
  const suffixMap = {
    maj: '',
    min: 'm',
    dom7: '7',
    maj7: 'maj7',
    min7: 'm7',
    sus4: 'sus4',
    sus2: 'sus2',
    maj6: '6',
    dim7: 'dim7',
    aug: '+',
    min6: 'm6'
  };
  return `${root}${suffixMap[chordDef.t] ?? ''}`;
}

function setStatus(text) {
  byId('statusText').textContent = text;
}

function setStyleAccent(style) {
  const root = document.documentElement;
  root.style.setProperty('--accent', style.accent.primary);
  root.style.setProperty('--accent-surface', style.accent.surface);
  root.style.setProperty('--accent-glow', style.accent.glow);
}

function renderStyleOptions() {
  byId('styleSelect').innerHTML = STYLE_DEFS.map((style) => (
    `<option value="${style.id}">${style.label}</option>`
  )).join('');
}

function pickTempoForStyle(style) {
  if (style.tempoRange.default) return style.tempoRange.default;
  return Math.round((style.tempoRange.min + style.tempoRange.max) / 2);
}

function pickProgression(style, avoidName = null) {
  if (!style.progressionPool.length) return null;
  if (!avoidName || style.progressionPool.length === 1) return pick(style.progressionPool);
  let candidate = pick(style.progressionPool);
  for (let i = 0; i < 8 && candidate?.name === avoidName; i++) {
    candidate = pick(style.progressionPool);
  }
  return candidate;
}

function pickVariation(style, avoidId = null) {
  if (!style.variationSet.length) return null;
  if (!avoidId || style.variationSet.length === 1) return pick(style.variationSet);
  let candidate = pick(style.variationSet);
  for (let i = 0; i < 8 && candidate?.id === avoidId; i++) {
    candidate = pick(style.variationSet);
  }
  return candidate;
}

function pickInstrument(pool, fallback, avoidValue = null) {
  return pick(pool, avoidValue) || fallback;
}

function refreshStyleCard() {
  byId('styleIcon').textContent = currentStyle.icon;
  byId('styleName').textContent = currentStyle.label;
  byId('styleSubtitle').textContent = currentStyle.subtitle;
  byId('variationName').textContent = currentVariation.label;
  byId('tempoBadge').textContent = `${bpm} BPM`;
  byId('styleMeta').textContent = `${SOUND_NAMES[currentMainSound]} + ${SOUND_NAMES[currentBassSound]}`;
}

function syncTempoUI() {
  byId('tempoVal').textContent = bpm;
}

function refreshTempoModeUI() {
  ['easy', 'normal', 'custom'].forEach((mode) => {
    byId(`tempoMode${mode.charAt(0).toUpperCase()}${mode.slice(1)}`)?.classList.toggle('active', tempoMode === mode);
  });
  const isCustom = tempoMode === 'custom';
  byId('tempoMinus')?.classList.toggle('disabled', !isCustom);
  byId('tempoPlus')?.classList.toggle('disabled', !isCustom);
}

function computeEasyTempo() {
  const nb = Math.round(EASY_TEMPO_BASE + (Math.random() - 0.5) * 30);
  return clamp(nb, EASY_TEMPO_MIN, EASY_TEMPO_MAX);
}

function computeNormalTempo() {
  return pickTempoForStyle(currentStyle);
}

function applyTempoMode({ preserveCustom = true } = {}) {
  if (tempoMode === 'easy') bpm = computeEasyTempo();
  else if (tempoMode === 'normal') bpm = computeNormalTempo();
  else if (preserveCustom) bpm = customTempo;
  else customTempo = bpm;
  syncTempoUI();
  refreshTempoModeUI();
  refreshStyleCard();
}

function setTempo(v) {
  const safeTempo = clamp(v, CUSTOM_TEMPO_MIN, CUSTOM_TEMPO_MAX);
  bpm = safeTempo;
  if (tempoMode === 'custom') customTempo = safeTempo;
  syncTempoUI();
  refreshStyleCard();
}

function setTempoMode(mode) {
  if (tempoMode === mode) {
    if (mode !== 'custom') applyTempoMode();
    return;
  }
  tempoMode = mode;
  if (mode === 'custom') {
    customTempo = bpm;
    applyTempoMode();
    return;
  }
  applyTempoMode({ preserveCustom: true });
}

function adjustCustomTempo(delta) {
  if (tempoMode !== 'custom') return;
  setTempo(customTempo + delta);
}

function refreshChords() {
  byId('chordGrid').innerHTML = currentProgression.ch.map((chordDef, index) => `
    <article class="chord-card" id="chordCard${index}">
      <div class="chord-roman">${currentProgression.fn[index] || 'I'}</div>
      <div class="chord-name">${chordLabel(chordDef)}</div>
    </article>
  `).join('');
}

function refreshProgress() {
  const introActive = sezione === 'intro';
  const strofaActive = sezione === 'strofa';
  const ritActive = sezione === 'rit';
  byId('pbIntro').className = `progress-block${introActive ? ' active-intro' : ''}`;
  byId('pbStrofa').className = `progress-block${strofaActive ? ' active-strofa' : ''}`;
  byId('pbRit').className = `progress-block${ritActive ? ' active-rit' : ''}`;

  byId('pvIntro').textContent = sezione === 'intro' ? structureText.replace('Intro ', '') : '✓';
  byId('pvStrofa').textContent = sezione === 'strofa' ? structureText.replace('Strofa ', '') : (sezione === 'intro' ? '—' : '✓');
  byId('pvRit').textContent = sezione === 'rit' ? structureText.replace('Ritornello ', '') : (sezione === 'intro' ? '—' : '');

  document.body.classList.remove('sec-intro', 'sec-strofa', 'sec-rit');
  document.body.classList.add(`sec-${sezione}`);
}

function resetBeatHighlights() {
  for (let i = 1; i <= 4; i++) byId(`cb${i}`).classList.remove('active', 'count-in-active');
}

function highlightBeat(beatInBar) {
  resetBeatHighlights();
  byId(`cb${beatInBar + 1}`).classList.add('active');
}

function highlightChord(index) {
  for (let i = 0; i < 4; i++) byId(`chordCard${i}`)?.classList.remove('active');
  byId(`chordCard${index}`)?.classList.add('active');
}

function computeStructureForBeat(beat) {
  const giroIndex = Math.floor(beat / 16);
  if (giroIndex < INTRO_GIRI) {
    return { sezione: 'intro', text: `Intro ${giroIndex + 1}/${INTRO_GIRI}` };
  }

  const loopIndex = (giroIndex - INTRO_GIRI) % LOOP_GIRI;
  if (loopIndex < STROFA_GIRI) {
    return { sezione: 'strofa', text: `Strofa ${loopIndex + 1}/${STROFA_GIRI}` };
  }

  return { sezione: 'rit', text: `Ritornello ${loopIndex - STROFA_GIRI + 1}/${RIT_GIRI}` };
}

function syncStructureAtBeat(beat) {
  const state = computeStructureForBeat(beat);
  sezione = state.sezione;
  structureText = state.text;
  refreshProgress();
}

function resetTransportUI() {
  totalBeats = 0;
  endingArmed = false;
  endingDone = false;
  syncStructureAtBeat(0);
  resetBeatHighlights();
  highlightChord(0);
  byId('btnEnding')?.classList.remove('armed');
}

async function loadCurrentInstruments() {
  await Sampler.loadStartupPreset(currentMainSound, currentBassSound);
}

function refreshInstrumentSelectors() {
  const mainSelect = byId('mainInstrumentSelect');
  const bassSelect = byId('bassInstrumentSelect');
  mainSelect.innerHTML = currentStyle.mainInstrumentPool.map((id) => `<option value="${id}">${SOUND_NAMES[id]}</option>`).join('');
  bassSelect.innerHTML = currentStyle.bassInstrumentPool.map((id) => `<option value="${id}">${SOUND_NAMES[id]}</option>`).join('');
  mainSelect.value = currentMainSound;
  bassSelect.value = currentBassSound;
}

async function generateStyleState(style, { avoidProgressionName = null, avoidVariationId = null } = {}) {
  currentStyle = style;
  currentProgression = pickProgression(style, avoidProgressionName) || style.progressionPool[0];
  currentVariation = pickVariation(style, avoidVariationId) || style.variationSet[0];
  currentMainSound = pickInstrument(style.mainInstrumentPool, 'grandpiano', currentMainSound);
  currentBassSound = pickInstrument(style.bassInstrumentPool, 'bass_electric', currentBassSound);

  setStyleAccent(style);
  applyTempoMode({ preserveCustom: true });
  await loadCurrentInstruments();
  refreshInstrumentSelectors();
  refreshStyleCard();
  refreshChords();
  resetTransportUI();
}

async function hardStop() {
  isPlaying = false;
  isCountingIn = false;
  if (schedTimer) {
    clearTimeout(schedTimer);
    schedTimer = null;
  }
  if (Array.isArray(countInTimers)) {
    countInTimers.forEach((timer) => clearTimeout(timer));
    countInTimers = [];
  }
  resetTransportUI();
  byId('playBtn').disabled = false;
  byId('stopBtn').disabled = true;
  byId('btnEnding').disabled = true;
}

async function startPlay() {
  initAudio();
  if (ctx.state === 'suspended') await ctx.resume();
  await loadCurrentInstruments();
  await hardStop();

  setStatus(`Count-in ${currentStyle.label}`);
  byId('playBtn').disabled = true;
  byId('stopBtn').disabled = false;
  byId('btnEnding').disabled = false;

  doCountIn((startTime) => {
    totalBeats = 0;
    syncStructureAtBeat(0);
    nextBeatTime = startTime;
    isPlaying = true;
    endingArmed = false;
    endingDone = false;
    setStatus(`${currentStyle.label} · ${currentVariation.label}`);
    scheduler();
  });
}

async function stopAll() {
  await hardStop();
  setStatus(`Pronto: ${currentStyle.label}`);
}

async function restartFromTop() {
  await hardStop();
  await startPlay();
}

async function applyStyle(styleId, { keepStyle = false } = {}) {
  const style = keepStyle ? currentStyle : findStyleById(styleId);
  const previousProgression = currentProgression?.name || null;
  const previousVariation = currentVariation?.id || null;

  byId('styleSelect').value = style.id;
  await generateStyleState(style, {
    avoidProgressionName: previousProgression,
    avoidVariationId: previousVariation
  });
  setStatus(`Pronto: ${style.label}`);

  if (isPlaying || isCountingIn) await restartFromTop();
}

async function randomizeStyle() {
  const nextStyle = pick(STYLE_DEFS, currentStyle?.id);
  if (!nextStyle) return;
  await applyStyle(nextStyle.id);
}

async function regenerateCurrentStyle() {
  if (!currentStyle) return;
  await applyStyle(currentStyle.id, { keepStyle: true });
}

function toggleMetronome() {
  metronomeOn = !metronomeOn;
  byId('metroBtn').textContent = metronomeOn ? 'Metronomo ON' : 'Metronomo OFF';
  byId('metroBtn').classList.toggle('is-on', metronomeOn);
}

async function selectMainInstrument(value) {
  currentMainSound = value;
  await Sampler.loadInstrument(currentMainSound);
  refreshStyleCard();
  if (isPlaying || isCountingIn) await restartFromTop();
}

async function selectBassInstrument(value) {
  currentBassSound = value;
  await Sampler.loadInstrument(currentBassSound);
  refreshStyleCard();
  if (isPlaying || isCountingIn) await restartFromTop();
}

function armEnding() {
  if (!isPlaying || endingDone) return;
  endingArmed = true;
  byId('btnEnding').classList.add('armed');
  setStatus('🎬 Alessandro sa che stai finendo — chiudi il giro', 'end');
}

async function handlePlayClick() {
  if (isPlaying || isCountingIn) return;
  await startPlay();
}

document.addEventListener('DOMContentLoaded', async () => {
  byId('versionText').textContent = VERSION;
  renderStyleOptions();
  byId('styleSelect').addEventListener('change', async (event) => {
    await applyStyle(event.target.value);
  });
  byId('randomStyleBtn').addEventListener('click', randomizeStyle);
  byId('styleCard').addEventListener('click', regenerateCurrentStyle);
  byId('playBtn').addEventListener('click', handlePlayClick);
  byId('stopBtn').addEventListener('click', stopAll);
  byId('metroBtn').addEventListener('click', toggleMetronome);
  byId('btnEnding').addEventListener('click', armEnding);
  byId('tempoModeEasy').addEventListener('click', () => setTempoMode('easy'));
  byId('tempoModeNormal').addEventListener('click', () => setTempoMode('normal'));
  byId('tempoModeCustom').addEventListener('click', () => setTempoMode('custom'));
  byId('tempoMinus').addEventListener('click', () => adjustCustomTempo(-5));
  byId('tempoPlus').addEventListener('click', () => adjustCustomTempo(5));
  byId('mainInstrumentSelect').addEventListener('change', async (event) => selectMainInstrument(event.target.value));
  byId('bassInstrumentSelect').addEventListener('change', async (event) => selectBassInstrument(event.target.value));

  await applyStyle(STYLE_DEFS[0].id);
  byId('stopBtn').disabled = true;
  byId('btnEnding').disabled = true;
});
