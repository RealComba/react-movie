# ContHub

Catalogo React/Vite con interfaccia responsive per telefono, desktop e TV.

## Avvio e verifiche

Richiede Node.js 24 e npm.

```sh
cd react-movie
npm ci
npm run dev
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

I test browser usano risposte TMDB e player simulati: non riproducono video esterni. La pipeline GitHub esegue lint, build e gli stessi test. In ambienti con Chromium già installato si può impostare `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Navigazione

- Navbar: Home, Film, Serie TV e ricerca per titolo.
- Film e Serie TV condividono il catalogo con filtri genere/anno e paginazione. Per le serie, l'anno indica il debutto. I filtri sono applicati tramite TMDB Discover e conservati nell'URL.
- Sinistra/destra selezionano le locandine e fanno scorrere automaticamente la fila; su/giù passano fra righe, navbar e controlli. OK/Enter apre il titolo selezionato.
- Nei filtri: OK apre, su/giù scelgono, OK conferma; Indietro/Escape chiude senza cambiare la selezione. Nel campo ricerca, sinistra/destra restano disponibili per modificare il testo; su/giù escono dal campo.
- Indietro/Escape torna dalla pagina di dettaglio al catalogo, ripristinando la locandina e lo scorrimento. Se la pagina è stata aperta direttamente, torna al catalogo/Home.
- Touch, mouse e Tab continuano a funzionare. Ogni locandina ha una sola azione; i titoli senza poster rimangono accessibili.
- La mia lista resta nei dettagli e in `/favorites`, con i preferiti e i like già salvati nel browser. Nessun dato salvato viene cancellato dalla semplificazione dell'interfaccia.

## TV e Fire TV Stick

L'interfaccia adatta dimensioni e focus agli user agent Fire TV/Silk e ad altri browser TV riconosciuti. Le frecce funzionano anche su desktop. Per forzare l'aspetto TV durante una prova, aprire `/?tv=1`; `?tv=0` lo disattiva per la sessione corrente. Il sito non dipende soltanto dalla larghezza dello schermo per riconoscere un televisore.

Le file seguono il focus senza timer di avanzamento e senza riproduzione automatica dei trailer. Lo scorrimento immediato evita animazioni accodate quando si tiene premuta una freccia. Sono rispettate le preferenze di movimento ridotto.

Il browser su Fire TV deve inviare eventi tastiera alla pagina. I test Chromium non sostituiscono una prova sul dispositivo con la sua versione di Silk: verificare frecce, OK e Indietro, filtri e ritorno al catalogo a 720p/1080p. Il pulsante Indietro fisico può essere gestito direttamente dal browser.

Il player resta un iframe di terze parti. “Controlla il video” trasferisce il focus al player; i comandi al suo interno dipendono dal provider e non possono essere intercettati dalla pagina principale per la separazione tra origini. Restano disponibili uscita, cambio sorgente e apertura esterna. Non sono state cambiate le sorgenti video.

## Riferimenti

- [Amazon: web app per Fire TV](https://developer.amazon.com/docs/fire-tv/getting-started-with-web-apps.html)
- [TMDB: filtri film](https://developer.themoviedb.org/reference/discover-movie)
- [TMDB: filtri serie TV](https://developer.themoviedb.org/reference/discover-tv)
