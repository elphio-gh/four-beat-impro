/**
 * V6 UI MANAGER
 * App standalone orientata agli stili, con struttura fissa 2 + 4 + 4 in 4/4.
 */

const VERSION = '0.6.3';
const INTRO_GIRI = 2;
const STROFA_GIRI = 4;
const RIT_GIRI = 4;
const LOOP_GIRI = STROFA_GIRI + RIT_GIRI;
const EASY_TEMPO_FACTOR = 2 / 3;
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
let statusSticky = false;
let lastStructureState = null;

const ENDING_MESSAGES = {
  1: [
    '🎬 Finale chiamato sul primo accordo del giro: perfetto, Alessandro capisce subito e vi segue senza sforzo.',
    '🎬 Hai chiamato il finale sul primo accordo: chiarissimo, Alessandro lo sente al volo.',
    '🎬 Primo accordo del giro: ottima chiamata finale, Alessandro entra con sicurezza.'
  ],
  2: [
    '🎬 Finale chiamato sul secondo accordo del giro: ancora bene, Alessandro ha tempo di reagire.',
    '🎬 Hai chiamato il finale sul secondo accordo: va bene, Alessandro capisce ancora in tempo.',
    '🎬 Secondo accordo del giro: buona chiamata finale, Alessandro riesce a leggerti subito.'
  ],
  3: [
    '🎬 Hai chiamato il finale sul terzo accordo del giro: si può fare, ma per Alessandro arriva tardi. Parte l\'occhiataccia.',
    '🎬 Finale sul terzo accordo: Alessandro ti segue lo stesso, ma ti guarda malissimo. Meglio prima.',
    '🎬 Terzo accordo del giro: chiamata tirata. Alessandro capisce, ma con evidente sofferenza.'
  ],
  4: [
    '🎬 Hai chiamato il finale sul quarto accordo del giro: troppo tardi. Alessandro sente tutto all\'ultimo e ti fulmina con lo sguardo.',
    '🎬 Finale sul quarto accordo: chiamata disperata. Alessandro ti segue, ma la faccia dice tutto.',
    '🎬 Quarto accordo del giro: tecnicamente possibile, umanamente crudele. Alessandro non approva.'
  ]
};

const STRUCTURE_MESSAGES = {
  intro1: [
    '👂 Intro: ascolta il giro, senti bene dove cade l\'uno e non avere fretta di entrare.',
    '👂 Intro: resta dentro il tempo e fatti guidare dal giro prima di cantare.',
    '👂 Intro: ascolta, conta e lascia che il giro ti entri nelle gambe.',
    '👂 Intro: prima di fare qualunque cosa, senti bene dove respira il giro.',
    '👂 Intro: non pensare ancora al testo, pensa a sentire bene il passo del quattro.'
  ],
  intro2: [
    '⏱️ Ancora intro: prepara l\'attacco, tra poco parte la strofa.',
    '⏱️ Ultimo giro di intro: tieniti pronto, sta arrivando il momento di entrare.',
    '⏱️ Fine intro in vista: resta sul conteggio, la strofa sta per partire.',
    '⏱️ Ultimo giro di intro: prepara il fiato, tra poco si entra davvero.',
    '⏱️ Ancora pochi beat: senti bene l\'uno, la strofa sta arrivando.'
  ],
  strofaStart: [
    '🎤 VIA: entra con la strofa adesso.',
    '🎤 Strofa: questo e il momento giusto per cominciare a cantare.',
    '🎤 Parti con la strofa ora, senza aspettare il giro dopo.',
    '🎤 Adesso: attacca la strofa sul primo beat.',
    '🎤 Ecco l\'ingresso giusto per la strofa: vai.'
  ],
  strofaMid: [
    '👀 Strofa in corso: resta agganciato al conteggio, non rincorrere il tempo.',
    '👀 Strofa: continua a sentire bene 1 2 3 4, non farti trascinare dagli accordi.',
    '👀 Strofa: tieni il passo interno e appoggiati al beat, non al testo.',
    '👀 Strofa: se ti perdi, torna subito a sentire dov\'è l\'uno.',
    '👀 Strofa: parole e ritmo devono camminare insieme, non uno dietro l\'altro.',
    '👀 Strofa: non correre per finire la frase, resta dentro il beat.',
    '👀 Strofa: conta sotto voce se serve, il giro ti tiene in piedi.'
  ],
  strofaLast: [
    '🚦 Ultimo giro di strofa: attenzione, tra poco arriva il ritornello.',
    '🚦 Ci siamo quasi: finisci bene la strofa e prepara il ritornello.',
    '🚦 Strofa quasi finita: resta fermo sul tempo, tra poco si apre il ritornello.',
    '🚦 Ultimo passaggio di strofa: prepara il cambio di energia.',
    '🚦 Ancora questo giro e poi ritornello: non mollare il conteggio adesso.'
  ],
  ritStart: [
    '🎶 VIA ritornello: qui devi aprirti e andare deciso.',
    '🎶 Ritornello adesso: entra subito, questo e il punto largo del giro.',
    '🎶 Ecco il ritornello: appoggia bene l\'ingresso sul primo beat.',
    '🎶 Ritornello: allarga l\'energia, ma resta preciso.',
    '🎶 Qui si apre tutto: entra nel ritornello adesso.'
  ],
  ritMid: [
    '🔥 Ritornello in corso: energia alta, ma sempre con il conteggio davanti.',
    '🔥 Ritornello: non correre, resta sul beat e tieni largo il respiro.',
    '🔥 Sei nel ritornello: spingi pure, ma l\'uno deve restare chiarissimo.',
    '🔥 Ritornello: grande energia, piedi ben piantati sul quattro.',
    '🔥 Non lasciarti portare via: il ritornello funziona se il tempo resta fermo.',
    '🔥 Spingi la voce quanto vuoi, ma il conteggio deve restare pulito.',
    '🔥 Ritornello: resta largo, ma non perdere il beat.'
  ],
  ritLast: [
    '↩️ Ultimo giro di ritornello: tra poco si torna alla strofa.',
    '↩️ Ritornello quasi chiuso: prepara il rientro alla strofa.',
    '↩️ Ancora questo giro e poi si torna alla strofa: resta sveglio.',
    '↩️ Ultima curva del ritornello: prepara il rientro.',
    '↩️ Ritornello in chiusura: non distrarti, tra poco cambia di nuovo.'
  ],
  strofaReturn: [
    '🎭 Si torna alla strofa: cambia atteggiamento ma resta preciso sul tempo.',
    '🎭 Rientro strofa: torna dentro il racconto, sempre appoggiato all\'uno.',
    '🎭 Di nuovo strofa: nuovo ingresso, stesso giro, stesso conteggio.',
    '🎭 Rieccoti in strofa: abbassa l\'energia ma non la precisione.',
    '🎭 Torna alla strofa con calma, senza perdere la misura.'
  ]
};

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

function setStatus(text, tone = '', { sticky = false, force = false, pulse = false } = {}) {
  if (statusSticky && !force) return;
  const node = byId('statusText');
  node.textContent = text;
  node.classList.remove('is-good', 'is-warn', 'is-bad', 'is-pulse');
  if (tone) {
    node.classList.add(`is-${tone}`);
  }
  if (pulse || tone === 'warn' || tone === 'bad') node.classList.add('is-pulse');
  statusSticky = sticky;
}

function chordOrdinalText(value) {
  return {
    1: 'primo',
    2: 'secondo',
    3: 'terzo',
    4: 'quarto'
  }[value] || `${value}°`;
}

function pickMessage(pool) {
  return pick(pool) || '';
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
  const normalTempo = computeNormalTempo();
  return clamp(Math.round(normalTempo * EASY_TEMPO_FACTOR), CUSTOM_TEMPO_MIN, CUSTOM_TEMPO_MAX);
}

function computeNormalTempo() {
  return currentStyle?.tempoRange?.default || pickTempoForStyle(currentStyle);
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

  renderProgressValue(byId('pvIntro'), sezione === 'intro' ? structureText.replace('Intro ', '') : '✓');
  renderProgressValue(byId('pvStrofa'), sezione === 'strofa' ? structureText.replace('Strofa ', '') : (sezione === 'intro' ? '—' : '✓'));
  renderProgressValue(byId('pvRit'), sezione === 'rit' ? structureText.replace('Ritornello ', '') : (sezione === 'intro' ? '—' : ''));

  document.body.classList.remove('sec-intro', 'sec-strofa', 'sec-rit');
  document.body.classList.add(`sec-${sezione}`);
}

function renderProgressValue(node, value) {
  const safeValue = String(value ?? '');
  const fractionMatch = safeValue.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    node.classList.remove('is-idle');
    node.innerHTML = `
      <span class="progress-cur">${fractionMatch[1]}</span>
      <span class="progress-sep">/</span>
      <span class="progress-tot">${fractionMatch[2]}</span>
    `;
    return;
  }

  node.classList.add('is-idle');
  node.innerHTML = `<span class="progress-idle">${safeValue || '—'}</span>`;
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

function clearChordHighlights() {
  for (let i = 0; i < 4; i++) byId(`chordCard${i}`)?.classList.remove('active');
}

function getActiveChordOrdinal() {
  for (let i = 0; i < 4; i++) {
    if (byId(`chordCard${i}`)?.classList.contains('active')) return i + 1;
  }
  return null;
}

function computeStructureForBeat(beat) {
  const giroIndex = Math.floor(beat / 16);
  if (giroIndex < INTRO_GIRI) {
    return { sezione: 'intro', text: `Intro ${giroIndex + 1}/${INTRO_GIRI}`, current: giroIndex + 1, total: INTRO_GIRI, giroIndex };
  }

  const loopIndex = (giroIndex - INTRO_GIRI) % LOOP_GIRI;
  if (loopIndex < STROFA_GIRI) {
    return { sezione: 'strofa', text: `Strofa ${loopIndex + 1}/${STROFA_GIRI}`, current: loopIndex + 1, total: STROFA_GIRI, giroIndex };
  }

  return { sezione: 'rit', text: `Ritornello ${loopIndex - STROFA_GIRI + 1}/${RIT_GIRI}`, current: loopIndex - STROFA_GIRI + 1, total: RIT_GIRI, giroIndex };
}

function announceStructureCue(state, prevState = null) {
  if (state.sezione === 'intro') {
    const pool = state.current === 1 ? STRUCTURE_MESSAGES.intro1 : STRUCTURE_MESSAGES.intro2;
    setStatus(pickMessage(pool));
    return;
  }

  if (state.sezione === 'strofa') {
    if (!prevState || prevState.sezione === 'intro') {
      setStatus(pickMessage(STRUCTURE_MESSAGES.strofaStart), 'good');
      return;
    }
    if (prevState.sezione === 'rit') {
      setStatus(pickMessage(STRUCTURE_MESSAGES.strofaReturn), 'good');
      return;
    }
    if (state.current === state.total) {
      setStatus(pickMessage(STRUCTURE_MESSAGES.strofaLast), 'warn');
      return;
    }
    setStatus(pickMessage(STRUCTURE_MESSAGES.strofaMid));
    return;
  }

  if (state.sezione === 'rit') {
    if (!prevState || prevState.sezione !== 'rit') {
      setStatus(pickMessage(STRUCTURE_MESSAGES.ritStart), 'good');
      return;
    }
    if (state.current === state.total) {
      setStatus(pickMessage(STRUCTURE_MESSAGES.ritLast), 'warn');
      return;
    }
    setStatus(pickMessage(STRUCTURE_MESSAGES.ritMid));
  }
}

function syncStructureAtBeat(beat, { announce = false } = {}) {
  const state = computeStructureForBeat(beat);
  const prevState = lastStructureState;
  sezione = state.sezione;
  structureText = state.text;
  refreshProgress();
  lastStructureState = state;
  if (announce) announceStructureCue(state, prevState);
}

function resetTransportUI() {
  totalBeats = 0;
  endingArmed = false;
  endingDone = false;
  lastStructureState = null;
  syncStructureAtBeat(0, { announce: false });
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
  const baseProgression = pickProgression(style, avoidProgressionName) || style.progressionPool[0];
  currentProgression = createStyledProgression(style, baseProgression);
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
  Sampler.stopAllSounds();
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

  setStatus(`Count-in ${currentStyle.label}`, '', { force: true });
  byId('playBtn').disabled = true;
  byId('stopBtn').disabled = false;
  byId('btnEnding').disabled = false;
  clearChordHighlights();

  doCountIn((startTime) => {
    totalBeats = 0;
    syncStructureAtBeat(0, { announce: false });
    nextBeatTime = startTime;
    isPlaying = true;
    endingArmed = false;
    endingDone = false;
    setStatus(`${currentStyle.label} · ${currentVariation.label}`, '', { force: true });
    scheduler();
  });
}

async function stopAll() {
  await hardStop();
  setStatus(`Pronto: ${currentStyle.label}`, '', { force: true });
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
  setStatus(`Pronto: ${style.label}`, '', { force: true });

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
  byId('metroBtn').textContent = metronomeOn ? 'Disattiva metronomo' : 'Attiva metronomo';
  byId('metroBtn').classList.toggle('is-on', metronomeOn);
}

async function selectMainInstrument(value) {
  currentMainSound = value;
  await Sampler.loadInstrument(currentMainSound);
  refreshStyleCard();
}

async function selectBassInstrument(value) {
  currentBassSound = value;
  await Sampler.loadInstrument(currentBassSound);
  refreshStyleCard();
}

function armEnding() {
  if (!isPlaying || endingDone) return;
  endingArmed = true;
  byId('btnEnding').classList.add('armed');
  const chordOrdinal = getActiveChordOrdinal();
  if (chordOrdinal === 3 || chordOrdinal === 4) {
    setStatus(pickMessage(ENDING_MESSAGES[chordOrdinal]), 'bad', { sticky: true, force: true, pulse: true });
    return;
  }
  if (chordOrdinal === 1 || chordOrdinal === 2) {
    setStatus(pickMessage(ENDING_MESSAGES[chordOrdinal]), 'good', { sticky: true, force: true });
    return;
  }
  setStatus('🎬 Finale chiamato: meglio dirlo sul primo o sul secondo accordo del giro, cosi Alessandro lo capisce al volo.', 'warn', { sticky: true, force: true, pulse: true });
}

async function handlePlayClick() {
  if (isPlaying || isCountingIn) return;
  await startPlay();
}

document.addEventListener('DOMContentLoaded', async () => {
  setTimeout(() => {
    byId('curtL')?.classList.add('open');
    byId('curtR')?.classList.add('open');
  }, 150);
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

  const startupStyle = pick(STYLE_DEFS) || STYLE_DEFS[0];
  await applyStyle(startupStyle.id);
  byId('stopBtn').disabled = true;
  byId('btnEnding').disabled = true;
});
