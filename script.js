
const board = document.getElementById("gameBoard");
const difficulty = document.getElementById("difficulty");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const matchesDisplay = document.getElementById("matches");
const result = document.getElementById("result");
const resultText = document.getElementById("resultText");

const symbols = [
  "🏥", "💊", "🩺", "🚑", "❤️", "🩹",
  "👩‍⚕️", "🧑‍⚕️", "💉", "🩻", "🌡️", "🦷"
];

const levels = {
  easy: 6,
  medium: 8,
  hard: 12
};

let firstCard = null;
let secondCard = null;
let locked = false;
let moves = 0;
let matches = 0;
let seconds = 0;
let interval = null;
let started = false;
let roundId = 0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatTime(time) {
  const min = String(Math.floor(time / 60)).padStart(2, "0");
  const sec = String(time % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function startTimer() {
  if (started) return;
  started = true;

  interval = setInterval(() => {
    seconds++;
    timerDisplay.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
  interval = null;
}

function resetGame() {
  roundId++;
  stopTimer();

  firstCard = null;
  secondCard = null;
  locked = false;
  moves = 0;
  matches = 0;
  seconds = 0;
  started = false;

  movesDisplay.textContent = "0";
  timerDisplay.textContent = "00:00";

  const totalPairs = levels[difficulty.value];
  matchesDisplay.textContent = `0/${totalPairs}`;

  result.hidden = true;
  board.replaceChildren();

  const chosen = symbols.slice(0, totalPairs);
  const cards = shuffle([...chosen, ...chosen]);

  cards.forEach((symbol, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.dataset.symbol = symbol;
    card.dataset.index = index;
    card.setAttribute("aria-label", `Kartu ${index + 1}`);

    const face = document.createElement("span");
    face.className = "symbol";
    face.textContent = symbol;
    face.setAttribute("aria-hidden", "true");

    card.appendChild(face);
    card.addEventListener("click", () => flipCard(card));
    board.appendChild(card);
  });
}

function flipCard(card) {
  if (
    locked ||
    card === firstCard ||
    card.classList.contains("matched") ||
    card.classList.contains("flipped")
  ) return;

  startTimer();

  card.classList.add("flipped");
  card.setAttribute("aria-label", card.dataset.symbol);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  movesDisplay.textContent = moves;

  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    firstCard.disabled = true;
    secondCard.disabled = true;

    matches++;
    matchesDisplay.textContent =
      `${matches}/${levels[difficulty.value]}`;

    firstCard = null;
    secondCard = null;

    if (matches === levels[difficulty.value]) {
      finishGame();
    }
    return;
  }

  locked = true;
  const currentRound = roundId;

  setTimeout(() => {
    if (currentRound !== roundId) return;

    [firstCard, secondCard].forEach(card => {
      card.classList.remove("flipped");
      card.setAttribute(
        "aria-label",
        `Kartu ${Number(card.dataset.index) + 1}`
      );
    });

    firstCard = null;
    secondCard = null;
    locked = false;
  }, 850);
}

function finishGame() {
  stopTimer();

  resultText.textContent =
    `Semua ${matches} pasangan ditemukan dalam ${moves} langkah ` +
    `dan waktu ${formatTime(seconds)}.`;

  result.hidden = false;
}

document.getElementById("restart")
  .addEventListener("click", resetGame);

document.getElementById("playAgain")
  .addEventListener("click", resetGame);

difficulty.addEventListener("change", resetGame);

resetGame();
