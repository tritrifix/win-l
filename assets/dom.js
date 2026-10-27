/* Frontière entre le markup et la logique.
 *
 * app.js ne connaît aucun id ni aucun sélecteur : il demande un rôle. Le markup
 * déclare ses rôles avec data-role, et ce fichier est le seul endroit à relier
 * les deux. Renommer un élément dans index.html ne touche que la liste ci-dessous.
 */
window.WINL_DOM = (function(){
  'use strict';

  // Rôles attendus dans index.html. Un rôle absent est signalé au chargement
  // plutôt que de casser plus tard sur un null.
  var ROLES = [
    'ecran', 'scene', 'contenu', 'titre', 'touches', 'compteur', 'palier', 'heure',
    'rapport', 'postit', 'postitDate', 'piste', 'retour', 'favicon'
  ];

  var el = {}, manquants = [];
  ROLES.forEach(function(role){
    var noeud = document.querySelector('[data-role="' + role + '"]');
    if (noeud) el[role] = noeud;
    else manquants.push(role);
  });
  if (manquants.length) {
    console.error('[win-l] rôles absents du markup : ' + manquants.join(', ') +
                  ' — vérifie les attributs data-role dans index.html.');
  }

  // Rejoue une animation CSS : retirer la classe ne suffit pas, il faut forcer
  // un reflow entre le retrait et la repose. Quatre endroits en avaient besoin.
  function rejouer(noeud, classe){
    if (!noeud) return;
    noeud.classList.remove(classe);
    void noeud.offsetWidth;
    noeud.classList.add(classe);
  }

  return { el: el, roles: ROLES, manquants: manquants, rejouer: rejouer };
})();
