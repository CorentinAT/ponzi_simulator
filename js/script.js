import investisseurs from "../json/investisseurs.json";
import evenements from "../json/evenements.json";
import { nextLevel } from "./three";
import { API_URL } from "./scores";

const NB_TOURS = 21;
const MULTIPLICATEUR_BIFF = 1.1;

let propales = [null, null];
let propaleSelectionnee = null;
let evenementCourant = null;

const evenementsPasses = []; // Servira à ne pas avoir le même évènement deux fois dans la partie
const investisseursAchetes = []; // Idem pour ne pas avoir un investisseur déjà acheté

// Attributs au lancement de la partie
const partie = {
  biff: 1000,
  rendement: 1.1,
  influence: 1,
  tour: 0,
  tier: 1,
  nbInvestisseurs: 0,
};

// récupération élément de la page qu'on utilise plusieurs fois dans le script
const acceptPropaleButton = document.getElementById("acceptpropale");
const evenementElement = document.getElementById("event");
const evenementButton = document.getElementById("skip-event");
const startButton = document.getElementById("start");
const propalesElement = document.getElementById("propales");
const descriptionElement = document.getElementById("describe");
const propalesTextElement = document.getElementById("propales-text");
const closeEndButton = document.getElementById("close-end");
const publishScoreForm = document.getElementById("score-form");
const statsElement = document.getElementById("stats");

// Lancer la partie après les explications
function startGame() {
  document.getElementById("rules").style.display = "none";
  document.getElementById("game").style.display = "flex";
  majStats();
  nouveauTour();
}

function nouveauTour() {
  // On affiche seulement les éléments relatifs aux propositions
  descriptionElement.textContent = "";
  evenementElement.style.display = "none";
  acceptPropaleButton.style.display = "none";
  descriptionElement.style.display = "initial";
  propalesTextElement.style.display = "initial";
  propalesElement.style.display = "flex";

  partie.biff *= partie.rendement; // Calcul des nouveaux fonds en fonction du rendement

  // Choix aléatoire des investisseurs proposés
  do {
    const idx = Math.floor(Math.random() * investisseurs.length);
    propales[0] = investisseurs[idx];
  } while (investisseursAchetes.includes(propales[0].id));
  do {
    const idx = Math.floor(Math.random() * investisseurs.length);
    propales[1] = investisseurs[idx];
  } while (
    propales[1].id === propales[0].id ||
    investisseursAchetes.includes(propales[1].id)
  );

  // Augmentation de la taille de la pyramide 3D
  nextLevel(partie.tour);

  partie.tour++;
  if (partie.tour === 8) {
    partie.tour++;
  }

  majStats();
  afficherPropositions();
}

function afficherPropositions() {
  propalesElement.innerHTML = "";

  for (let i = 0; i < propales.length; i++) {
    const propaleElement = document.createElement("div");
    const nameElement = document.createElement("p");
    const coutElement = document.createElement("p");

    propaleElement.append(nameElement, coutElement);

    propalesElement.appendChild(propaleElement);

    propaleElement.onclick = () => selectPropale(i);

    nameElement.textContent = propales[i].nom;
    coutElement.textContent =
      Math.floor(propales[i].cout * valeurMultiplicateurTour()) + "$";
  }
}

// Clic sur une proposition (avant validation)
function selectPropale(propaleIdx) {
  const propaleElements = propalesElement.children;

  acceptPropaleButton.style.display = "initial";
  propaleElements[propaleIdx].classList.add("selected");
  propaleElements[(propaleIdx + 1) % propaleElements.length].classList.remove(
    "selected",
  );
  propaleSelectionnee = propales[propaleIdx];
  statsElement.style.display = "flex";

  document.getElementById("describe").textContent = formatTextePropale(
    propales[propaleIdx],
  );

  const gainElement = document.getElementById("addgain");
  const rendementElement = document.getElementById("addrendement");
  const influenceElement = document.getElementById("addinfluence");

  // Calcul et affichage du gain si achat
  const gain = Math.floor(
    propales[propaleIdx].bag * partie.influence - propales[propaleIdx].cout,
  );
  gainElement.textContent =
    Math.floor(gain * valeurMultiplicateurTour()) + " $";
  gainElement.style.color =
    gain > 0 ? "#00ff00" : gain < 0 ? "#ff0000" : "#ffffff"; // Rouge si négatif, vert si positif, blanc si nul

  // idem pour le rendement
  const rendement = propales[propaleIdx].rendement;
  rendementElement.textContent = rendement + " de rendement";
  rendementElement.style.color =
    rendement > 0 ? "#00ff00" : rendement < 0 ? "#ff0000" : "#ffffff";

  // idem pour l'influence
  const influence = propales[propaleIdx].influence;
  influenceElement.textContent = influence + " d'influence";
  influenceElement.style.color =
    influence > 0 ? "#00ff00" : influence < 0 ? "#ff0000" : "#ffffff";

  // Si on ne peut pas acheter cet investisseur mais l'autre, on ne peut pas cliquer pour acheter, si on ne peut acheter aucun des deux on peut cliquer, ce qui déclenchera la fin de partie
  if (
    propales[(propaleIdx + 1) % propales.length].cout *
      MULTIPLICATEUR_BIFF ** (partie.tour - 1) <=
      partie.biff &&
    propales[propaleIdx].cout * valeurMultiplicateurTour() > partie.biff
  ) {
    acceptPropaleButton.classList.add("disabled");
    acceptPropaleButton.disabled = true;
  } else {
    acceptPropaleButton.classList.remove("disabled");
    acceptPropaleButton.disabled = false;
  }
}

// Achat d'un investisseur en acceptant une proposition
function acheter() {
  if (partie.biff < propaleSelectionnee.cout * valeurMultiplicateurTour()) {
    // Si on ne peut pas l'acheter, alors c'est perdu
    endGame(false);
    return;
  }

  // On met à jours nos attributs en fonction de l'investisseur choisi
  investisseursAchetes.push(propaleSelectionnee.id);
  partie.biff -= parseInt(
    propaleSelectionnee.cout * valeurMultiplicateurTour(),
  );
  partie.biff += parseInt(
    propaleSelectionnee.bag *
      MULTIPLICATEUR_BIFF ** (partie.tour - 1) *
      partie.influence,
  );
  partie.rendement += parseFloat(propaleSelectionnee.rendement);
  partie.influence += parseFloat(propaleSelectionnee.influence);

  propaleSelectionnee = null;

  for (let propaleElement of propalesElement.childNodes) {
    propaleElement.classList.remove("selected");
  }

  majStats();

  if (partie.tour > NB_TOURS - 1) {
    endGame(true);
    return;
  }
  evenement();
}

// Affichage d'un évènement
function evenement() {
  evenementElement.style.display = "flex";
  descriptionElement.style.display = "none";
  propalesTextElement.style.display = "none";
  propalesElement.style.display = "none";
  acceptPropaleButton.style.display = "none";
  statsElement.style.display = "none";
  // Choix aléatoire d'un évènement parmis ceux pas encore passés
  let idx;
  do {
    idx = Math.floor(Math.random() * evenements.length);
  } while (
    evenementsPasses.includes(idx) ||
    evenements[idx].tier > partie.tier
  );

  evenementsPasses.push(idx);

  evenementCourant = evenements[idx];

  evenementElement.children[1].textContent =
    formatTexteEvenement(evenementCourant);
}

// Clic sur le bouton "compris" de l'évènement, calcule nos attributs en fonction du type d'effet de l'évènement
function acceptEvenement() {
  if (evenementCourant.mode === "add") {
    partie.biff += parseInt(evenementCourant.biff * valeurMultiplicateurTour());
    partie.rendement += parseFloat(evenementCourant.rendement);
  } else if (evenementCourant.mode === "divide") {
    partie.biff = Math.floor(partie.biff / parseFloat(evenementCourant.biff));
    partie.rendement /= parseFloat(evenementCourant.rendement);
  } else if (evenementCourant.mode === "random") {
    const resultatCasino = Math.floor(
      (Math.random() *
        (parseInt(evenementCourant.max) - parseInt(evenementCourant.min)) +
        parseInt(evenementCourant.min)) *
        valeurMultiplicateurTour(),
    );
    partie.biff += resultatCasino;
    // On informe le joueur du résultat du casino
    if (resultatCasino >= 0) {
      alert(`Vous avez empoché ${resultatCasino} biff au casino !`);
    } else {
      alert(`Vous avez perdu ${Math.abs(resultatCasino)} biff au casino...`);
    }
  }
  nouveauTour();
}

// Fin de partie, on affiche le résultat
function endGame(win) {
  const endTextElement = document.getElementById("end-text");
  const endTitleElement = document.getElementById("end-title");

  if (win) {
    endTitleElement.textContent = "Victoire";
    endTextElement.textContent =
      "Vous avez survécu " +
      (NB_TOURS - 1) +
      " tours, vous lâchez tout et partez du pays avec " +
      parseInt(partie.biff) +
      " biff";
  } else {
    endTitleElement.textContent = "Game over";
    endTextElement.textContent = `Plus assez de biff, vous avez été trop gourmand et avez tout perdu (survécu ${
      partie.tour - 1
    } tour(s)).`;
  }

  document.getElementById("end").showModal();
}

// On met en ligne le score pour qu'il apparaîsse dans le tableau
async function publishScore(e) {
  e.preventDefault();
  await fetch(API_URL + "score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: document.getElementById("username").value,
      biff: partie.biff,
      turns: partie.tour - 1,
    }),
  });
  window.location.reload();
}

// Mettre à jour les infos de la partie à l'écran
function majStats() {
  document.getElementById("biff").textContent = partie.biff.toFixed(0) + "$";
  document.getElementById("rendement").textContent =
    partie.rendement.toFixed(2);
  document.getElementById("influence").textContent =
    partie.influence.toFixed(2);
  document.getElementById("investisseurs").textContent =
    investisseursAchetes.length;
}

function formatTextePropale(propale) {
  return propale.text
    .replaceAll("{cout}", Math.floor(propale.cout * valeurMultiplicateurTour()))
    .replaceAll(
      "{bag}",
      Math.floor(propale.bag * valeurMultiplicateurTour() * partie.influence),
    )
    .replaceAll("{rendement}", Math.floor(Math.abs(propale.rendement * 100)));
}

function formatTexteEvenement(evenement) {
  if (evenement.mode === "add") {
    return evenement.nom
      .replaceAll(
        "{rendement}",
        Math.floor(Math.abs(evenement.rendement * 100)),
      )
      .replaceAll(
        "{biff}",
        Math.floor(evenement.biff * valeurMultiplicateurTour()),
      );
  }
  return evenement.nom
    .replaceAll("{rendement}", Math.floor(evenement.rendement))
    .replaceAll("{biff}", Math.floor(evenement.biff));
}

function valeurMultiplicateurTour() {
  return MULTIPLICATEUR_BIFF ** (partie.tour - 1);
}

// Pour être appelé depuis three.js, où la pyramide change de couleur
function nextTier() {
  partie.tier++;
}

acceptPropaleButton.onclick = () => acheter();
evenementButton.onclick = () => acceptEvenement();
startButton.onclick = () => startGame();
publishScoreForm.onsubmit = (e) => publishScore(e);
closeEndButton.onclick = () => window.location.reload();

export { nextTier };
