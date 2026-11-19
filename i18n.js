/* NOVAE interface translations. Italian is the source language: app.js writes Italian, and when English is chosen
   every interface text (text nodes, placeholder, aria-label, title) is looked up here and swapped.
   What people write (descriptions, comments, bios, messages, reviews, work and collection titles) is never translated. */
window.NOVAE_I18N = { en: {} };
(() => {
  const CATS = {
    'Pittura e illustrazione': 'Painting and illustration', 'Musica': 'Music', 'Letteratura': 'Literature', 'Cinema e video': 'Film and video',
    'Fotografia': 'Photography', 'Design': 'Design', 'Architettura': 'Architecture', 'Moda': 'Fashion', 'Scultura': 'Sculpture',
    'Fumetto': 'Comics', 'Animazione': 'Animation', 'Teatro e performance': 'Theatre and performance', 'Danza': 'Dance',
    'Street art': 'Street art', 'Artigianato': 'Crafts', 'Installazione e arti ambientali': 'Installation and environmental art',
    'Arti digitali e tecnologiche': 'Digital and tech art', 'Videogiochi e arti interattive': 'Video games and interactive art',
    'Arti culinarie': 'Culinary arts', 'Body art': 'Body art', 'Arte memetica': 'Meme art',
  };
  const COUNTRIES = {
    Italia: 'Italy', Giappone: 'Japan', Thailandia: 'Thailand', Francia: 'France', Messico: 'Mexico', Nigeria: 'Nigeria',
    Brasile: 'Brazil', India: 'India', Spagna: 'Spain', Germania: 'Germany', 'Stati Uniti': 'United States', 'Regno Unito': 'United Kingdom',
  };
  const MONTHS = { gennaio: 'January', febbraio: 'February', marzo: 'March', aprile: 'April', maggio: 'May', giugno: 'June', luglio: 'July',
    agosto: 'August', settembre: 'September', ottobre: 'October', novembre: 'November', dicembre: 'December' };
  const MON = { gen: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', mag: 'May', giu: 'Jun', lug: 'Jul', ago: 'Aug', set: 'Sep', ott: 'Oct', nov: 'Nov', dic: 'Dec' };
  const DAYS = { lun: 'Mon', mar: 'Tue', mer: 'Wed', gio: 'Thu', ven: 'Fri', sab: 'Sat', dom: 'Sun', ieri: 'yesterday', oggi: 'today', ora: 'now' };
  const num = s => s.replace(/\./g, '\u0000').replace(/,/g, '.').replace(/\u0000/g, ','); // 1.240,5 -> 1,240.5
  const pl = (n, one, many) => `${n} ${+String(n).replace(/\D/g, '') === 1 ? one : many}`;

  const dict = {
    'Sfoglia': 'Browse', 'Scorri': 'Scroll', 'Modo di vista': 'View mode',
    // prima e dopo, processo, collaborazioni, mostra, biglietto da visita
    'Prima': 'Before', 'Dopo': 'After', 'Prima e dopo: trascina per confrontare': 'Before and after: drag to compare', 'Processo': 'Process', 'e': 'and',
    'Bozza, processo, collaborazione': 'Sketch, process, collaboration', 'Prima e dopo': 'Before and after', 'Insieme a': 'Together with', 'Nessuno': 'No one',
    "Chi guarda trascina una barra per confrontare la bozza con l'opera finita.": 'Viewers drag a bar to compare the sketch with the finished work.',
    "Da 2 a 6 foto delle fasi, in ordine: scorrono come un piccolo video e finiscono sull'opera.": 'From 2 to 6 photos of the stages, in order: they play like a short video and end on the work.',
    "L'opera compare su tutti e due i profili. Con il server, l'altro artista dovrà accettare.": 'The work shows on both profiles. Once there is a server, the other artist will have to accept.',
    'Aggiungi la bozza': 'Add the sketch', 'Bozza aggiunta. Tocca per cambiarla': 'Sketch added. Tap to change it', 'Aggiungi le fasi': 'Add the stages',
    'fasi aggiunte. Tocca per cambiarle': 'stages added. Tap to change them', 'Scegli almeno due foto delle fasi.': 'Choose at least two photos of the stages.',
    'Mostra': 'Exhibition', 'Scorri per la prossima opera': 'Swipe for the next work',
    'Biglietto da visita': 'Business card', 'Il tuo biglietto da visita': 'Your business card', 'Salva immagine': 'Save image',
    'Da stampare o da mettere nelle storie. Il QR fa entrare su NOVAE con il tuo invito.': 'To print or post in your stories. The QR lets people into NOVAE with your invite.',
    'Inquadra il codice': 'Scan the code', 'per entrare su NOVAE': 'to get into NOVAE', 'il social di chi crea': 'the social network for makers',
    ...CATS, ...COUNTRIES,
    // navigation, sections, titles
    'Galleria': 'Gallery', 'Scopri': 'Discover', 'Stile': 'Style', 'Mercato': 'Market', 'Mercato Novae': 'Novae Market', 'Mercato<br>Novae': 'Novae<br>Market', 'Profilo': 'Profile',
    'Messaggi': 'Messages', 'Impostazioni': 'Settings', 'Novae': 'Novae', 'Invito': 'Invite', 'Post': 'Post', 'Opera': 'Work', 'Artista': 'Artist',
    'Menu': 'Menu', 'Menu principale': 'Main menu', 'Navigazione': 'Navigation', 'Cerca': 'Search', 'Chiudi': 'Close', 'Indietro': 'Back',
    'Apri ruota delle sezioni': 'Open the section wheel', 'Chiudi ruota': 'Close the wheel', 'Regole e privacy': 'Rules and privacy',
    'Scheda opera': 'Work details', 'Commenti del post': 'Post comments', 'Globo con gli artisti nel mondo': 'Globe with artists around the world',
    'Paese precedente': 'Previous country', 'Paese successivo': 'Next country', 'Carico il mondo...': 'Loading the world...',
    'Mappa non disponibile offline': 'Map not available offline', 'Non riesco a caricare il globo': 'Can\'t load the globe',
    'Ancora nessun artista in questo paese': 'No artists in this country yet',
    // gate
    'Ti serve un invito per entrare': 'You need an invite to get in', 'Hai un codice?': 'Have a code?', 'Entra': 'Enter',
    'Codice QR di invito': 'Invite QR code', 'Inquadra il QR di chi ti invita, oppure inserisci il codice.': 'Scan the QR code of whoever invited you, or enter the code.',
    'Il codice ha almeno 4 caratteri. In questa alpha qualsiasi codice valido funziona.': 'Codes have at least 4 characters. In this alpha any valid code works.',
    'Il codice del tuo invito è già scritto: tocca Entra.': 'Your invite code is already filled in: tap Enter.',
    'Entrando accetti i': 'By entering you accept the', 'Termini': 'Terms', ', le': ', the', "e l'": 'and the ', 'Informativa privacy': 'Privacy policy',
    // feed, posts, actions
    'Mi piace': 'Like', 'Commenti': 'Comments', 'Commento': 'Comment', 'Ripubblica': 'Repost', 'Condividi': 'Share', 'Altro': 'More', 'Altre azioni': 'More actions',
    'Salva': 'Save', 'Rimuovi dai salvati': 'Remove from saved', 'Segnala': 'Report', 'Non mi interessa': 'Not interested', 'Nuova': 'New',
    'Modifica opera': 'Edit work', 'Elimina opera': 'Delete work', 'Elimina': 'Delete', 'Annulla': 'Cancel', 'Riproduci': 'Play',
    'Scorri per la prossima': 'Swipe for the next one', 'Hai nascosto tutto': 'You\'ve hidden everything',
    'Le opere che segni "Non mi interessa" spariscono da qui.': 'Works you mark "Not interested" disappear from here.', 'Mostrale di nuovo': 'Show them again',
    'Feed aggiornato': 'Feed updated', 'Link copiato': 'Link copied', 'Non vedrai più questa opera': 'You won\'t see this work again',
    'Salvata nel tuo profilo': 'Saved to your profile', 'Rimossa dai salvati': 'Removed from saved', 'Opera eliminata': 'Work deleted',
    'Sparisce dal feed e dal tuo profilo. Non si può annullare.': 'It disappears from the feed and your profile. This can\'t be undone.',
    'Post non trovato': 'Post not found', 'Forse è stato eliminato.': 'It may have been deleted.', 'Torna a Scopri': 'Back to Discover',
    'Scrivi la tua risposta': 'Write your reply', 'Scrivi la tua recensione': 'Write your review', 'La tua risposta': 'Your reply', 'La tua recensione': 'Your review',
    'Rispondi': 'Reply', 'Pubblica': 'Publish', 'Solo i critici possono dare le stelle.': 'Only critics can give stars.', 'Le tue stelle': 'Your stars',
    'Risposta pubblicata': 'Reply posted', 'Ancora nessuna risposta. Scrivi la prima.': 'No replies yet. Write the first one.',
    'Ancora nessun commento. Scrivi il primo.': 'No comments yet. Write the first one.', 'Aggiungi un commento': 'Add a comment', 'Invia': 'Send',
    'ripubblicazioni': 'reposts', 'mi piace': 'likes', 'visualizzazioni': 'views', 'Visualizzazioni': 'Views',
    'Solo per i follower': 'Followers only', 'Follower': 'Followers', 'Visibile solo a chi segue l\'autore': 'Only visible to the author\'s followers',
    'Scheda completa': 'Full details', 'Descrizione': 'Description', 'Anno': 'Year', 'Paese': 'Country', 'Categoria': 'Category', 'Disciplina': 'Category',
    'Opere correlate': 'Related works', 'Opere correlate*': 'Related works*', 'Immagine dell\'opera': 'Image of the work',
    'Anteprima: il player vero arriva nella prossima alpha': 'Preview: the real player comes in the next alpha',
    // gallery and film page
    'In arrivo': 'Coming soon', 'Serie': 'Series', 'Film': 'Films', 'Classifica': 'Charts', 'Ordina per': 'Sort by', 'Ordina le opere': 'Sort works',
    'Più recenti': 'Newest', 'Più stelle': 'Most stars', 'Più visti': 'Most viewed', 'Thriller': 'Thriller', 'Storico': 'Historical', 'Apri Scopri': 'Open Discover',
    // style
    'Coming soon': 'Coming soon', 'Una nuova sezione di NOVAE è in arrivo.': 'A new NOVAE section is on its way.', 'Intanto apri Scopri': 'Meanwhile, open Discover',
    // market
    'Acquista': 'Buy', 'crediti': 'credits', 'Acquisto in crediti disponibile a breve': 'Buying with credits is coming soon',
    'Chi la acquista riceve il file originale e una stella sul profilo.': 'Whoever buys it gets the original file and a star on their profile.',
    // profile
    'Il tuo nome': 'Your name', 'Scrivi qui chi sei e cosa crei. Gli altri artisti lo leggeranno prima di seguirti.': 'Write who you are and what you make. Other artists will read it before following you.',
    'Modifica profilo': 'Edit profile', 'Pubblica opera': 'Publish work', 'Pubblica per i follower': 'Publish for followers', 'Segui': 'Follow', 'Segui già': 'Following',
    'Messaggio': 'Message', 'Opere': 'Works', 'Repost': 'Reposts', 'Salvate': 'Saved', 'Recensioni': 'Reviews', 'Recenti': 'Recent', 'Stelle': 'Stars',
    'opere': 'works', 'opera': 'work', 'recensione': 'review', 'salvata': 'saved', 'seguito': 'following', 'seguace': 'follower', 'cuore': 'heart', 'lettore': 'reader', 'ripubblicazione': 'repost', 'visualizzazione': 'view', 'mi piace⁠': 'like',
    'salvate': 'saved', 'seguiti': 'following', 'seguaci': 'followers', 'cuori': 'hearts', 'recensioni': 'reviews', 'lettori': 'readers',
    'Critico': 'Critic', 'Utente': 'User', 'Artisti': 'Artists', 'Pubblica opere': 'Publishes works', 'Scrive recensioni': 'Writes reviews', 'Guarda, salva e vota': 'Watches, saves and rates',
    'Costellazioni': 'Constellations', 'Tutte': 'All', 'Nuova costellazione': 'New constellation', 'Crea costellazione': 'Create constellation',
    'Costellazione pubblicata': 'Constellation published', 'Costellazione eliminata': 'Constellation deleted', 'Elimina costellazione': 'Delete constellation',
    'Opere (almeno 2)': 'Works (at least 2)', 'Pubblica o salva almeno due opere per creare una costellazione.': 'Publish or save at least two works to create a constellation.',
    'Dai un nome alla costellazione.': 'Give the constellation a name.', 'Scegli almeno due opere.': 'Pick at least two works.',
    'Cosa tiene insieme queste opere? (facoltativo)': 'What holds these works together? (optional)', "Es. Notti d'inverno": 'E.g. Winter nights',
    'La tua prima opera': 'Your first work', 'Tocca "Pubblica opera" e condividila con chi ti segue.': 'Tap "Publish work" and share it with your followers.',
    'La tua prima recensione': 'Your first review', 'Apri un\'opera in Scopri, scegli le stelle e scrivi cosa ne pensi.': 'Open a work in Discover, pick the stars and write what you think.',
    'Scrivi una recensione': 'Write a review', 'Come utente, le tue opere le vede solo chi ti segue.': 'As a user, only your followers see your works.',
    'Pubblicala: la vedranno solo le persone che ti seguono.': 'Publish it: only the people who follow you will see it.',
    'Nessuna opera': 'No works', 'Niente di salvato': 'Nothing saved', 'Tocca i tre puntini su un\'opera e scegli Salva.': 'Tap the three dots on a work and choose Save.',
    'Nessun repost': 'No reposts', 'Tocca le frecce sotto un\'opera in Scopri per ripubblicarla qui.': 'Tap the arrows under a work in Discover to repost it here.',
    'Nessuna recensione': 'No reviews', 'Non ha ancora recensito opere.': 'Hasn\'t reviewed any works yet.',
    'non ha ancora pubblicato.': 'hasn\'t published anything yet.', 'non ha ancora ripubblicato opere.': 'hasn\'t reposted any works yet.',
    'Cambia banner': 'Change banner', 'Togli il banner': 'Remove banner', 'Scegli un banner': 'Choose a banner', 'Immagine del banner': 'Banner image',
    'Banner': 'Banner', 'Tipo di profilo': 'Profile type', 'Nome': 'Name', 'Nome utente': 'Username', 'Bio': 'Bio', 'Salva modifiche': 'Save changes',
    'Profilo aggiornato': 'Profile updated', 'Il nome non può essere vuoto.': 'The name can\'t be empty.',
    'Nome utente: 3-24 caratteri tra lettere, numeri, punto e trattino basso.': 'Username: 3-24 characters, letters, numbers, dots and underscores.',
    'Spazio pieno su questo dispositivo: scegli un banner più leggero.': 'Storage is full on this device: choose a lighter banner.',
    // publish
    'Nuova opera': 'New work', 'Scegli un\'immagine': 'Choose an image', 'Titolo': 'Title', 'Come si chiama?': 'What is it called?',
    "Racconta com'è nata (facoltativo)": 'Tell how it came about (optional)', 'Salva l\'opera': 'Save the work', 'Cambia immagine': 'Change image',
    'Opera pubblicata': 'Work published', 'Opera aggiornata': 'Work updated', 'Appena pubblicata.': 'Just published.',
    'Non riesco a leggere questa immagine. Prova con un JPG o PNG.': 'Can\'t read this image. Try a JPG or PNG.', 'Scegli prima un\'immagine.': 'Choose an image first.',
    'Dai un titolo alla tua opera.': 'Give your work a title.', 'Spazio pieno su questo dispositivo: usa un\'immagine più leggera.': 'Storage is full on this device: use a lighter image.',
    'Spazio pieno su questo dispositivo: elimina una tua opera e riprova.': 'Storage is full on this device: delete one of your works and try again.',
    // messages
    'Nuovo messaggio': 'New message', 'Scrivi un messaggio': 'Write a message', 'Inizia tu': 'You start', 'Tu:': 'You:', 'Tu': 'You',
    // settings
    'Account': 'Account', 'Profilo privato': 'Private profile', 'Solo chi segui vede le tue opere': 'Only people you follow see your works',
    'Lingua': 'Language', 'Interfaccia': 'Interface', 'Esperienza': 'Experience', 'Notifiche Novae': 'Novae notifications',
    'Quando un artista che segui pubblica': 'When an artist you follow publishes', 'Riproduzione automatica': 'Autoplay', 'Video e audio nel feed': 'Video and audio in the feed',
    'Mostra valutazioni': 'Show ratings', 'Le stelle rosse sopra le opere': 'The red stars on works', 'Inviti': 'Invites', 'Il tuo codice': 'Your code',
    'Sei entrato con questo invito': 'You got in with this invite', 'Invita qualcuno': 'Invite someone', 'Mostra QR': 'Show QR', 'App': 'App',
    'Installa l\'app': 'Install the app', 'NOVAE sulla schermata Home, a schermo intero': 'NOVAE on your Home Screen, full screen', 'Installa': 'Install',
    'App installata': 'App installed', 'Stai usando NOVAE dalla schermata Home': 'You\'re using NOVAE from your Home Screen', 'Installa NOVAE': 'Install NOVAE',
    'NOVAE installata': 'NOVAE installed', 'Condividi': 'Share', 'Aggiungi alla schermata Home': 'Add to Home Screen', 'Apri il menu del browser': 'Open the browser menu',
    'Installa app': 'Install app', 'Aggiungi a schermata Home': 'Add to Home Screen', 'e scegli': 'and choose', '(o': '(or', 'In Safari tocca': 'In Safari tap', ', poi': ', then',
    'Regole della community': 'Community rules', 'Cosa si può pubblicare e come funzionano le segnalazioni': 'What you can post and how reports work',
    "Termini d'uso": 'Terms of use', 'Privacy': 'Privacy', 'Esci da NOVAE': 'Log out of NOVAE', 'Esci': 'Log out', 'Italiano': 'Italiano', 'English (in arrivo)': 'English',
    'Presto disponibile': 'Coming soon',
    // search
    'Cerca opere e artisti': 'Search works and artists', 'Titolo, artista, paese': 'Title, artist, country', 'Recenti ': 'Recent', 'Cancella': 'Clear',
    'Premi': 'Press', 'ovunque per cercare,': 'anywhere to search,', 'per chiudere.': 'to close.', 'Nessun risultato': 'No results',
    // bars menu, notifications, create, QR, problem
    'Notifiche': 'Notifications', 'Nuove notifiche': 'New notifications', 'Crea': 'Create', 'Codice QR': 'QR code', 'Segnala un problema': 'Report a problem',
    'ha iniziato a seguirti': 'started following you', 'ha recensito': 'reviewed', 'ha pubblicato': 'published', 'ha messo mi piace a': 'liked',
    'Il tuo codice QR di invito': 'Your invite QR code', 'Condividi invito': 'Share invite', 'Invito copiato': 'Invite copied',
    'Cosa è successo?': 'What happened?', 'Cosa stavi facendo e cosa non ha funzionato': 'What were you doing and what didn\'t work',
    'Si apre GitHub con il testo già scritto: serve un account e la segnalazione è pubblica.': 'GitHub opens with the text already filled in: you need an account and the report is public.',
    'Continua su GitHub': 'Continue on GitHub', 'Scrivi cosa è successo.': 'Write what happened.',
    // report
    'Motivo': 'Reason', 'Spam o truffa': 'Spam or scam', 'Insulti, odio o molestie': 'Insults, hate or harassment', 'Violenza o minacce': 'Violence or threats',
    'Contenuto sessuale esplicito': 'Explicit sexual content', 'Non è sua: opera copiata da qualcun altro': 'Not theirs: copied from someone else',
    'Generata con IA senza dirlo': 'Made with AI without saying so', 'Mostra dati personali di qualcuno': 'Shows someone\'s personal data',
    'Dettagli (facoltativo)': 'Details (optional)', 'Cosa c\'è che non va?': 'What\'s wrong?', 'Non mostrarmi più questa opera': 'Don\'t show me this work again',
    'Chi pubblica non saprà che sei stato tu. Le': 'The person who posted won\'t know it was you. The',
    'spiegano cosa succede dopo. Nell\'alpha la segnalazione resta sul tuo telefono: arriverà ai moderatori quando ci sarà il server.': 'explain what happens next. In the alpha the report stays on your phone: it will reach the moderators once there is a server.',
    'Invia segnalazione': 'Send report', 'Scegli un motivo.': 'Pick a reason.', 'Segnalazione salvata. Grazie': 'Report saved. Thank you',
    // install sheet + misc
    'Esc': 'Esc', 'Kittipong': 'Kittipong', 'Ploy': 'Ploy',
  };
  const rules = [
    [/^(· )?(\d+) (min|h|g)$/, (m, d, n, u) => `${d || ''}${n} ${u === 'g' ? 'd' : u}`],
    [/^(lun|mar|mer|gio|ven|sab|dom|ieri|oggi|ora)$/, (m, d) => DAYS[d]],
    [/^(\d+) (gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)$/, (m, n, mo) => `${n} ${MON[mo]}`],
    [/^([\d.,]+K?) (opere|opera)$/, (m, n) => pl(num(n), 'work', 'works')],
    [/^([\d.,]+) (stelle|stella)$/, (m, n) => pl(n, 'star', 'stars')],
    [/^([\d.,]+) commenti$/, (m, n) => `${num(n)} comments`],
    [/^(\d+) artisti, (\d+) opere$/, (m, a, o) => `${pl(a, 'artist', 'artists')}, ${pl(o, 'work', 'works')}`],
    [/^(\d+) artista, (\d+) opere$/, (m, a, o) => `1 artist, ${pl(o, 'work', 'works')}`],
    [/^Valutazione ([\d,]+) su 5$/, (m, v) => `Rated ${v.replace(',', '.')} out of 5`],
    [/^Apri (.+) a schermo intero$/, (m, t) => `Open ${t} full screen`],
    [/^Segui (.+)$/, (m, n) => `Follow ${n}`],
    [/^Segnala “(.+)”$/, (m, t) => `Report “${t}”`],
    [/^Eliminare "(.+)"\?$/, (m, t) => `Delete "${t}"?`],
    [/^(.+) condivide le sue opere solo con i suoi follower\.$/, (m, n) => `${n} only shares their works with followers.`],
    [/^(@\S+), (.+)$/, (m, h, c) => COUNTRIES[c] ? `${h}, ${COUNTRIES[c]}` : m],
    [/^(.+), (.+)$/, (m, a, c) => { const k = Object.keys(CATS).find(x => x.toLowerCase() === c); return k ? `${a}, ${CATS[k].toLowerCase()}` : m; }],
    [/^Il tuo nome, (@\S+)$/, (m, h) => `Your name, ${h}`],
    [/^Nessuna opera di (.+) per ora\. Se sei un artista, pubblica la prima dal tuo profilo\.$/, (m, c) => {
      const k = Object.keys(CATS).find(x => x.toLowerCase() === c); return `No ${(k ? CATS[k] : c).toLowerCase()} works yet. If you're an artist, publish the first one from your profile.`; }],
    [/^(\d+) inviti, ognuno vale (\d+) giorni$/, (m, n, d) => `${n} invites, each valid for ${d} days`],
    [/^Hai (\d+) inviti\. Chi entra con il tuo codice risulta invitato da te\.$/, (m, n) => `You have ${n} invites. Anyone who joins with your code shows up as invited by you.`],
    [/^Fallo inquadrare con la fotocamera: si apre NOVAE con il codice già scritto\. Vale per una persona, fino al (\d+) (\w+)\.$/, (m, d, mo) =>
      `Let them scan it with their camera: NOVAE opens with the code already filled in. Valid for one person, until ${MONTHS[mo] || mo} ${d}.`],
    [/^Recensione pubblicata con (\d+) (stelle|stella)$/, (m, n) => `Review posted with ${pl(n, 'star', 'stars')}`],
    [/^Scrivi il primo messaggio a (.+)\.$/, (m, n) => `Write the first message to ${n}.`],
    [/^Edizione unica di (.+)\. Chi la acquista riceve il file originale e una stella sul profilo\.$/, (m, n) =>
      `One-of-a-kind edition by ${n}. Whoever buys it gets the original file and a star on their profile.`],
    [/^Edizione unica di$/, () => 'One-of-a-kind edition by'],
    [/^Tu: (.+)$/, (m, t) => `You: ${t}`],
    [/^(.+) \| NOVAE$/, (m, t) => `${tr(t)} | NOVAE`],
  ];
  const norm = s => s.replace(/[‘’]/g, "'");
  const D = Object.fromEntries(Object.entries(dict).map(([k, v]) => [norm(k), v]));
  function tr(s) {
    const core = s.trim();
    if (!core) return s;
    const k = norm(core);
    let out = D[k];
    if (out === undefined) for (const [re, f] of rules) { const m = k.match(re); if (m) { out = typeof f === 'string' ? f : f(...m); if (out !== m[0]) break; out = undefined; } }
    if (out === undefined) return s;
    return s.slice(0, s.indexOf(core[0])) + out + s.slice(s.lastIndexOf(core.slice(-1)) + 1); // keep the spaces around it
  }
  window.NOVAE_I18N.en.tr = tr;
})();
