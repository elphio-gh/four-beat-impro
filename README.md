# Alessandro Rizzo Simulator 🎹🎸

Un'applicazione web interattiva progettata per supportare l'improvvisazione musicale dal vivo. Questo simulatore fornisce progressioni armoniche, pattern ritmici e ispirazioni sceniche in tempo reale, ideale per performance teatrali o sessioni di pratica musicale.

## Stato Attuale

- La versione principale pubblicata su GitHub Pages e' la `v5`, servita dalla root `index.html`.
- La vecchia `v0.4` e' mantenuta in `failsafe/` come versione precedente e fallback stabile.
- Il percorso diretto `v5/index.html` resta disponibile per test o accesso esplicito.

## Caratteristiche

- **Motore Audio mobile-first**: Web Audio API con sample pack locali leggeri, caricamento rapido e consumo dati ridotto su smartphone.
- **Progressioni Armoniche**: Preset che spaziano tra pop, teatro musicale, jazz leggero, blues, modale e stili latini.
- **Batterie per stile**: Ogni stile ritmico pesca tra 6 variazioni complete dedicate, sempre in 4/4.
- **Cambio strumenti ciclico**: Lo strumento principale e il basso non cambiano in modo randomico, ma scorrono ciclicamente tra le opzioni disponibili.
- **4 bassi distinti**: `Electric`, `Acoustic`, `Fretless` e `Synth`.
- **Gestione Struttura**: Monitoraggio automatico di Intro, Strofa e Ritornello con indicatori di progresso.
- **Ispirazione Scenica**: Generatore di location casuali suddivise per temi.
- **Controllo Totale**: Regolazione BPM, metronomo integrato e gestione del finale.

## Tecnologie Utilizzate

- **HTML5 / CSS3**: Interfaccia responsive ottimizzata per mobile.
- **JavaScript (Vanilla)**: Tutta la logica di scheduling musicale e gestione dello stato.
- **Web Audio API**: Riproduzione e processamento di sample audio locali.
- **Google Fonts**: Tipografia curata con 'Inter' e 'Playfair Display'.

## Struttura Versioni

- `index.html`: entrypoint principale, oggi allineato alla `v5`.
- `v5/`: versione principale completa con UI split strumenti/basso, info stile/mood e variazioni ritmiche per stile.
- `failsafe/`: copia autonoma della `v0.4` da usare come fallback o vecchia versione.

## Come si usa

1. Apri `index.html` in un browser moderno.
2. Scegli una progressione o usa il tasto **"RANDOMIZZA TUTTO"** per un setup immediato.
3. Regola il tempo (BPM) se necessario.
4. Premi **"▶ Play"** per avviare il count-in e iniziare la performance.
5. Usa i controlli separati per cambiare strumento principale e basso.
6. Usa il tasto **"🎬 Segnala finale"** per preparare la chiusura del brano in modo armonico.

## Note Operative

- La `v5` e' ottimizzata per uso prevalente su smartphone.
- Il failsafe `v0.4` resta disponibile se serve una versione piu' conservativa o la vecchia esperienza.

## Licenza

Questo progetto è distribuito sotto licenza MIT.
