/**
 * GESTIONE INTERFACCIA E STATO APPLICAZIONE
 * Gestisce l'interazione dell'utente, l'aggiornamento della UI e lo stato della performance.
 */

// STATE
let isPlaying = false, isCountingIn = false, endingArmed = false, endingDone = false;
let bpm = 120, themeIdx = 0, totalBeats = 0;
let metronomeOn = false;
let chordRhythms = [0, 0, 0, 0];
let bassPatterns = [0, 0, 0, 0];
let bassEngine = 0;

const STYLE_LABELS = {
  swing: 'Swing',
  rock: 'Rock',
  funk: 'Funk',
  bossa: 'Bossa',
  march: 'Marcia',
  latin: 'Latin',
  gospel: 'Gospel',
  tango: 'Tango'
};

const MOOD_LABELS = {
  teatro: 'Teatrale',
  magico: 'Magico',
  sacro: 'Sacrale',
  locale: 'Notturno',
  storico: 'Epico',
  esotico: 'Esotico',
  fantascientifico: 'Sci-fi'
};

let sezione = 'none';
let sezCounter = { strofa: 0, rit: 0 };
let introGiro = 0;
let targets = { strofa: 4, rit: 4 };

function bNotes(r, t) { return CHORD_INT[t].map(i => r + i); }
function cLabel(r, t) { const s = { maj: '', min: 'm', dom7: '7', maj7: 'maj7', min7: 'm7', sus4: 'sus4', sus2: 'sus2', maj6: '6', dim7: '°7', aug: '+', min6: 'm6' }; return NOTES[r % 12] + (s[t] ?? ''); }

function assignRhythms() { for (let i = 0; i < 4; i++) chordRhythms[i] = Math.floor(Math.random() * RHYTHM_PATTERNS.length); }
function assignBassPatterns() {
  for (let i = 0; i < 4; i++) bassPatterns[i] = Math.floor(Math.random() * BASS_PATTERNS.length);
  bassEngine = Math.floor(Math.random() * BASS_ENGINES.length);
  refreshBassDisplay();
}

function refreshBassDisplay() {
  const el = document.getElementById('instrBass');
  if (el) el.textContent = '🎸 ' + (BASS_NAMES[bassEngine] || '—');
}

function getThemeSound(theme = THEMES[themeIdx]) {
  return theme?.sound || 'grandpiano';
}

function refreshThemeMeta() {
  const theme = THEMES[themeIdx];
  const styleEl = document.getElementById('styleText');
  const moodEl = document.getElementById('moodText');
  if (styleEl) styleEl.textContent = STYLE_LABELS[theme.perc] || 'Libero';
  if (moodEl) moodEl.textContent = MOOD_LABELS[theme.lg] || theme.lg || 'Aperto';
}

// COUNT-IN
function doCountIn(onDone) {
  isCountingIn = true;
  const spb = 60 / bpm, startT = ctx.currentTime + 0.12;
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

function schedUI(fn, audioTime) { const d = (audioTime - ctx.currentTime) * 1000; setTimeout(fn, Math.max(0, d)); }

// UI UPDATES
function highlightChord(idx) {
  for (let i = 0; i < 4; i++) document.getElementById('cc' + i).classList.remove('active');
  document.getElementById('cc' + idx)?.classList.add('active');
}
function highlightBeat(b) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('cb' + i);
    el.classList.remove('active', 'count-in-active');
    if (i === b + 1) el.classList.add('active');
  }
}

function refreshChordDisplay() {
  const t = THEMES[themeIdx];
  const sound = getThemeSound(t);
  document.getElementById('chordDisplay').className = 'chord-display';
  for (let i = 0; i < 4; i++) {
    const card = document.getElementById('cc' + i);
    card.classList.remove('hidden');
    const cd = t.ch[i];
    document.getElementById('cnum' + i).textContent = t.fn[i] || ('Acc ' + (i + 1));
    document.getElementById('cname' + i).textContent = cLabel(cd.r, cd.t);
  }
  const icons = { grandpiano: '🎹', jazzpiano: '🎹', elecpiano: '🎸', organ: '⛪', pipeorgan: '⛩️', accordion: '🪗', strings: '🎻', brass: '🎺', nylonguitar: '🎸', distguitar: '⚡', steelguitar: '🤠', honkytonk: '🎹', synthpad: '🤖', vibraphone: '🔔', harpsichord: '🎼', marimba: '🌺' };
  document.getElementById('instrIcon').textContent = icons[sound] || '🎹';
  document.getElementById('instrName').textContent = SOUND_NAMES[sound] || sound;
  refreshThemeMeta();
}

function selectTheme(i, keepLoc = false) {
  themeIdx = i;
  THEMES[i].sound = THEMES[i].sound || 'grandpiano';
  bpm = THEMES[i].tempo;
  document.getElementById('tempoSlider').value = bpm;
  document.getElementById('tempoVal').textContent = bpm;
  refreshChordDisplay();
  if (!keepLoc) newLocationForTheme(i);
  if (isPlaying) totalBeats = 0;
}

function newLocationForTheme(i) {
  const el = document.getElementById('locText'); if (!el) return;
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  el.textContent = ALL_LOC[Math.floor(Math.random() * ALL_LOC.length)];
}

function newLocation() {
  const el = document.getElementById('locText');
  el.classList.remove('flash'); void el.offsetWidth;
  el.textContent = ALL_LOC[Math.floor(Math.random() * ALL_LOC.length)];
  el.classList.add('flash');
}

function doFullRandom() {
  const btn = document.getElementById('btnRandom');
  btn.classList.remove('flash'); void btn.offsetWidth; btn.classList.add('flash');
  if (isPlaying || isCountingIn) stopAll(true);
  const i = Math.floor(Math.random() * THEMES.length);
  selectTheme(i, false);
  THEMES[i].sound = 'grandpiano';
  refreshChordDisplay();
  const nb = Math.round(100 + (Math.random() - 0.5) * 30);
  setTempo(Math.max(85, Math.min(115, nb)));
  document.getElementById('tempoSlider').value = bpm;
}

// STRUTTURA
function updateProgressDisplay() {
  const introActive = sezione === 'intro';
  document.getElementById('pbIntro').className = 'progress-block' + (introActive ? ' active-intro' : '');
  document.getElementById('pvIntro').textContent = introActive ? (introGiro + ' / 2') : (sezione === 'none' ? '—' : '✓');
  document.getElementById('prIntro').textContent = introActive ? (introGiro < 2 ? 'manca ancora' : 'ultimo giro') : '';

  const sCur = sezCounter.strofa, sTarget = targets.strofa;
  const sRemain = Math.max(0, sTarget - sCur);
  document.getElementById('pvStrofa').textContent = sezione === 'none' || sezione === 'intro' ? '—' : `${sCur} / ${sTarget}`;
  document.getElementById('prStrofa').textContent = sezione !== 'none' && sezione !== 'intro' ? (sRemain > 0 ? `mancano ${sRemain}` : '✓ completate') : '';
  document.getElementById('pbStrofa').className = 'progress-block' + (sezione === 'strofa' ? ' active-strofa' : '');

  const rCur = sezCounter.rit, rTarget = targets.rit;
  const rRemain = Math.max(0, rTarget - rCur);
  document.getElementById('pvRit').textContent = sezione === 'none' || sezione === 'intro' ? '—' : `${rCur} / ${rTarget}`;
  document.getElementById('prRit').textContent = sezione !== 'none' && sezione !== 'intro' ? (rRemain > 0 ? `mancano ${rRemain}` : '✓ completati') : '';
  document.getElementById('pbRit').className = 'progress-block' + (sezione === 'rit' ? ' active-rit' : '');
}

function setStruttura(s) {
  sezione = s;
  document.body.classList.remove('sec-intro', 'sec-strofa', 'sec-rit');
  if (s !== 'none') document.body.classList.add('sec-' + s);
  updateStrutturaStatus();
  updateProgressDisplay();
}

function updateStrutturaStatus() {
  const sCur = sezCounter.strofa, sTarget = targets.strofa;
  const rCur = sezCounter.rit, rTarget = targets.rit;
  if (sezione === 'intro') setStatus('🎵 intro — 2 giri vuoti', 'sec-intro');
  else if (sezione === 'strofa') setStatus(`🎤 Strofa ${sCur} di ${sTarget}  ·  rit: ${rCur}/${rTarget}`, 'sec-strofa');
  else if (sezione === 'rit') setStatus(`✨ Ritornello ${rCur} di ${rTarget}  ·  strofe: ${sCur}/${sTarget}`, 'sec-rit');
}

function resetStruttura() {
  sezione = 'none'; sezCounter = { strofa: 0, rit: 0 }; introGiro = 0;
  document.body.classList.remove('sec-intro', 'sec-strofa', 'sec-rit');
  document.getElementById('pvIntro').textContent = '—';
  document.getElementById('prIntro').textContent = '';
  document.getElementById('pvStrofa').textContent = '—';
  document.getElementById('pvRit').textContent = '—';
  document.getElementById('prStrofa').textContent = '';
  document.getElementById('prRit').textContent = '';
}

function toggleSezioneMusicale() {
  if (sezione === 'strofa') { sezCounter.rit = 1; setStruttura('rit'); }
  else if (sezione === 'rit') { sezCounter.strofa = 1; setStruttura('strofa'); }
}

function randomInstrument() {
  const cur = getThemeSound(THEMES[themeIdx]);
  let next = cur;
  while (next === cur) next = randomWeightedSound();
  THEMES[themeIdx].sound = next;
  bassEngine = Math.floor(Math.random() * BASS_ENGINES.length);
  refreshBassDisplay();
  refreshChordDisplay();
}

function randomWeightedSound() {
  if (Math.random() < 0.85) return PIANO_SOUNDS[Math.floor(Math.random() * PIANO_SOUNDS.length)];
  return SOUND_LIST[Math.floor(Math.random() * SOUND_LIST.length)];
}

function toggleMetronome() {
  metronomeOn = !metronomeOn;
  const btn = document.getElementById('metroBtn');
  btn.classList.toggle('on', metronomeOn);
  btn.textContent = metronomeOn ? 'metronomo ON' : 'metronomo OFF';
}

function setTempo(v) { bpm = v; document.getElementById('tempoVal').textContent = v; }
function setStatus(txt, cls) { const s = document.getElementById('statusBar'); s.textContent = txt; s.className = 'status-bar' + (cls ? ' ' + cls : ''); }

function togglePlay() {
  if (isCountingIn) return;
  if (isPlaying) {
    clearTimeout(schedTimer); schedTimer = null;
    ctx.suspend();
    isPlaying = false;
    document.getElementById('btnPlay').textContent = '▶ Play';
    document.getElementById('btnPlay').classList.remove('on');
    setStatus('⏸ in pausa', '');
  } else {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
      isPlaying = true;
      document.getElementById('btnPlay').textContent = '⏸ Pausa';
      document.getElementById('btnPlay').classList.add('on');
      nextBeatTime = ctx.currentTime + 0.05;
      schedTimer = setTimeout(scheduler, TICK_MS);
      setStatus('▶ ripresa', '');
    } else { startPlay(); }
  }
}

function startPlay() {
  initAudio(); if (ctx.state === 'suspended') ctx.resume();
  document.getElementById('btnPlay').disabled = true;
  setStatus('1 ... 2 ... 3 ... 4 ...', '');
  resetStruttura();
  assignRhythms();
  assignBassPatterns();
  doCountIn((musicStartT) => {
    isPlaying = true; endingArmed = false; endingDone = false;
    totalBeats = 0; nextBeatTime = musicStartT;
    document.getElementById('btnPlay').textContent = '⏸ Pausa';
    document.getElementById('btnPlay').classList.add('on');
    document.getElementById('btnPlay').disabled = false;
    document.getElementById('btnEnding').disabled = false;
    setStatus('♪ in scena — suona!', 'on');
    scheduler();
  });
}

function stopAll(silent = false) {
  clearTimeout(schedTimer); schedTimer = null;
  isPlaying = false; isCountingIn = false; endingArmed = false; endingDone = false;
  resetStruttura();
  for (let i = 1; i <= 4; i++) document.getElementById('cb' + i).classList.remove('active', 'count-in-active');
  document.getElementById('btnPlay').textContent = '▶ Play';
  document.getElementById('btnPlay').classList.remove('on');
  document.getElementById('btnPlay').disabled = false;
  document.getElementById('btnEnding').classList.remove('armed');
  document.getElementById('btnEnding').disabled = true;
  for (let i = 0; i < 4; i++) document.getElementById('cc' + i).classList.remove('active');
  if (!silent) setStatus('premi Play per iniziare', '');
}

function armEnding() { if (!isPlaying || endingDone) return; endingArmed = true; document.getElementById('btnEnding').classList.add('armed'); setStatus('🎬 Alessandro sa che stai finendo — completa il giro…', 'end'); }

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { document.getElementById('curtL').classList.add('open'); document.getElementById('curtR').classList.add('open'); }, 150);
  const i = Math.floor(Math.random() * THEMES.length);
  themeIdx = i;
  THEMES[i].sound = 'grandpiano';
  bpm = Math.round(Math.max(85, Math.min(115, 100 + (Math.random() - 0.5) * 30)));
  document.getElementById('tempoSlider').value = bpm;
  document.getElementById('tempoVal').textContent = bpm;
  refreshChordDisplay(); newLocationForTheme(i); refreshBassDisplay();
});
