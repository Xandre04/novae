# NOVAE

Il social su invito dove ogni artista condivide le sue opere.

**Super alpha**: prototipo navigabile, dati finti, nessun backend.

## Schermate

- **Invito**: si entra solo con un codice o un QR (in alpha va bene qualsiasi codice di almeno 4 caratteri)
- **Menu principale**: le 8 sezioni attorno alla stella NOVAE
- **Novae**: il feed delle opere con valutazione a stelle
- **Stile / Cinematografia**: serie, film, classifica, righe a gradini per genere
- **Scheda opera**: player, descrizione, opere correlate
- **Scopri**: globo interattivo con gli artisti nel mondo
- **Galleria, Mercato (in gemme), Profilo, Messaggi, Impostazioni**

## Avvio in locale

Nessuna installazione necessaria:

```bash
python -m http.server 5173
```

Poi apri http://localhost:5173

## Struttura

- `index.html`: markup delle schermate
- `styles.css`: stile (nero, linee a gesso, stella cremisi)
- `app.js`: dati di prova, routing, interazioni
- `IMG/`: bozzetti e icone disegnate a mano
