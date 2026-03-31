# V6 Plan

## Obiettivo
Creare una `v6` standalone, accessibile solo via direct link (`/v6/index.html`), indipendente da `v4` e `v5` a livello di runtime e centrata sulla scelta esplicita dello stile.

## Vincoli musicali non negoziabili
- sempre `4/4`
- sempre `4 accordi`
- sempre `2 giri intro`
- poi loop fisso di `4 giri strofa + 4 giri ritornello`
- cambiare stile o randomizzare stile fa sempre ripartire dall'inizio

## Stili richiesti
- Jazz Swing
- Reggae
- Ska
- Bossa Nova
- Funk
- Blues Shuffle
- Pop-Rock
- Disco 70s
- Hip-Hop / Boom Bap
- Punk Rock
- Country / Bluegrass
- Motown / Soul
- Salsa / Montuno
- Gospel
- Synth-Wave / Pop 80s
- Tango
- Indie Folk

## UX
- single screen
- mobile first
- style picker compatto
- pulsante per randomizzare lo stile
- card principale dello stile molto marcata
- tap sulla card stile = nuova progressione nello stesso stile

## Modello dati
Ogni stile deve avere:
- `id`
- `label`
- `subtitle`
- `accent`
- `tempoRange`
- `mainInstrumentPool`
- `bassInstrumentPool`
- `progressionPool` con sole progressioni da 4 accordi
- `variationSet` con esattamente 3 variazioni ritmiche

## Comportamento
- lo stile scelto decide accordi, groove, basso e batteria
- la variazione viene scelta dal sistema, non dall'utente
- il sistema mostra sempre lo stile attivo, la variazione attiva e i 4 accordi correnti
- il metronomo resta opzionale

## Implementazione
- `v6/index.html` come entrypoint indipendente
- `v6/css/style.css` per la UI dedicata
- `v6/js/db-styles.js` come database stile-centrico
- `v6/js/audio-engine.js` dedicato alla struttura fissa `2 + 4 + 4`
- `v6/js/ui-manager.js` per selezione stile, rigenerazione e trasporto

## Test minimi
- apertura diretta di `/v6/index.html`
- nessun link a `v6` dalla root o dalle versioni precedenti
- ogni stile genera sempre 4 accordi
- ogni stile ha sempre 3 variazioni
- la struttura resta sempre `intro 2 / strofa 4 / rit 4`
- cambiare stile durante play riporta sempre all'intro
