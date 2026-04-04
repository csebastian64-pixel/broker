COME AVVIARE LA WEBAPP SU WINDOWS

1. Estrai questa cartella dove vuoi, ad esempio sul Desktop.
2. Apri la cartella broker-webapp.
3. Clicca nella barra dell'indirizzo della cartella e scrivi:
   cmd
   poi premi Invio.
4. Nella finestra nera scrivi questi comandi, uno alla volta:

   npm install
   npm run dev

5. Vedrai comparire un indirizzo simile a:
   http://localhost:5173/
6. Aprilo nel browser.

COME PUBBLICARLA ONLINE

Metodo semplice con Vercel:
1. Crea un account GitHub.
2. Carica questa cartella come nuovo repository.
3. Vai su vercel.com e accedi.
4. Collega GitHub a Vercel.
5. Seleziona il repository broker-webapp.
6. Premi Deploy.

Per creare la versione definitiva per uso aziendale, serviranno backend, database, login e gestione documentale reale.
