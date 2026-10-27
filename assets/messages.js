/* Tous les textes de la page. Modifie ce fichier sans toucher au HTML ni à la logique.
 *
 * Jetons disponibles dans n'importe quelle chaîne ci-dessous, remplacés au chargement
 * selon le système détecté :
 *   {RACCOURCI}   Win + L            / Command + Control + Q
 *   {NB_TOUCHES}  Deux touches       / Trois touches
 *   {DEPUIS}      2001               / Mac OS X
 *   {INDICE}      la phrase « indice » du raccourci courant
 */
window.WINL_MESSAGES = {

  /* Un raccourci par système. `touches` liste les touches dans l'ordre où elles
     s'enfoncent : soit un nom de logo connu d'app.js (win, command, control),
     soit le caractère à afficher tel quel. */
  raccourcis: {
    windows: {
      nom: 'Win + L',
      onglet: 'WIN + L !!!',
      nbTouches: 'Deux touches',
      depuis: '2001',
      indice: 'La touche Windows est en bas à gauche, le L à droite du K',
      touches: ['win', 'L']
    },
    macos: {
      nom: 'Command + Control + Q',
      onglet: 'COMMAND + CONTROL + Q !!!',
      nbTouches: 'Trois touches',
      depuis: 'Mac OS X',
      indice: 'Command borde la barre d\'espace, Control est à sa gauche, le Q en haut du clavier',
      touches: ['command', 'control', 'Q']
    }
  },

  /* Titre principal, tiré au sort à chaque ouverture. Chaque entrée est
     [avant, texte surligné, après]. */
  titresH1: [
    ["T'as oublié ", "{RACCOURCI}", ""],
    ["", "{RACCOURCI}", ", c'est pas optionnel"],
    ["Session ouverte. ", "{RACCOURCI}", " aussi ?"],
    ["Ton PC était à tout le monde. ", "{RACCOURCI}", ""],
    ["{NB_TOUCHES}. ", "{RACCOURCI}", ". C'était trop ?"],
    ["Ta session t'attendait. ", "{RACCOURCI}", " aussi."],
    ["Merci pour l'accès. ", "{RACCOURCI}", " la prochaine fois."],
    ["", "{RACCOURCI}", ". Répète après moi."],
    ["Le clavier avait la réponse : ", "{RACCOURCI}", ""],
    ["Pas verrouillé. Pas sérieux. ", "{RACCOURCI}", "."],
    ["", "{RACCOURCI}", " existe depuis {DEPUIS}. Toi, tu découvres."],
    ["Tout le monde a vu ton écran. ", "{RACCOURCI}", "."],
    ["", "{RACCOURCI}", ", ça se tape avec une seule main."],
    ["Ton PC dit merci de l'avoir laissé ouvert. ", "{RACCOURCI}", "."],
    ["Une session ouverte, c'est une invitation. ", "{RACCOURCI}", "."],
    ["", "{RACCOURCI}", ", même la DSI le fait."],
    ["Si t'avais fait ", "{RACCOURCI}", " tu verrais pas ça."],
    ["Le bureau te remercie. ", "{RACCOURCI}", " la prochaine fois."]
  ],

  /* Piques : elles tournent sous le chrono et défilent dans le bandeau du bas. */
  piques: [
    "Session ouverte, constatée par un collègue",
    "Un mail à tous le service était à deux clics",
    "Le fond d'écran a fait l'unanimité contre lui",
    "Ton mot de passe est très bien, dommage qu'il serve à rien",
    "Le PC est en libre-service jusqu'à ton retour",
    "{NB_TOUCHES}. Une seconde. Zéro croissants",
    "{RACCOURCI} ce n'est pas une option, c'est un réflexe",
    "Quelqu'un a peut-être changé ta langue de clavier",
    "Le poste appartient à celui qui passe dans le couloir",
    "Ta session, notre terrain de jeu",
    "Verrouiller, c'est gratuit et ça prend moins d'une seconde",
    "{INDICE}",
    "{RACCOURCI} : la seule combinaison qui protège ta boîte mail",
    "Un poste ouvert, c'est un dossier RH posé sur la table",
    "Ton navigateur connaît tes recherches, nous aussi maintenant",
    "Une session ouverte, c'est une invitation acceptée",
    "Tes onglets ont été passés en revue, deux fois",
    "Tu te lèves, tu verrouilles. Tu reviens, tu déverrouilles. C'est tout",
    "Même ta montre te dirait de verrouiller",
    "Verrouillé en 1 seconde ou ouvert pendant 20 minutes, tu choisis",
    "Le mot de passe, c'est bien. Le taper, c'est mieux",
    "Ce message a été écrit sur ton propre PC",
    "Quelqu'un a réglé ton volume à fond. Ou pas. Tu verras",
    "Ton poste n'a plus de secret pour l'équipe",
    "Poste ouvert : le bureau version buffet à volonté",
    "La DSI appelle ça un incident de sécurité, nous on appelle ça mardi",
    "Un message envoyé depuis ton compte, ça porte quand même ton nom",
    "Ton statut Teams disait absent, ta session disait bienvenue",
    "Cinq minutes à la machine à café, cinq minutes de session ouverte",
    "Tes fichiers partagés étaient accessibles sans mot de passe. Le tien",
    "Une réunion ne dure jamais aussi peu de temps que tu l'imagines"
  ],

  /* Message sous le chrono, qui s'aggrave avec le temps : [secondes, texte]. */
  paliers: [
    [0,     "Personne n'a encore rien vu. Enfin, presque."],
    [30,    "Trente secondes. Quelqu'un a déjà lu tes onglets."],
    [60,    "Une minute. Ça fait long, une minute."],
    [120,   "Deux minutes. Ton fond d'écran a été jugé."],
    [300,   "Cinq minutes. Tout ton bureau est passé devant."],
    [600,   "Dix minutes. On aurait pu envoyer un mail à ta place."],
    [900,   "Un quart d'heure. Ton mot de passe ne sert plus à rien."],
    [1800,  "Trente minutes. À ce stade c'est un poste en libre-service."],
    [3600,  "Une heure. Le poste appartient à l'équipe maintenant."],
    [5400,  "Une heure et demie. On a eu le temps de changer ton fond d'écran deux fois."],
    [7200,  "Deux heures. Tu es parti manger ou déménager ?"],
    [10800, "Trois heures. Le poste a vu plus de collègues que toi aujourd'hui."]
  ],

  /* Titre de l'onglet, qui clignote d'une entrée à l'autre. */
  titresOnglet: ['⚠ POSTE NON VERROUILLÉ', '{ONGLET}', '⚠ SESSION OUVERTE'],

  /* Rapport d'incident. {N}, {POSTE}, {JOUR}, {HEURE} sont remplis par app.js. */
  rapport: {
    jours: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    lignes: [
      'Incident <b>n° {N}</b>',
      'Poste <b>{POSTE}</b>',
      'Constaté <b>{JOUR} à {HEURE}</b>',
      'Par <b>un collègue</b> · Suite : <b>{RACCOURCI}</b>'
    ]
  },

  /* Date signée en bas du post-it. {DATE} et {HEURE} sont remplis par app.js. */
  postitDate: 'Signé le {DATE} à {HEURE}, sur ce poste.',

  /* Boîte de dialogue du navigateur quand on tente de fermer l'onglet. */
  confirmationFermeture: 'Tu pars sans verrouiller ?'
};
