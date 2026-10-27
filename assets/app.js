/* Logique de la page. Les textes sont dans messages.js, les styles dans style.css. */
(function(){
  'use strict';

  var M = window.WINL_MESSAGES;
  var D = window.WINL_DOM, el = D.el, rejouer = D.rejouer;

  // --- Système -------------------------------------------------------------
  // Un seul endroit lit le système, pour le choix du raccourci comme pour le
  // champ « Poste » du rapport d'incident.
  var Systeme = (function(){
    var declare = (navigator.userAgentData && navigator.userAgentData.platform) || '';
    var plateforme = declare || navigator.platform || '';
    // Le choix du raccourci regarde aussi l'User-Agent : tout ce qui n'est pas
    // un Mac reçoit le raccourci Windows, y compris un système non reconnu.
    var large = plateforme || navigator.userAgent || '';
    return {
      cle: /mac/i.test(large) ? 'macos' : 'windows',
      // Le rapport affiche la plateforme telle qu'annoncée, juste rhabillée.
      nom: (plateforme || 'PC').replace(/win32|windows nt/i, 'Windows')
                               .replace(/macintel/i, 'macOS')
    };
  })();

  var raccourci = M.raccourcis[Systeme.cle] || M.raccourcis.windows;

  // --- Textes --------------------------------------------------------------
  var JETONS = {
    '{RACCOURCI}':  raccourci.nom,
    '{NB_TOUCHES}': raccourci.nbTouches,
    '{DEPUIS}':     raccourci.depuis,
    '{INDICE}':     raccourci.indice,
    '{ONGLET}':     raccourci.onglet
  };
  var MOTIF_JETONS = /\{[A-Z_]+\}/g;
  function perso(txt){
    return String(txt).replace(MOTIF_JETONS, function(j){
      return j in JETONS ? JETONS[j] : j;
    });
  }

  // --- Éléments, par rôle déclaré dans le markup (voir dom.js) --------------
  var scene = el.scene, contenu = el.contenu;
  var compteur = el.compteur, heure = el.heure, palier = el.palier;
  var postit = el.postit, piste = el.piste, retour = el.retour;
  var h1 = el.titre, favicon = el.favicon;

  var debut = Date.now();
  var d = new Date();
  function pad(n){ return String(n).padStart(2, '0'); }
  function hhmm(date){ return pad(date.getHours()) + ':' + pad(date.getMinutes()); }
  heure.textContent = hhmm(d);

  // --- Touches du raccourci -------------------------------------------------
  // Un rang par touche : .touche--N pilote la keyframe qui l'enfonce.
  var LOGOS = {
    win: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 4.5 11 3.4v8.1H3zM13 3.1 21 2v9.5h-8zM3 12.5h8v8.1L3 19.5zM13 12.5h8V22l-8-1.1z"/></svg>',
    command: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9h6v6H9z"/><path d="M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9z"/><path d="M15 9V6.5A2.5 2.5 0 1 1 17.5 9H15z"/><path d="M9 15v2.5A2.5 2.5 0 1 1 6.5 15H9z"/><path d="M15 15v2.5a2.5 2.5 0 1 0 2.5-2.5H15z"/></svg>',
    control: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15.5 12 8.5l7 7"/></svg>'
  };
  (function(){
    var boite = el.touches;
    boite.innerHTML = '';
    raccourci.touches.forEach(function(nom, rang){
      if (rang) {
        var plus = document.createElement('div');
        plus.className = 'plus';
        plus.textContent = '+';
        boite.append(plus);
      }
      var touche = document.createElement('div');
      touche.className = 'touche touche--' + (rang + 1);
      if (LOGOS[nom]) touche.innerHTML = LOGOS[nom];
      else touche.textContent = nom;
      boite.append(touche);
    });
  })();

  // --- Le contenu doit tenir dans l'écran -----------------------------------
  // Les tailles sont posées en CSS ; ici on ne touche qu'à --echelle, le facteur
  // commun au titre, aux touches et au chrono. Un message plus long qu'un autre
  // rétrécit au lieu de pousser le chronomètre sous le bandeau défilant.
  var ECHELLE_MIN = 0.38, PAS = 0.94, MARGE_SECOUSSE = 8;
  // Part de la hauteur disponible que le titre ne doit pas dépasser, pour que
  // le chronomètre et la ligne en dessous restent visibles et lisibles.
  var PART_TITRE = 0.55, TITRE_MIN = 0.35;
  // On mesure avec offsetHeight / clientHeight, jamais getBoundingClientRect :
  // .ecran joue l'animation d'allumage (scale(0, .002) au départ) et main la
  // secousse. getBoundingClientRect renvoie la taille APRÈS transformation, donc
  // au chargement elle vaut un ou deux pixels et l'ajustement ne corrige rien.
  // offsetHeight donne la hauteur de mise en page, insensible aux transforms.
  function hauteurDisponible(){
    var cs = getComputedStyle(scene);
    return scene.clientHeight
         - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
         - MARGE_SECOUSSE;
  }
  function ajusterEchelle(){
    var dispo = hauteurDisponible();
    contenu.style.setProperty('--echelle', 1);
    contenu.style.setProperty('--echelle-titre', 1);

    // 1. Le titre encaisse seul. Deux raisons de le réduire : le bloc entier
    //    dépasse, ou le titre à lui seul mange plus que sa part de la hauteur —
    //    sans ce second critère, un titre très long peut « tenir » tout en
    //    repoussant le chronomètre et sa ligne de message hors de vue.
    var t = 1;
    for (var i = 0; i < 30 && t > TITRE_MIN; i++) {
      var blocTropHaut  = contenu.offsetHeight > dispo;
      var titreTropHaut = h1.offsetHeight > dispo * PART_TITRE;
      if (!blocTropHaut && !titreTropHaut) break;
      t *= PAS;
      contenu.style.setProperty('--echelle-titre', t);
    }

    // 2. Si le titre seul n'y suffit pas, tout le bloc rétrécit.
    var e = 1;
    for (var j = 0; j < 24 && contenu.offsetHeight > dispo && e > ECHELLE_MIN; j++) {
      e *= PAS;
      contenu.style.setProperty('--echelle', e);
    }
  }

  // --- Titre aléatoire ------------------------------------------------------
  (function(){
    var choix = M.titresH1[Math.floor(Math.random() * M.titresH1.length)];
    h1.textContent = '';
    h1.append(perso(choix[0]));
    var flash = document.createElement('span');
    flash.className = 'flash';
    var surligne = perso(choix[1]), apres = perso(choix[2]);
    // Le surlignage occupe toute la largeur de la ligne, donc ce qui suit passe
    // toujours au-dessous. Une ponctuation seule s'y retrouverait isolée au
    // milieu d'une ligne vide : on la colle au surlignage.
    var seule = /^([.,;:!?\u2026]+)\s*$/.exec(apres);
    if (seule) { surligne += seule[1]; apres = ''; }
    flash.textContent = surligne;
    h1.append(flash, apres);
  })();

  // --- Bandeau défilant -----------------------------------------------------
  var ligne = M.piques.map(function(p){ return '<span>' + perso(p) + '</span>'; }).join('');
  piste.innerHTML = ligne + ligne;   // doublé pour un défilement sans coupure
  // Vitesse constante de 80 px/s quelle que soit la longueur du texte
  function reglerBandeau(){
    var largeur = piste.scrollWidth / 2;
    document.documentElement.style.setProperty('--duree-bandeau', Math.max(20, Math.round(largeur / 80)) + 's');
  }
  function replacer(){ reglerBandeau(); ajusterEchelle(); }
  // Premier calage une fois le bandeau rempli : avant, main est plus haut qu'il ne sera.
  replacer();
  window.addEventListener('resize', replacer);
  // Anton change les métriques en arrivant : on remesure une fois chargée.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(replacer);

  // --- Paliers et piques qui tournent ---------------------------------------
  var palierActuel = -1, timerPique = null;
  var indexPique = Math.floor(Math.random() * M.piques.length);
  function afficherLigne(txt){
    palier.textContent = perso(txt);
    ajusterEchelle();
    rejouer(palier, 'change');
  }
  function relancerPiques(){
    clearInterval(timerPique);
    timerPique = setInterval(function(){
      indexPique = (indexPique + 1) % M.piques.length;
      afficherLigne(M.piques[indexPique] + '.');
    }, 20000);
  }
  function majPalier(s){
    var idx = 0;
    for (var k = 0; k < M.paliers.length; k++) if (s >= M.paliers[k][0]) idx = k;
    if (idx !== palierActuel) {
      palierActuel = idx;
      afficherLigne(M.paliers[idx][1]);
      relancerPiques();
    }
  }

  // --- Fond qui vire au rouge sombre en 10 minutes --------------------------
  var fondActuel = '', bandeActuelle = '';
  function majFond(s){
    var t = Math.min(s / 600, 1);
    var fond = 'rgb(' + Math.round(11 + (92 - 11) * t) + ',' + Math.round(10 - 2 * t) + ',8)';
    var bande = s >= 600 ? '#e5261b' : s >= 300 ? '#ff8a1f' : '#ffd21f';
    var racine = document.documentElement.style;
    // Deux fois par seconde : on n'écrit que si la valeur a bougé.
    if (fond !== fondActuel) { racine.setProperty('--fond', fond); fondActuel = fond; }
    if (bande !== bandeActuelle) { racine.setProperty('--bande', bande); bandeActuelle = bande; }
  }

  // --- Chronomètre façon afficheur d'aéroport -------------------------------
  var affichage = '';
  function rendreChrono(txt){
    if (txt.length !== affichage.length) {
      compteur.textContent = '';
      for (var c = 0; c < txt.length; c++) {
        var el = document.createElement('span');
        el.className = txt[c] === ':' ? 'sep' : 'chiffre';
        el.textContent = txt[c];
        compteur.appendChild(el);
      }
    } else {
      for (var c2 = 0; c2 < txt.length; c2++) {
        if (txt[c2] !== affichage[c2]) {
          var cell = compteur.children[c2];
          cell.textContent = txt[c2];
          rejouer(cell, 'bascule');
        }
      }
    }
    affichage = txt;
  }
  var postitMontre = false;
  function tick(){
    var s = Math.floor((Date.now() - debut) / 1000);
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    rendreChrono((h ? pad(h) + ':' : '') + pad(m) + ':' + pad(sec));
    majPalier(s); majFond(s);
    if (!postitMontre && s >= 120) { postit.classList.add('visible'); postitMontre = true; }
  }
  tick();
  setInterval(tick, 500);

  // --- Rapport d'incident ---------------------------------------------------
  // Le numéro s'incrémente une fois par ouverture, au plus toutes les 10 minutes,
  // et repart à zéro chaque lundi.
  (function(){
    var n = 1;
    try {
      var lundi = new Date(); lundi.setHours(0, 0, 0, 0);
      lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7));
      var cle = 'winl-' + lundi.toISOString().slice(0, 10);
      var data = JSON.parse(localStorage.getItem(cle) || '{"n":0,"t":0}');
      if (Date.now() - data.t > 600000) {
        data.n += 1; data.t = Date.now();
        localStorage.setItem(cle, JSON.stringify(data));
      }
      n = data.n || 1;
    } catch (e) {}

    var valeurs = {
      '{N}':     d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '-' + pad(n),
      '{POSTE}': Systeme.nom + ' · ' + screen.width + '×' + screen.height,
      '{JOUR}':  M.rapport.jours[d.getDay()],
      '{HEURE}': hhmm(d)
    };
    el.rapport.innerHTML = M.rapport.lignes.map(function(l){
      return perso(l).replace(/\{[A-Z_]+\}/g, function(j){ return j in valeurs ? valeurs[j] : j; });
    }).join('<br>');

    el.postitDate.textContent = M.postitDate
      .replace('{DATE}', pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear())
      .replace('{HEURE}', hhmm(d));
  })();

  // --- Glitch sur le titre toutes les 10 secondes ---------------------------
  setInterval(function(){
    rejouer(h1, 'glitch');
  }, 10000);

  // --- Titre et favicon qui clignotent --------------------------------------
  (function(){
    var titres = M.titresOnglet.map(perso);
    var icones = [
      "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='#ffd21f'/><path d='M16 4 3 28h26z' fill='#0b0a08'/><rect x='14.5' y='12' width='3' height='8' fill='#ffd21f'/><circle cx='16' cy='23.5' r='1.8' fill='#ffd21f'/></svg>"),
      "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='#e5261b'/><rect x='7' y='15' width='18' height='13' rx='2' fill='#fbf6e6'/><path d='M19 15v-5a5 5 0 0 1 10 0v2' fill='none' stroke='#fbf6e6' stroke-width='3'/></svg>")
    ];
    var i = 0;
    favicon.href = icones[0];
    setInterval(function(){
      i++;
      document.title = titres[i % titres.length];
      favicon.href = icones[i % icones.length];
    }, 900);
  })();

  // --- Plein écran : au chargement, puis au premier geste -------------------
  function pleinEcran(){
    var el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(function(){});
  }
  pleinEcran();
  document.body.addEventListener('click', pleinEcran);
  document.addEventListener('pointerdown', pleinEcran, { once: true });

  // --- Curseur caché après 2,5 s sans bouger --------------------------------
  // Chrome renvoie des mousemove quand un élément animé passe sous le pointeur
  // immobile : on ignore si la position n'a pas changé.
  var timerCurseur = null, dernierX = null, dernierY = null;
  function cacherBientot(){
    document.documentElement.classList.remove('sans-curseur');
    clearTimeout(timerCurseur);
    timerCurseur = setTimeout(function(){
      document.documentElement.classList.add('sans-curseur');
    }, 2500);
  }

  // --- Retour de la victime -------------------------------------------------
  // Après 20 s d'immobilité, un vrai déplacement (40 px) ou une touche déclenche le flash.
  var SEUIL_PX = 40, SEUIL_MS = 20000;
  var reposX = null, reposY = null, dernierGeste = Date.now();
  function gesteReel(){
    var maintenant = Date.now();
    if (maintenant - dernierGeste >= SEUIL_MS) {
      rejouer(retour, 'actif');
    }
    dernierGeste = maintenant;
  }
  document.addEventListener('mousemove', function(e){
    if (e.clientX === dernierX && e.clientY === dernierY) return;
    dernierX = e.clientX; dernierY = e.clientY;
    cacherBientot();
    if (reposX === null) { reposX = e.clientX; reposY = e.clientY; dernierGeste = Date.now(); return; }
    if (Math.hypot(e.clientX - reposX, e.clientY - reposY) >= SEUIL_PX) {
      gesteReel(); reposX = e.clientX; reposY = e.clientY;
    }
  });
  cacherBientot();

  // --- Sirène deux tons -----------------------------------------------------
  var ctx = null, osc = null, gain = null, sirene = null;
  function demarrerSon(){
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    osc = ctx.createOscillator(); gain = ctx.createGain();
    osc.type = 'square'; gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.frequency.value = 660;
    osc.start();
    var haut = true;
    sirene = setInterval(function(){
      haut = !haut;
      osc.frequency.setValueAtTime(haut ? 660 : 440, ctx.currentTime);
    }, 400);
    document.body.classList.add('alarme');
  }
  function arreterSon(){
    if (sirene) clearInterval(sirene);
    if (osc) { try { osc.stop(); } catch (e) {} }
    osc = null; sirene = null;
    document.body.classList.remove('alarme');
  }
  function basculerSon(){ if (osc) arreterSon(); else demarrerSon(); }

  // --- Clavier : S = sirène, Échap la coupe, le reste tente le plein écran --
  document.addEventListener('keydown', function(e){
    // Bloque F12, Ctrl+Shift+I/J/C, Ctrl+U
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && /^[ijc]$/i.test(e.key)) || (e.ctrlKey && /^u$/i.test(e.key))) {
      e.preventDefault(); return;
    }
    gesteReel();
    if (e.key === 'Escape') { if (osc) arreterSon(); return; }
    if (/^s$/i.test(e.key)) { basculerSon(); return; }
    pleinEcran();
  });
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  document.addEventListener('pointerdown', gesteReel);

  // --- Confirmation avant de fermer l'onglet --------------------------------
  window.addEventListener('beforeunload', function(e){
    e.preventDefault();
    e.returnValue = M.confirmationFermeture;
    return e.returnValue;
  });
})();
