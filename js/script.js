import investisseurs from "../json/investisseurs.json";
import evenements from "../json/events.json";
import { nextLevel } from "./three";

const NB_TOURS = 14;

let tour = 0;

let propale1 = null;
let propale2 = null;

let selectedPropale = null;

let currentEvent = null;

const eventsPasses = []; // Servira à ne pas avoir le même évènement deux fois dans la partie
const investisseursAchetes = []; // Idem pour ne pas avoir un investisseur déjà acheté

const propale1Element = document.getElementById("propale1");
const propale2Element = document.getElementById("propale2");
const acceptPropaleButton = document.getElementById("acceptpropale");
const eventElement = document.getElementById("event");
const eventButton = document.getElementById("skip-event");
const startButton = document.getElementById("start");
const propalesElement = document.getElementById("propales");
const descriptionElement = document.getElementById("describe");
const propalesTextElement = document.getElementById("propales-text");

// Attributs au lancement de la partie
const game = {
  biff: 1000,
  rendement: 10,
  influence: 1,
  tour: 1,
  tier: 1,
  nbInvestisseurs: 0,
  enCours: true,
};

export function nextTier() {
  game.tier++;
}

// Mettre à jour les infos de la partie à l'écran
function majStats() {
  document.getElementById("biff").textContent = game.biff.toFixed(0) + "$";
  document.getElementById("rendement").textContent = game.rendement.toFixed(2);
}

function afficherPropositions() {
  document.getElementById("propale1-name").textContent = propale1.name;
  document.getElementById("propale1-cost").textContent =
    Math.floor(propale1.cost * 1.1 ** (tour - 1)) + "$";

  document.getElementById("propale2-name").textContent = propale2.name;
  document.getElementById("propale2-cost").textContent =
    Math.floor(propale2.cost * 1.1 ** (tour - 1)) + "$";
}

function nouveauTour() {
  if (!game.enCours) return;

  // On affiche seulement les éléments relatifs aux propositions
  descriptionElement.textContent = "";
  eventElement.style.display = "none";
  acceptPropaleButton.style.display = "none";
  descriptionElement.style.display = "initial";
  propalesTextElement.style.display = "initial";
  propalesElement.style.display = "flex";

  game.biff *= game.rendement; // Calcul des nouveaux fonds en fonction du rendement

  // Choix aléatoire des investisseurs proposés
  do {
    const idx = Math.floor(Math.random() * investisseurs.length);
    propale1 = investisseurs[idx];
  } while (investisseursAchetes.includes(propale1.id));
  do {
    const idx = Math.floor(Math.random() * investisseurs.length);
    propale2 = investisseurs[idx];
  } while (propale2.id === propale1.id);

  // Augmentation de la taille de la pyramide 3D
  nextLevel(tour);

  tour++;
  if (tour === 8) {
    tour++;
  }

  majStats();
  afficherPropositions();
}

// Achat d'un investisseur en acceptant une proposition
function acheter() {
  if (game.biff < selectedPropale.cost) {
    // Si on ne peut pas l'acheter, alors c'est perdu
    game.enCours = false;
    alert(
      "Game over : plus assez de biff, vous avez été trop gourmand et avez tout perdu"
    );
    window.location.reload();
    return;
  }

  // On met à jours nos attributs en fonction de l'investisseur choisi
  investisseursAchetes.push(selectedPropale.id);
  game.biff -= parseInt(selectedPropale.cost);
  game.biff += parseInt(selectedPropale.bag);
  game.rendement += parseFloat(selectedPropale.output);
  game.nbInvestisseurs++;
  document.getElementById("investisseurs").textContent = game.nbInvestisseurs;
  game.tour++;

  selectedPropale = null;
  propale1Element.classList.remove("selected");
  propale2Element.classList.remove("selected");

  if (game.tour > NB_TOURS - 1) {
    majStats();
    endGame();
    return;
  }
  evenement();
}

// Affichage d'un évènement
function evenement() {
  eventElement.style.display = "flex";
  descriptionElement.style.display = "none";
  propalesTextElement.style.display = "none";
  propalesElement.style.display = "none";
  acceptPropaleButton.style.display = "none";

  // Choix aléatoire d'un évènement parmis ceux pas encore passés
  let idx;
  do {
    idx = Math.floor(Math.random() * evenements.length);
  } while (eventsPasses.includes(idx));

  eventsPasses.push(idx);

  currentEvent = evenements[idx];

  eventElement.children[1].textContent = formatTextEvent(currentEvent);
}

// Clic sur le bouton "compris" de l'évènement, calcule nos attributs en fonction du type d'effet de l'évènement
function acceptEvent() {
  if (currentEvent.mode === "add") {
    game.biff += parseInt(currentEvent.biff * 1.1 ** (tour - 1));
    game.rendement += parseFloat(currentEvent.output);
  } else if (currentEvent.mode === "divide") {
    game.biff = Math.floor(game.biff / parseFloat(currentEvent.biff));
    game.rendement /= parseFloat(currentEvent.output);
  } else if (currentEvent.mode === "random") {
    const resultatCasino = Math.floor(
      Math.random() *
        (parseInt(currentEvent.max) - parseInt(currentEvent.min)) +
        parseInt(currentEvent.min)
    );
    game.biff += resultatCasino;
    // On informe le joueur du résultat du casino
    if (resultatCasino >= 0) {
      alert(`Vous avez empoché ${resultatCasino} biff au casino !`);
    } else {
      alert(`Vous avez perdu ${Math.abs(resultatCasino)} biff au casino...`);
    }
  }
  nouveauTour();
}

function formatTextPropale(propale) {
  return propale.text
    .replaceAll("{cost}", Math.floor(propale.cost * 1.1 ** (tour - 1)))
    .replaceAll("{bag}", Math.floor(propale.bag * 1.1 ** (tour - 1)))
    .replaceAll("{output}", Math.floor(Math.abs(propale.output * 100)));
}

function formatTextEvent(event) {
  const text = event.name.replaceAll(
    "{output}",
    Math.floor(Math.abs(event.output * 100))
  );
  if (event.mode === "add") {
    return text.replaceAll(
      "{biff}",
      Math.floor(event.biff * 1.1 ** (tour - 1))
    );
  }
  return text.replaceAll("{biff}", Math.floor(event.biff));
}

// Clic sur une proposition (avant validation)
function selectPropale1() {
  acceptPropaleButton.style.display = "initial";
  propale1Element.classList.add("selected");
  selectedPropale = propale1;
  propale2Element.classList.remove("selected");
  document.getElementById("describe").textContent = formatTextPropale(propale1);
}

function selectPropale2() {
  acceptPropaleButton.style.display = "initial";
  propale2Element.classList.add("selected");
  selectedPropale = propale2;
  propale1Element.classList.remove("selected");
  document.getElementById("describe").textContent = formatTextPropale(propale2);
}

// Victoire d'une partie, on affiche le résultat
function endGame() {
  alert(
    "Bien joué ! Vous avez survécu " +
      (NB_TOURS - 1) +
      " tours, vous lâchez tout et partez du pays avec " +
      parseInt(game.biff) +
      " biff"
  );
  window.location.reload();
}

// Lancer la partie après les explications
function startGame() {
  document.getElementById("rules").style.display = "none";
  document.getElementById("game").style.display = "flex";
  majStats();
  nouveauTour();
}

propale1Element.onclick = () => selectPropale1();
propale2Element.onclick = () => selectPropale2();
acceptPropaleButton.onclick = () => acheter();
eventButton.onclick = () => acceptEvent();
startButton.onclick = () => startGame();
