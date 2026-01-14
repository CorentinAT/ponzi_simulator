import investisseurs from "../json/investisseurs.json";
import evenements from "../json/events.json";
import { nextLevel } from "./three";

let selectedPropale = null;

let tour = 0;

const eventsPasses = [];

const propale1Element = document.getElementById("propale1");
const propale2Element = document.getElementById("propale2");
const acceptPropaleButton = document.getElementById("acceptpropale");
const eventElement = document.getElementById("event");
const eventButton = document.getElementById("skip-event");
const propalesElement = document.getElementById("propales");

// ======================
// ÉTAT DU JEU
// ======================
const game = {
  biff: 1000,
  rendement: 1.1,
  tour: 1,
  nbInvestisseurs: 0,
  enCours: true,
};

let propale1 = null;
let propale2 = null;

let currentEvent = null;

// ======================
// AFFICHAGE
// ======================
function majStats() {
  document.getElementById("biff").textContent = game.biff.toFixed(0);
  document.getElementById("rendement").textContent = game.rendement.toFixed(2);
}

function afficherPropositions() {
  document.getElementById("propale1").textContent = `Proposition A : ${
    propale1.name
  } | ${propale1.cost}€ | ${propale1.bag >= 0 ? "+" : ""}${
    propale1.bag
  } biff | ${propale1.output >= 0 ? "+" : ""}${propale1.output} rendement`;

  document.getElementById("propale2").textContent = `Proposition B : ${
    propale2.name
  } | ${propale2.cost}€ | ${propale2.bag >= 0 ? "+" : ""}${
    propale2.bag
  } biff | ${propale2.output >= 0 ? "+" : ""}${propale2.output} rendement`;
}

// ======================
// LOGIQUE DU JEU
// ======================
function nouveauTour() {
  if (game.tour > 8) {
    endGame();
  }
  if (!game.enCours) return;

  eventElement.style.display = "none";
  propalesElement.style.display = "flex";
  acceptPropaleButton.style.display = "flex";

  // application du rendement à chaque tour
  game.biff *= game.rendement;

  const idx1 = Math.floor(Math.random() * investisseurs.length);
  let idx2 = Math.floor(Math.random() * investisseurs.length);
  if (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * investisseurs.length);
  }

  propale1 = investisseurs[idx1];
  propale2 = investisseurs[idx2];

  nextLevel(tour);

  tour++;

  majStats();
  afficherPropositions();
}

function acheter() {
  if (game.biff < selectedPropale.cost) {
    game.enCours = false;
    alert("GAME OVER : plus assez de biff");
    return;
  }

  game.biff -= parseInt(selectedPropale.cost);
  game.biff += parseInt(selectedPropale.bag);
  game.rendement += parseFloat(selectedPropale.output);
  game.nbInvestisseurs++;
  document.getElementById("investisseurs").textContent = game.nbInvestisseurs;
  game.tour++;

  selectedPropale = null;
  propale1Element.classList.remove("selected");
  propale2Element.classList.remove("selected");

  evenement();
}

function evenement() {
  eventElement.style.display = "flex";
  propalesElement.style.display = "none";
  acceptPropaleButton.style.display = "none";

  let idx;
  do {
    idx = Math.floor(Math.random() * evenements.length);
  } while (eventsPasses.includes(idx));

  eventsPasses.push(idx);

  currentEvent = evenements[idx];

  eventElement.children[1].textContent = currentEvent.name;
}

function acceptEvent() {
  if (currentEvent.mode === "add") {
    game.biff += parseInt(currentEvent.biff);
    game.rendement += parseFloat(currentEvent.output);
  } else if (currentEvent.mode === "divide") {
    game.biff /= parseInt(currentEvent.biff);
    game.rendement /= parseFloat(currentEvent.output);
  } else if (currentEvent.mode === "random") {
    game.biff += Math.floor(
      Math.random() *
        (parseInt(currentEvent.max) - parseInt(currentEvent.min)) +
        parseInt(currentEvent.min)
    );
  }
  nouveauTour();
}

function selectPropale1() {
  propale1Element.classList.add("selected");
  selectedPropale = propale1;
  propale2Element.classList.remove("selected");
  document.getElementById("describe").textContent = propale1.text;
}

function selectPropale2() {
  propale2Element.classList.add("selected");
  selectedPropale = propale2;
  propale1Element.classList.remove("selected");
  document.getElementById("describe").textContent = propale2.text;
}

function endGame() {
  alert("Vous avez survécu 8 tours, et empoché ", game.biff, "biff");
 }
// ======================
// BOUTONS
// ======================
propale1Element.onclick = () => selectPropale1();
propale2Element.onclick = () => selectPropale2();
acceptPropaleButton.onclick = () => acheter();
eventButton.onclick = () => acceptEvent();

// ======================
// LANCEMENT DU JEU
// ======================
majStats();
nouveauTour();
