let pyramid = [];


// ======================
// ÉTAT DU JEU
// ======================
const game = {
  biff: 1000,
  rendement: 1.1,
  tour: 1,
  enCours: true
};

let propale1 = null;
let propale2 = null;

// ======================
// UTILITAIRES
// ======================
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ======================
// PROPOSITIONS
// ======================
function creerProposition() {
  return {
    cout: randomInt(200, 600),
    gainBiff: randomInt(100, 400),
    gainRendement: +(Math.random() * 0.2).toFixed(2),
    texte: "Un investisseur douteux veut entrer dans la pyramide"
  };
}

// ======================
// AFFICHAGE
// ======================
function majStats() {
  document.getElementById("biff").textContent = game.biff.toFixed(0);
  document.getElementById("rendement").textContent = game.rendement.toFixed(2);
}

function afficherPropositions() {
  document.getElementById("propale1").textContent =
    `Proposition A : ${propale1.cout}€ | +${propale1.gainBiff} biff | +${propale1.gainRendement} rendement`;

  document.getElementById("propale2").textContent =
    `Proposition B : ${propale2.cout}€ | +${propale2.gainBiff} biff | +${propale2.gainRendement} rendement`;
}

// ======================
// LOGIQUE DU JEU
// ======================
function nouveauTour() {
  if (!game.enCours) return;

  // application du rendement à chaque tour
  game.biff *= game.rendement;

  propale1 = creerProposition();
  propale2 = creerProposition();

  majStats();
  afficherPropositions();
}

function acheter(propale) {
  if (game.biff < propale.cout) {
    game.enCours = false;
    alert("💥 GAME OVER : plus assez de biff");
    return;
  }

  game.biff -= propale.cout;
  game.biff += propale.gainBiff;
  game.rendement += propale.gainRendement;
  game.tour++;

  nouveauTour();
}

// ======================
// BOUTONS
// ======================
document.getElementById("propale1").onclick = () => acheter(propale1);
document.getElementById("propale2").onclick = () => acheter(propale2);

// ======================
// LANCEMENT DU JEU
// ======================
majStats();
nouveauTour();