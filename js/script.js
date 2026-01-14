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
const descriptionElement = document.getElementById("describe");
const propalesTextElement = document.getElementById("propales-text");

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

function majStats() {
  document.getElementById("biff").textContent = game.biff.toFixed(0) + "$";
  document.getElementById("rendement").textContent = game.rendement.toFixed(2);
}

function afficherPropositions() {
  document.getElementById("propale1-name").textContent = propale1.name;
  document.getElementById("propale1-cost").textContent = propale1.cost + "$";

  document.getElementById("propale2-name").textContent = propale2.name;
  document.getElementById("propale2-cost").textContent = propale2.cost + "$";
}

function nouveauTour() {
  if (game.tour > 7) {
    endGame();
    return;
  }
  if (!game.enCours) return;

  descriptionElement.textContent = "";

  acceptPropaleButton.classList.add("disabled");

  eventElement.style.display = "none";
  descriptionElement.style.display = "initial";
  propalesTextElement.style.display = "initial";
  propalesElement.style.display = "flex";
  acceptPropaleButton.style.display = "flex";

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
    alert("Game over : plus assez de biff");
    window.location.reload();
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
  descriptionElement.style.display = "none";
  propalesTextElement.style.display = "none";
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
    game.biff = Math.floor(game.biff / parseInt(currentEvent.biff));
    game.rendement /= parseFloat(currentEvent.output);
  } else if (currentEvent.mode === "random") {
    const resultatCasino = Math.floor(
      Math.random() *
        (parseInt(currentEvent.max) - parseInt(currentEvent.min)) +
        parseInt(currentEvent.min)
    );
    game.biff += resultatCasino;
    if (resultatCasino >= 0) {
      alert(`Vous avez empoché ${resultatCasino}$ au casino !`);
    } else {
      alert(`Vous avez perdu ${Math.abs(resultatCasino)}$ au casino...`);
    }
  }
  nouveauTour();
}

function selectPropale1() {
  acceptPropaleButton.classList.remove("disabled");
  propale1Element.classList.add("selected");
  selectedPropale = propale1;
  propale2Element.classList.remove("selected");
  document.getElementById("describe").textContent = propale1.text;
}

function selectPropale2() {
  acceptPropaleButton.classList.remove("disabled");
  propale2Element.classList.add("selected");
  selectedPropale = propale2;
  propale1Element.classList.remove("selected");
  document.getElementById("describe").textContent = propale2.text;
}

function endGame() {
  alert(
    "Vous avez survécu 7 tours, vous lâchez tout partez du pays avec " +
      parseInt(game.biff) +
      " biff"
  );
  window.location.reload();
}

propale1Element.onclick = () => selectPropale1();
propale2Element.onclick = () => selectPropale2();
acceptPropaleButton.onclick = () => acheter();
eventButton.onclick = () => acceptEvent();

majStats();
nouveauTour();
