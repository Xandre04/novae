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
    // firma, punto sull'opera, zoom, AR
    'Firma': 'Signature', 'Firma qui col dito': 'Sign here with your finger', 'Cancella la firma': 'Clear the signature', 'Disegna qui la tua firma': 'Draw your signature here',
    'Compare sulle targhette delle tue opere nella Mostra e sul biglietto da visita.': 'It appears on the labels of your works in the Exhibition and on your business card.',
    'Qui': 'Here', "Mostra il punto sull'opera": 'Show the spot on the work', "Indica un punto dell'opera": 'Point at a spot on the work',
    "Tocca il punto sull'opera": 'Tap the spot on the work', 'Punto scelto. Tocca per toglierlo': 'Spot chosen. Tap to remove it',
    'Scorri per la prossima, doppio tocco per avvicinarti': 'Swipe for the next one, double tap to get closer', 'Doppio tocco per avvicinarti': 'Double tap to get closer',
    'Misure': 'Size', 'Misure in cm': 'Size in cm', 'Larghezza': 'Width', 'Altezza': 'Height', 'Larghezza in cm': 'Width in cm', 'Altezza in cm': 'Height in cm',
    'Servono per vederla sul muro, in realtà aumentata, alla grandezza vera.': 'Used to see it on a wall, in augmented reality, at its real size.',
    'Misure, bozza, processo, collaborazione': 'Size, sketch, process, collaboration',
    'Vedila sul tuo muro': 'See it on your wall', "Preparo l'opera per il tuo muro": 'Getting the work ready for your wall', 'Non riesco a preparare questa immagine': "I can't prepare this image",
    'Roma': 'Rome', 'Milano': 'Milan', 'Marsiglia': 'Marseille', 'Lione': 'Lyon', 'San Paolo': 'São Paulo', // cities on the globe
    'Museo': 'Museum', 'Arte contemporanea': 'Contemporary art', 'Arte digitale': 'Digital art', "Luogo d'arte": 'Art site', 'Torna al globo': 'Back to the globe',
    'Firenze': 'Florence', 'Venezia': 'Venice', 'Napoli': 'Naples', 'Parigi': 'Paris', 'Nuova Delhi': 'New Delhi', 'Città del Messico': 'Mexico City', 'Tempio Bianco': 'White Temple',
    'Bosco sacro di Osun': 'Osun Sacred Grove', 'Museo Nazionale': 'National Museum', "Museo d'arte di Kyoto": 'Kyoto Museum of Art', "Naoshima, l'isola dell'arte": 'Naoshima, the art island',
    'Murales di Orgosolo': 'Orgosolo murals', 'Murales dei Quartieri Spagnoli': 'Spanish Quarter murals', 'Murales di Orozco': 'Orozco murals',
    'Correlati': 'Related', 'Sei offline: vedi quello che hai già aperto': "You're offline: you can see what you've already opened", 'Di nuovo online': 'Back online', 'Bozza': 'Sketch', 'Nello studio': 'In the studio', 'Aggiungi le foto': 'Add the photos', 'foto aggiunte. Tocca per cambiarle': 'photos added. Tap to change them',
    "Fino a 4 foto di com'è nata (studio, schizzi, materiali): si vedono scorrendo di lato il post.": 'Up to 4 photos of how it was made (studio, sketches, materials): people see them by swiping the post sideways.',
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
    'Messaggi, recensioni, commenti e attività': 'Messages, reviews, comments and activity',
    'Attive su questo dispositivo': 'Active on this device',
    'Su iPhone aggiungi prima NOVAE alla schermata Home': 'On iPhone, add NOVAE to your Home Screen first',
    'Bloccate dal browser: riattivale nelle impostazioni': 'Blocked by browser: re-enable in settings',
    'Non supportate da questo browser': 'Not supported by this browser',
    'Notifiche su iPhone': 'Notifications on iPhone',
    "Su iOS le notifiche funzionano solo dall'app nella schermata Home. In Safari tocca": 'On iOS notifications only work from the Home Screen app. In Safari tap',
    'Aggiungi NOVAE alla schermata Home per attivare le notifiche': 'Add NOVAE to your Home Screen to enable notifications',
    'Qualcuno': 'Someone', 'Un critico': 'A critic', 'Un artista': 'An artist', 'la tua opera': 'your work', "un'opera": 'a work',
    'una costellazione': 'a constellation', 'segnalata': 'reported', 'Ti ha scritto un nuovo messaggio': 'Sent you a new message',
    'Notifiche attivate': 'Notifications enabled', 'Notifiche disattivate': 'Notifications disabled',
    'Notifiche bloccate: riattivale nelle impostazioni del dispositivo': 'Notifications blocked: re-enable them in device settings',
    'Notifiche non supportate da questo browser': 'Notifications are not supported in this browser',
    'Per ricevere notifiche su iPhone aggiungi NOVAE alla schermata Home da Safari (Condividi → Aggiungi alla schermata Home).': 'To get notifications on iPhone, add NOVAE to your Home Screen from Safari (Share → Add to Home Screen).',
    'Come aggiungerla': 'How to add it',
    'Hai bloccato le notifiche: riattivale dalle impostazioni di Safari o del dispositivo.': 'You blocked notifications: re-enable them in Safari or device settings.',
    'Messaggi diretti': 'Direct messages', 'Quando ricevi un nuovo messaggio privato': 'When you receive a new private message',
    'Recensioni dei critici': 'Critic reviews', 'Quando un critico recensisce una tua opera con le stelle': 'When a critic reviews your work with stars',
    'Commenti e note ("Qui")': 'Comments and spot notes ("Here")', 'Quando qualcuno commenta o indica un punto sulla tua opera': 'When someone comments or marks a spot on your work',
    'Inviti a collaborazione': 'Collaboration invites', 'Quando un artista ti aggiunge in "Insieme a"': 'When an artist adds you under "Together with"',
    'Nuovi follower': 'New followers', 'Quando qualcuno inizia a seguirti': 'When someone starts following you',
    'Inviti accettati': 'Accepted invites', 'Quando qualcuno entra su NOVAE col tuo codice': 'When someone joins NOVAE with your code',
    'Mi piace sulle tue opere': 'Likes on your works', 'Quando qualcuno mette mi piace a una tua opera': 'When someone likes one of your works',
    'Ripubblicazioni (Repost)': 'Reposts', 'Quando qualcuno ripubblica una tua opera': 'When someone reposts one of your works',
    'Quando una tua opera entra in una costellazione': 'When one of your works joins a constellation',
    'Segnalazioni (Moderazione)': 'Reports (Moderation)', "Quando viene inviata una segnalazione su un'opera": 'When a report is submitted on a work',
    'Evento di test': 'Test event', 'Invia notifica di test': 'Send test notification',
    'Notifica di test inviata': 'Test notification sent', 'Attiva prima Notifiche Novae': 'Enable Novae notifications first',
    'Attiva il sotto-toggle per questo evento': 'Enable the sub-toggle for this event',
    'Notifica inviata (fallback: avvia il server con MIME text/javascript per il SW)': 'Notification sent (fallback: serve .js as text/javascript to test SW)',
    'Server locale serve sw.js come text/plain: usa text/javascript': 'Local server serves sw.js as text/plain: use text/javascript',
    'Service worker non ancora pronto: riprova': 'Service worker not ready yet: try again',
    'Nuovo messaggio': 'New message', 'Nuova recensione': 'New review', 'Nuovo commento': 'New comment',
    'Richiesta di collaborazione': 'Collaboration request', 'Nuovo follower': 'New follower', 'Invito accettato': 'Invite accepted',
    'Nuovo mi piace': 'New like', 'Opera ripubblicata': 'Work reposted', 'Inclusa in una costellazione': 'Added to a constellation', 'Nuova segnalazione': 'New report',
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
    'Seguito da': 'Followed by', 'e un altro': 'and one other', 'Sblocca': 'Unblock', 'Condividi profilo': 'Share profile', 'Segnala profilo': 'Report profile',
    'Aggiungi una bio per farti trovare': 'Add a bio so people can find you', 'Chi sei e cosa crei, in poche parole': 'Who you are and what you make, in a few words',
    'Il tuo sito o portfolio': 'Your website or portfolio', 'Il link non sembra un indirizzo web.': "That link doesn't look like a web address.",
    'Le sue opere tornano nel tuo feed': 'Their works come back to your feed', 'Le sue opere spariscono dal tuo feed, non lo saprà': "Their works leave your feed; they won't know",
    'Non vedi più le sue opere e non può scriverti': "You won't see their works and they can't message you",
    'Non vedi le sue opere e non può scriverti. Puoi sbloccarlo quando vuoi.': "You don't see their works and they can't message you. You can unblock them any time.",
    'Spam o account falso': 'Spam or fake account', 'Si spaccia per qualcun altro': 'Pretends to be someone else', 'Pubblica opere che non sono sue': "Posts works that aren't theirs",
    'Contenuti sessuali espliciti': 'Explicit sexual content', 'Non saprà che sei stato tu. Le': "They won't know it was you. The",
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
    [/^Artisti NOVAE in (.+)$/, (m, c) => `NOVAE artists in ${tr(c)}`],
    // profile: "•••" menu, block, mute, followers in common
    [/^e altri (\d+)$/, (m, n) => `and ${n} others`],
    [/^Silenzia (.+)$/, (m, n) => isName(n) ? `Mute ${n}` : m], [/^Riattiva (.+)$/, (m, n) => isName(n) ? `Unmute ${n}` : m],
    [/^Blocca anche (.+)$/, (m, n) => isName(n) ? `Also block ${n}` : m], [/^Blocca (.+)$/, (m, n) => isName(n) ? `Block ${n}` : m],
    [/^Sblocca (.+)$/, (m, n) => isName(n) ? `Unblock ${n}` : m], [/^Hai bloccato (.+)$/, (m, n) => isName(n) ? `You blocked ${n}` : m],
    [/^Segnala (.+)$/, (m, n) => isName(n) ? `Report ${n}` : m],
    // only for people's names, so a work titled "… bloccato" stays as it is (people's words are never translated)
    [/^(.+) silenziato$/, (m, n) => isName(n) ? `${n} muted` : m], [/^(.+) di nuovo nel tuo feed$/, (m, n) => isName(n) ? `${n} is back in your feed` : m],
    [/^(.+) sbloccato$/, (m, n) => isName(n) ? `${n} unblocked` : m], [/^(.+) bloccato$/, (m, n) => isName(n) ? `${n} blocked` : m],
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
    [/^Nuova recensione · (\d+)★$/, (m, n) => `New review · ${n}★`],
    [/^Commento su "(.+)"$/, (m, t) => `Comment on "${t}"`],
    [/^Segnalazione \((.+)\)$/, (m, r) => `Report (${r})`],
    // notification texts (js/push.js); names and titles stay as they are, the stand-ins ("Qualcuno", "la tua opera") are translated
    [/^(.+) ha recensito "(.+)"$/, (m, a, t) => `${tr(a)} reviewed "${tr(t)}"`],
    [/^(.+) ha indicato un punto: "(.*)"$/, (m, a, x) => `${tr(a)} pointed at a spot: "${x}"`],
    [/^(.+) ti ha aggiunto a "(.+)"$/, (m, a, t) => `${tr(a)} added you to "${tr(t)}"`],
    [/^(.+) ha iniziato a seguirti$/, (m, a) => `${tr(a)} started following you`],
    [/^(.+) è entrato su NOVAE col tuo codice(.*)$/, (m, a, c) => `${tr(a)} joined NOVAE with your code${c}`],
    [/^(.+) ha messo mi piace a "(.+)"$/, (m, a, t) => `${tr(a)} liked "${tr(t)}"`],
    [/^(.+) ha ripubblicato "(.+)"$/, (m, a, t) => `${tr(a)} reposted "${tr(t)}"`],
    [/^(.+) ha aggiunto "(.+)" a "(.+)"$/, (m, a, t, c) => `${tr(a)} added "${tr(t)}" to "${tr(c)}"`],
    [/^Opera "(.+)" inviata alla moderazione$/, (m, t) => `Work "${tr(t)}" sent to moderation`],
    [/^Qualcuno: "(.*)"$/, (m, x) => `Someone: "${x}"`],
    [/^(.+) \| NOVAE$/, (m, t) => `${tr(t)} | NOVAE`],
  ];
  const isName = n => typeof ARTISTS !== 'undefined' && Object.values(ARTISTS).some(x => x.name === n || x.name.split(' ')[0] === n);
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
