import investisseurs from "../json/investisseurs.json";
import { nextLevel } from "./three";

let selectedPropale = null;

let tour = 1;

const propale1Element = document.getElementById("propale1");
const propale2Element = document.getElementById("propale2");
const acceptPropaleButton = document.getElementById("acceptpropale");

// ======================
// ÉTAT DU JEU
// ======================
const game = {
  biff: 1000,
  rendement: 1.1,
  tour: 1,
  enCours: true,
};

let propale1 = null;
let propale2 = null;

// ======================
// AFFICHAGE
// ======================
function majStats() {
  document.getElementById("biff").textContent = game.biff.toFixed(0);
  document.getElementById("rendement").textContent = game.rendement.toFixed(2);
}

function afficherPropositions() {
  document.getElementById(
    "propale1"
  ).textContent = `Proposition A : ${propale1.name} | ${propale1.cost}€ | +${propale1.bag} biff | +${propale1.output} rendement`;

  document.getElementById(
    "propale2"
  ).textContent = `Proposition B : ${propale2.name} | ${propale2.cost}€ | +${propale2.bag} biff | +${propale2.output} rendement`;
}

// ======================
// LOGIQUE DU JEU
// ======================
function nouveauTour() {
  if (!game.enCours) return;

  // application du rendement à chaque tour
  game.biff *= game.rendement;

  const idx1 = Math.floor(Math.random() * investisseurs.length);
  let idx2 = Math.floor(Math.random() * investisseurs.length);
  if (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * investisseurs.length);
  }

  propale1 = investisseurs[idx1];
  propale2 = investisseurs[idx2];

  tour++;

  nextLevel(tour);

  majStats();
  afficherPropositions();
}

function acheter() {
  if (game.biff < selectedPropale.cost) {
    game.enCours = false;
    alert("GAME OVER : plus assez de biff");
    return;
  }

  game.biff -= +selectedPropale.cost;
  game.biff += +selectedPropale.bag;
  game.rendement += +selectedPropale.output;
  game.tour++;

  selectedPropale = null;
  propale1Element.classList.remove("selected");
  propale2Element.classList.remove("selected");

  nouveauTour();
}

function selectPropale1() {
  propale1Element.classList.add("selected");
  selectedPropale = propale1;
  propale2Element.classList.remove("selected");
}

function selectPropale2() {
  propale2Element.classList.add("selected");
  selectedPropale = propale2;
  propale1Element.classList.remove("selected");
}

// ======================
// BOUTONS
// ======================
propale1Element.onclick = () => selectPropale1();
propale2Element.onclick = () => selectPropale2();
acceptPropaleButton.onclick = () => acheter();

// ======================
// LANCEMENT DU JEU
// ======================
majStats();
nouveauTour();
