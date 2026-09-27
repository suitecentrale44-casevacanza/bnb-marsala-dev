/* ==========================================
   1. GESTIONE LINGUA E MENU NAVIGAZIONE
   ========================================== */

window.googleTranslateElementInit = function() {
  new google.translate.TranslateElement({
    pageLanguage: 'it',
    includedLanguages: 'en,de,fr,es,nl',
    autoDisplay: false
  }, 'google_translate_element');
};

window.toggleLangDropdown = function(e) {
  if (e) e.stopPropagation();
  const langDropdown = document.getElementById('langDropdown');
  if (langDropdown) {
    langDropdown.classList.toggle('show');
  }
};

window.toggleMainMenu = function(e) {
  if (e) e.stopPropagation();
  const menuWrapper = document.getElementById('navMenuWrapper');
  if (menuWrapper) {
    menuWrapper.classList.toggle('show');
  }
};

window.chiudiMainMenu = function() {
  const menuWrapper = document.getElementById('navMenuWrapper');
  if (menuWrapper) {
    menuWrapper.classList.remove('show');
  }
};

document.addEventListener('click', function(e) {
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  if (langDropdown && langBtn && !langDropdown.contains(e.target) && !langBtn.contains(e.target)) {
    langDropdown.classList.remove('show');
  }

  const menuWrapper = document.getElementById('navMenuWrapper');
  const toggleBtn = document.getElementById('navToggleBtn');
  if (menuWrapper && toggleBtn && !menuWrapper.contains(e.target) && !toggleBtn.contains(e.target)) {
    menuWrapper.classList.remove('show');
  }
});

function gestisciCookieTranslate(lang) {
  const dominio = window.location.hostname;
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + dominio + ";";
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + dominio + ";";

  if (lang && lang !== 'it') {
    document.cookie = "googtrans=/it/" + lang + "; path=/;";
    document.cookie = "googtrans=/it/" + lang + "; path=/; domain=" + dominio + ";";
  }
}

window.cambiaLingua = function(codiceLingua, flagClass) {
  localStorage.setItem('lingua_selezionata', codiceLingua);
  localStorage.setItem('flag_class_selezionata', flagClass);
  localStorage.setItem('salta_splash', 'true');

  gestisciCookieTranslate(codiceLingua);

  const activeFlag = document.getElementById('activeFlag');
  if (activeFlag) activeFlag.className = 'flag-icon ' + flagClass;

  const langDropdown = document.getElementById('langDropdown');
  if (langDropdown) langDropdown.classList.remove('show');

  if (codiceLingua === 'it') {
    window.location.reload();
    return;
  }

  const selectGoogle = document.querySelector('.goog-te-combo');
  if (selectGoogle) {
    selectGoogle.value = codiceLingua;
    selectGoogle.dispatchEvent(new Event('change'));
  } else {
    window.location.reload();
  }
};

/* ==========================================
   2. GESTIONE SPLASH SCREEN ED EVENTI AVVIO
   ========================================== */
window.nascondiSplash = function() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  if (localStorage.getItem('salta_splash') === 'true') {
    localStorage.removeItem('salta_splash');
    splash.style.setProperty('display', 'none', 'important');
    return;
  }

  if (!splash.classList.contains('fade-out')) {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.setProperty('display', 'none', 'important');
    }, 400);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const flagClassSalvata = localStorage.getItem('flag_class_selezionata');
  const activeFlag = document.getElementById('activeFlag');
  if (flagClassSalvata && activeFlag) {
    activeFlag.className = 'flag-icon ' + flagClassSalvata;
  }

  if (localStorage.getItem('salta_splash') === 'true') {
    window.nascondiSplash();
  } else {
    setTimeout(window.nascondiSplash, 500);
  }

  precaricaTuttiICalInSilenzio();
});

/* ==========================================
   3. COOKIE BANNER E ANALYTICS
   ========================================== */
const ANALYTICS_ID = 'G-C291PEHWM7';

function caricaAnalytics() {
  if (window.analyticsCaricato) return;
  window.analyticsCaricato = true;

  var script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ANALYTICS_ID;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ANALYTICS_ID);
}

window.accettaCookie = function() {
  localStorage.setItem('consenso_cookie', 'accettato');
  const banner = document.getElementById('cookie-banner');
  if(banner) banner.style.display = 'none';
  caricaAnalytics();
};

window.rifiutaCookie = function() {
  localStorage.setItem('consenso_cookie', 'rifiutato');
  const banner = document.getElementById('cookie-banner');
  if(banner) banner.style.display = 'none';
};

if (localStorage.getItem('consenso_cookie') === 'accettato') {
  caricaAnalytics();
}

/* ==========================================
   4. CALENDARI NATIVI SINGOLI CON SELEZIONE INTELLIGENTE
   ========================================== */

const configurazioneCalendari = {
  'centrale': {
    elementId: 'cal-centrale',
    icalUrls: [
      'https://calendar.google.com/calendar/ical/usn7es2f9plpcssjkrlc6mpmg4u5i0i4@import.calendar.google.com/public/basic.ics'
    ]
  },
  'corallo': {
    elementId: 'cal-corallo',
    icalUrls: [
      'https://calendar.google.com/calendar/ical/houpucjjv0mu4cr02bk5n8cd9v6ele8o@import.calendar.google.com/public/basic.ics'
    ]
  },
  'oceano': {
    elementId: 'cal-oceano',
    icalUrls: [
      'https://calendar.google.com/calendar/ical/lmtdlre4n8fj9qhk8ksqf9lsi91qbhho@import.calendar.google.com/public/basic.ics'
    ]
  }
};

const cachePrenotazioni = {};
const statoMeseCalendario = {};
const selezioneDate = {};

function calcolaGiornoSuccessivo(dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function scaricaIcalConTimeout(urlProxy, timeoutMs = 2000) {
  const controller = new AbortController();
  const idTimer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(urlProxy, { signal: controller.signal });
    clearTimeout(idTimer);
    if (!res.ok) throw new Error("HTTP Errore");
    const text = await res.text();
    if (text && text.includes("BEGIN:VCALENDAR")) return text;
    throw new Error("Formato non valido");
  } catch (err) {
    clearTimeout(idTimer);
    throw err;
  }
}

async function scaricaIcalVeloce(icalUrl) {
  const urlPulito = decodeURIComponent(icalUrl);
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(urlPulito)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(urlPulito)}`,
    `https://corsproxy.io/?${encodeURIComponent(urlPulito)}`
  ];

  for (const proxy of proxies) {
    try {
      const testo = await scaricaIcalConTimeout(proxy, 2000);
      if (testo) return testo;
    } catch (e) {
      continue;
    }
  }
  return null;
}

async function caricaEUnisciDateSuite(nomeSuite) {
  const config = configurazioneCalendari[nomeSuite];
  if (!config) return [];

  const promesse = config.icalUrls.map(url => scaricaIcalVeloce(url));
  const risultati = await Promise.all(promesse);

  let tutteLeDate = [];
  risultati.forEach(textICS => {
    if (textICS) {
      tutteLeDate = tutteLeDate.concat(estraiDateDaICS(textICS));
    }
  });

  cachePrenotazioni[nomeSuite] = tutteLeDate;
  return tutteLeDate;
}

async function precaricaTuttiICalInSilenzio() {
  for (const key of Object.keys(configurazioneCalendari)) {
    statoMeseCalendario[key] = new Date();
    caricaEUnisciDateSuite(key);
  }
}

function estraiDateDaICS(icsText) {
  const intervalli = [];
  if (!icsText) return intervalli;

  const eventi = icsText.split("BEGIN:VEVENT");

  eventi.forEach(evt => {
    const startMatch = evt.match(/DTSTART[^:]*:(\d{8})/);
    const endMatch = evt.match(/DTEND[^:]*:(\d{8})/);

    if (startMatch && endMatch) {
      const s = startMatch[1];
      const e = endMatch[1];
      const da = `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}`;
      const a = `${e.substring(0,4)}-${e.substring(4,6)}-${e.substring(6,8)}`;
      intervalli.push({ da, a });
    }
  });

  return intervalli;
}

window.apriCalendario = async function(idDelPopup, nomeSuite) {
  const modal = document.getElementById(idDelPopup);
  if (modal) modal.style.display = "flex";

  if (nomeSuite && configurazioneCalendari[nomeSuite]) {
    if (!statoMeseCalendario[nomeSuite]) {
      statoMeseCalendario[nomeSuite] = new Date();
    }
    if (!selezioneDate[nomeSuite]) {
      selezioneDate[nomeSuite] = { checkin: null, checkout: null };
    }

    renderizzaGrigliaCalendario(nomeSuite);

    if (!cachePrenotazioni[nomeSuite] || cachePrenotazioni[nomeSuite].length === 0) {
      caricaEUnisciDateSuite(nomeSuite).then(() => {
        renderizzaGrigliaCalendario(nomeSuite);
      });
    }
  }
};

window.chiudiCalendario = function(idDelPopup) {
  const modal = document.getElementById(idDelPopup);
  if (modal) modal.style.display = "none";
};

window.addEventListener('click', function(event) {
  if (event.target && event.target.classList && event.target.classList.contains('modal-calendario')) {
    event.target.style.display = "none";
  }
});

window.selezionaDataGiorno = function(nomeSuite, dataStr) {
  const sel = selezioneDate[nomeSuite] || { checkin: null, checkout: null };
  const prenotazioni = cachePrenotazioni[nomeSuite] || [];
  const infoElem = document.getElementById(`info-selezione-${nomeSuite}`);

  const domaniStr = calcolaGiornoSuccessivo(dataStr);

  const domaniOccupato = prenotazioni.some(r => {
    if (r.da === r.a) return domaniStr === r.da;
    return domaniStr >= r.da && domaniStr < r.a;
  });

  // Deselezione completa o parziale
  if (sel.checkin === dataStr && sel.checkout === domaniStr && domaniOccupato) {
    sel.checkin = null;
    sel.checkout = null;
    if (infoElem) {
      infoElem.innerText = "👉 Clicca sui giorni liberi nel calendario per scegliere Check-in e Check-out";
      infoElem.style.color = 'var(--blu-notte-testo)';
    }
  }
  else if (sel.checkout === dataStr) {
    sel.checkout = null;
    if (infoElem) {
      const p = sel.checkin.split('-');
      infoElem.innerText = `Check-in: ${p[2]}/${p[1]}/${p[0]} ➔ Clicca sulla data di Check-out`;
      infoElem.style.color = 'var(--blu-mare)';
    }
  }
  else if (sel.checkin === dataStr && !sel.checkout) {
    sel.checkout = domaniStr;
    if (infoElem) {
      const pIn = sel.checkin.split('-');
      const pOut = sel.checkout.split('-');
      infoElem.innerText = `Soggiorno (1 notte): dal ${pIn[2]}/${pIn[1]}/${pIn[0]} al ${pOut[2]}/${pOut[1]}/${pOut[0]}`;
      infoElem.style.color = '#25d366';
    }
  }
  else if (sel.checkin === dataStr && sel.checkout) {
    sel.checkin = null;
    sel.checkout = null;
    if (infoElem) {
      infoElem.innerText = "👉 Clicca sui giorni liberi nel calendario per scegliere Check-in e Check-out";
      infoElem.style.color = 'var(--blu-notte-testo)';
    }
  }
  // Selezione Nuova
  else if (!sel.checkin || (sel.checkin && sel.checkout)) {
    sel.checkin = dataStr;

    if (domaniOccupato) {
      sel.checkout = domaniStr;
      if (infoElem) {
        const pIn = sel.checkin.split('-');
        const pOut = sel.checkout.split('-');
        infoElem.innerText = `Soggiorno (1 notte): dal ${pIn[2]}/${pIn[1]}/${pIn[0]} al ${pOut[2]}/${pOut[1]}/${pOut[0]}`;
        infoElem.style.color = '#25d366';
      }
    } else {
      sel.checkout = null;
      if (infoElem) {
        const p = dataStr.split('-');
        infoElem.innerText = `Check-in: ${p[2]}/${p[1]}/${p[0]} ➔ Clicca sulla data di Check-out`;
        infoElem.style.color = 'var(--blu-mare)';
      }
    }
  } 
  else if (sel.checkin && !sel.checkout) {
    if (dataStr <= sel.checkin) {
      sel.checkin = dataStr;
      sel.checkout = null;
      if (infoElem) {
        const p = dataStr.split('-');
        infoElem.innerText = `Check-in: ${p[2]}/${p[1]}/${p[0]} ➔ Clicca sulla data di Check-out`;
        infoElem.style.color = 'var(--blu-mare)';
      }
    } else {
      let tempDate = new Date(sel.checkin + 'T00:00:00');
      const endDate = new Date(dataStr + 'T00:00:00');
      let haOccupatiInMezzo = false;

      while (tempDate < endDate) {
        const yyyy = tempDate.getFullYear();
        const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
        const dd = String(tempDate.getDate()).padStart(2, '0');
        const dStr = `${yyyy}-${mm}-${dd}`;

        const isDayOccupied = prenotazioni.some(r => {
          if (r.da === r.a) return dStr === r.da;
          return dStr >= r.da && dStr < r.a;
        });

        if (isDayOccupied) {
          haOccupatiInMezzo = true;
          break;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }

      if (haOccupatiInMezzo) {
        alert("L'intervallo selezionato include giorni non disponibili! Scegli un'altra data.");
        return;
      }

      sel.checkout = dataStr;
      if (infoElem) {
        const pIn = sel.checkin.split('-');
        const pOut = sel.checkout.split('-');
        infoElem.innerText = `Soggiorno: dal ${pIn[2]}/${pIn[1]}/${pIn[0]} al ${pOut[2]}/${pOut[1]}/${pOut[0]}`;
        infoElem.style.color = '#25d366';
      }
    }
  }

  selezioneDate[nomeSuite] = sel;
  renderizzaGrigliaCalendario(nomeSuite);
};

function renderizzaGrigliaCalendario(nomeSuite) {
  const config = configurazioneCalendari[nomeSuite];
  const container = document.getElementById(config.elementId);
  if (!container) return;

  const dataRif = statoMeseCalendario[nomeSuite];
  const anno = dataRif.getFullYear();
  const mese = dataRif.getMonth();

  const nomiMesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", 
                    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

  let html = `
    <div class="cal-native-container">
      <div class="cal-header">
        <button type="button" onclick="cambiaMeseSuite('${nomeSuite}', -1)">❮</button>
        <h4>${nomiMesi[mese]} ${anno}</h4>
        <button type="button" onclick="cambiaMeseSuite('${nomeSuite}', 1)">❯</button>
      </div>
      <div class="cal-weekdays">
        <span>Lun</span><span>Mar</span><span>Mer</span><span>Gio</span><span>Ven</span><span>Sab</span><span>Dom</span>
      </div>
      <div class="cal-days-grid">
  `;

  const primoGiornoMese = new Date(anno, mese, 1).getDay();
  const giorniNelMese = new Date(anno, mese + 1, 0).getDate();
  const offsetInizio = (primoGiornoMese === 0) ? 6 : primoGiornoMese - 1;

  for (let i = 0; i < offsetInizio; i++) {
    html += `<div class="cal-day empty"></div>`;
  }

  const prenotazioni = cachePrenotazioni[nomeSuite] || [];
  const sel = selezioneDate[nomeSuite] || { checkin: null, checkout: null };

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  for (let g = 1; g <= giorniNelMese; g++) {
    const meseStr = String(mese + 1).padStart(2, '0');
    const gStr = String(g).padStart(2, '0');
    const dataStr = `${anno}-${meseStr}-${gStr}`;

    const dataCella = new Date(anno, mese, g);
    dataCella.setHours(0, 0, 0, 0);

    const ePassata = dataCella < oggi;

    const occupato = ePassata || prenotazioni.some(r => {
      if (r.da === r.a) return dataStr === r.da;
      return dataStr >= r.da && dataStr < r.a;
    });

    let classeStato = occupato ? 'occupato' : 'disponibile';
    let onClickAttr = occupato ? '' : `onclick="selezionaDataGiorno('${nomeSuite}', '${dataStr}')"`;

    if (dataStr === sel.checkin) {
      classeStato += ' selezionato-checkin';
    } else if (dataStr === sel.checkout) {
      classeStato += ' selezionato-checkout';
    } else if (sel.checkin && sel.checkout && dataStr > sel.checkin && dataStr < sel.checkout) {
      classeStato += ' in-range';
    }

    html += `<div class="cal-day ${classeStato}" ${onClickAttr}>${g}</div>`;
  }

  html += `
      </div>
      <div class="cal-legend">
        <span><i class="dot lib"></i> Libero</span>
        <span><i class="dot occ"></i> Occupato</span>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

window.cambiaMeseSuite = function(nomeSuite, dir) {
  if (statoMeseCalendario[nomeSuite]) {
    statoMeseCalendario[nomeSuite].setMonth(statoMeseCalendario[nomeSuite].getMonth() + dir);
    renderizzaGrigliaCalendario(nomeSuite);
  }
};

window.inviaRichiestaWA = function(nomeSuiteKey, nomeSuiteTitolo) {
  let sel = selezioneDate[nomeSuiteKey];

  if (!sel || !sel.checkin) {
    alert("Per favore, seleziona almeno la data di Check-in cliccando sui giorni liberi del calendario!");
    return;
  }

  if (sel.checkin && !sel.checkout) {
    sel.checkout = calcolaGiornoSuccessivo(sel.checkin);
  }

  const partsIn = sel.checkin.split('-');
  const partsOut = sel.checkout.split('-');
  const dataInFormattata = `${partsIn[2]}/${partsIn[1]}/${partsIn[0]}`;
  const dataOutFormattata = `${partsOut[2]}/${partsOut[1]}/${partsOut[0]}`;

  const messaggio = `Ciao! Ho visitato il vostro sito e vorrei informazioni sulla disponibilità per la ${nomeSuiteTitolo} dal ${dataInFormattata} al ${dataOutFormattata}.`;
  
  const urlWhatsApp = `https://wa.me/393477640421?text=${encodeURIComponent(messaggio)}`;
  window.open(urlWhatsApp, '_blank');
};

/* ==========================================
   5. MOTORE GALLERIA ULTRA-VELOCE (LOTTI PARALLELI)
   ========================================== */

const configurazioneGallerie = {
  'centrale': { cartella: 'image/suite-centrale/', titolo: 'Suite Centrale 44' },
  'corallo':  { cartella: 'image/suite-corallo/',  titolo: 'Suite Corallo' },
  'oceano':   { cartella: 'image/suite-oceano/',   titolo: 'Suite Oceano' }
};

const estensioniPossibili = ["webp", "jpg", "png", "jpeg", "WEBP", "JPG", "PNG", "JPEG"];

let playlistFotoAttuale = [];
let indiceFotoAttuale = 0;
let sessioneGalleriaId = 0;

window.apriGalleria = async function(nomeSuite) {
  const config = configurazioneGallerie[nomeSuite];
  if (!config) return;

  playlistFotoAttuale = [];
  sessioneGalleriaId++;
  const sessioneCorrente = sessioneGalleriaId;

  document.getElementById('titolo-galleria').innerText = `Galleria Foto - ${config.titolo}`;
  const griglia = document.getElementById('galleria-griglia');
  griglia.innerHTML = '<div style="grid-column: 1 / -1; color:white; text-align:center; padding: 20px;">⚡ Caricamento foto...</div>';

  const modal = document.getElementById('modal-galleria');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  let numeroInizio = 0;
  const DIMENSIONE_LOTTO = 10;
  let continuaScansione = true;
  let trovataAlmenoUna = false;

  while (continuaScansione) {
    if (sessioneGalleriaId !== sessioneCorrente) return;

    const promesseLotto = [];
    for (let i = 0; i < DIMENSIONE_LOTTO; i++) {
      const idx = numeroInizio + i;
      promesseLotto.push(
        cercaPrimoFormatoValido(config.cartella, idx).then(percorso => ({ idx, percorso }))
      );
    }

    const risultati = await Promise.all(promesseLotto);

    if (sessioneGalleriaId !== sessioneCorrente) return;

    risultati.sort((a, b) => a.idx - b.idx);

    let trovateNelLotto = 0;

    for (const item of risultati) {
      if (item.percorso) {
        trovateNelLotto++;
        if (!trovataAlmenoUna) {
          trovataAlmenoUna = true;
          griglia.innerHTML = '';
        }

        const indexInLista = playlistFotoAttuale.length;
        playlistFotoAttuale.push(item.percorso);

        const imgThumb = document.createElement('img');
        imgThumb.src = item.percorso;
        imgThumb.loading = "lazy";
        imgThumb.decoding = "async";
        imgThumb.alt = `${config.titolo} - Foto ${item.idx}`;
        imgThumb.onclick = () => apriFotoEspansa(indexInLista);
        griglia.appendChild(imgThumb);
      } else {
        continuaScansione = false;
        break;
      }
    }

    if (trovateNelLotto < DIMENSIONE_LOTTO) {
      continuaScansione = false;
    } else {
      numeroInizio += DIMENSIONE_LOTTO;
    }
  }

  if (!trovataAlmenoUna && sessioneGalleriaId === sessioneCorrente) {
    griglia.innerHTML = '<div style="grid-column: 1 / -1; color:white; text-align:center; padding: 20px;">Nessuna foto trovata nella cartella.</div>';
  }
};

function cercaPrimoFormatoValido(cartella, numero) {
  const verifiche = estensioniPossibili.map(ext => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const percorso = `${cartella}${numero}.${ext}`;
      img.onload = () => resolve(percorso);
      img.onerror = () => reject();
      img.src = percorso;
    });
  });

  return Promise.any(verifiche).catch(() => null);
}

window.apriFotoEspansa = function(indice) {
  indiceFotoAttuale = indice;
  document.getElementById('galleria-espansa').style.display = 'flex';
  aggiornaVistaFoto();
};

window.chiudiFotoEspansa = function() {
  document.getElementById('galleria-espansa').style.display = 'none';
};

window.chiudiGalleria = function() {
  sessioneGalleriaId++;
  document.getElementById('modal-galleria').style.display = 'none';
  chiudiFotoEspansa();
  document.body.style.overflow = 'auto';
};

window.cambiaFotoGalleria = function(direzione) {
  if (playlistFotoAttuale.length === 0) return;
  
  indiceFotoAttuale += direzione;

  if (indiceFotoAttuale < 0) {
    indiceFotoAttuale = playlistFotoAttuale.length - 1;
  } else if (indiceFotoAttuale >= playlistFotoAttuale.length) {
    indiceFotoAttuale = 0;
  }
  aggiornaVistaFoto();
};

function aggiornaVistaFoto() {
  const imgElement = document.getElementById('img-galleria');
  const contatore = document.getElementById('contatore-foto');

  imgElement.src = playlistFotoAttuale[indiceFotoAttuale];
  contatore.innerText = `${indiceFotoAttuale + 1} / ${playlistFotoAttuale.length}`;
}

document.addEventListener('keydown', function(event) {
  const espansa = document.getElementById('galleria-espansa').style.display === 'flex';
  const griglia = document.getElementById('modal-galleria').style.display === 'flex';

  if (espansa) {
    if (event.key === 'ArrowLeft') cambiaFotoGalleria(-1);
    if (event.key === 'ArrowRight') cambiaFotoGalleria(1);
    if (event.key === 'Escape') chiudiFotoEspansa();
  } else if (griglia) {
    if (event.key === 'Escape') chiudiGalleria();
  }
});

/* ==========================================
   15. CONTROLLER FRECCE CAROUSEL (0ms Latency & Snap Perfetto)
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
  const grid = document.getElementById('grid-strutture');
  const btnPrev = document.getElementById('btn-prev-case');
  const btnNext = document.getElementById('btn-next-case');

  // Se siamo in una pagina senza carousel, si ferma senza creare errori
  if (!grid || !btnPrev || !btnNext) return;

  function aggiornaFrecce() {
    // 1. Se le card entrano tutte nello schermo (es. su PC), nascondi entrambe le frecce
    if (grid.scrollWidth <= grid.clientWidth + 10) {
      btnPrev.classList.add('hidden');
      btnNext.classList.add('hidden');
      return;
    }

    // 2. Controllo SINISTRA: Siamo all'inizio?
    // Usiamo 20px di margine di sicurezza per i calcoli decimali dei telefoni
    if (grid.scrollLeft <= 20) {
      btnPrev.classList.add('hidden');
    } else {
      btnPrev.classList.remove('hidden');
    }

    // 3. Controllo DESTRA: Siamo alla fine?
    if (grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 20) {
      btnNext.classList.add('hidden');
    } else {
      btnNext.classList.remove('hidden');
    }
  }

  // Ascoltatore nativo e "passivo" per non bloccare mai la grafica durante il tocco
  grid.addEventListener('scroll', aggiornaFrecce, { passive: true });
  window.addEventListener('resize', aggiornaFrecce);
  
  // Calcolo iniziale (con piccolo ritardo per attendere il rendering del browser)
  setTimeout(aggiornaFrecce, 150);

  // Funzione del click sulla freccia
  window.scorriCarousel = function(direzione) {
    // Trova la prima card per misurarne l'esatta larghezza dinamica
    const primaCard = grid.querySelector('.card-casa');
    if (!primaCard) return;
    
    // Calcola lo spostamento: larghezza esatta della card + spazio vuoto (gap CSS di circa 24px)
    const spostamento = (primaCard.offsetWidth + 24) * direzione;
    
    // Dice al browser di scorrere. Il CSS "scroll-snap" farà da calamita per l'allineamento finale
    grid.scrollBy({ left: spostamento, behavior: 'smooth' });
  };
});
