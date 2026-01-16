export const API_URL = "https://ponzi-api.super-sympa.fr/";

const scoresDialog = document.getElementById("scores");
const refreshButton = document.getElementById("refresh-scores");
const closeScoresButton = document.getElementById("close-scores");

async function getScores() {
  const response = await fetch(API_URL + "scores");
  const data = await response.json();

  const scoreTableBody = scoresDialog.getElementsByTagName("tbody")[0];

  scoreTableBody.innerHTML = "";

  for (let i = 0; i < data.scores.length; i++) {
    const score = data.scores[i];

    const newLine = document.createElement("tr");
    const rank = document.createElement("td");
    const username = document.createElement("td");
    const biff = document.createElement("td");
    const turns = document.createElement("td");
    rank.textContent = i + 1;
    username.textContent = score.username;
    biff.textContent = score.biff;
    turns.textContent = score.turns;

    newLine.append(rank, username, biff, turns);

    scoreTableBody.appendChild(newLine);
  }
}

for (let button of document.getElementsByClassName("scores-button")) {
  button.onclick = () => scoresDialog.showModal();
}
refreshButton.onclick = () => getScores();
closeScoresButton.onclick = () => scoresDialog.close();

getScores();
