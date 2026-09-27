/*
  SCRIPT AGGIORNAMENTO CALENDARI - Suite Centrale 44
  ====================================================
  Questo script viene eseguito automaticamente da GitHub Actions
  (vedi .github/workflows/aggiorna-calendari.yml), non dal browser.
  Essendo eseguito "lato server" da GitHub, non ha alcun problema di CORS:
  scarica direttamente i 3 calendari da Google e li salva in
  data/calendari.json, un file che il sito legge poi normalmente
  (stesso dominio, nessun proxy).
*/

const fs = require('fs');

const PERCORSO_JSON = 'data/calendari.json';

const CALENDARI = {
  centrale: 'https://calendar.google.com/calendar/ical/usn7es2f9plpcssjkrlc6mpmg4u5i0i4%40import.calendar.google.com/public/basic.ics',
  corallo:  'https://calendar.google.com/calendar/ical/houpucjjv0mu4cr02bk5n8cd9v6ele8o%40import.calendar.google.com/public/basic.ics',
  oceano:   'https://calendar.google.com/calendar/ical/lmtdlre4n8fj9qhk8ksqf9lsi91qbhho%40import.calendar.google.com/public/basic.ics'
};

function estraiDateDaICS(icsText) {
  const intervalli = [];
  if (!icsText) return intervalli;

  const eventi = icsText.split('BEGIN:VEVENT');
  eventi.forEach(evt => {
    const startMatch = evt.match(/DTSTART[^:]*:(\d{8})/);
    const endMatch = evt.match(/DTEND[^:]*:(\d{8})/);
    if (startMatch && endMatch) {
      const s = startMatch[1];
      const e = endMatch[1];
      const da = `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
      const a = `${e.substring(0, 4)}-${e.substring(4, 6)}-${e.substring(6, 8)}`;
      intervalli.push({ da, a });
    }
  });

  return intervalli;
}

async function main() {
  const risultato = { generato: new Date().toISOString() };

  for (const [chiave, url] of Object.entries(CALENDARI)) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const testo = await res.text();
      risultato[chiave] = estraiDateDaICS(testo);
      console.log(`OK - ${chiave}: ${risultato[chiave].length} periodi trovati`);
    } catch (err) {
      console.error(`ERRORE su ${chiave}:`, err.message);
      // In caso di errore temporaneo di Google, NON sovrascriviamo con un
      // array vuoto: manteniamo l'ultimo dato buono già salvato nel file,
      // così una prenotazione già nota non sparisce dal sito per un guasto momentaneo.
      try {
        const precedente = JSON.parse(fs.readFileSync(PERCORSO_JSON, 'utf8'));
        risultato[chiave] = precedente[chiave] || [];
      } catch {
        risultato[chiave] = [];
      }
      risultato[chiave + '_errore'] = true;
    }
  }

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(PERCORSO_JSON, JSON.stringify(risultato, null, 2));
  console.log('data/calendari.json scritto con successo.');
}

main();
