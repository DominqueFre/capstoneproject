const boardEl = document.getElementById("board");
const boardFrameEl = document.getElementById("boardFrame");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const difficultyEl = document.getElementById("difficulty");
const themeEl = document.getElementById("theme");
const canSaveScore = Boolean(window.GAME_CAN_SAVE_SCORE);
const loginUrl = window.GAME_LOGIN_URL || "/accounts/login/";

const themeAssets = window.GAME_THEME_ASSETS || {};

let board = Array(9).fill("");
let gameOver = false;

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function renderBoard() {
  const theme = themeEl ? themeEl.value : "traditional";
  const assets = themeAssets[theme] || {};

  if (boardFrameEl) {
    boardFrameEl.style.backgroundImage = assets.board ? `url("${assets.board}")` : "none";
  }

  boardEl.innerHTML = "";
  board.forEach((value, idx) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.type = "button";

    if (value === "X" && assets.head) {
      const piece = document.createElement("img");
      piece.className = "piece-img";
      piece.src = assets.head;
      piece.alt = `${theme} heads`;
      cell.appendChild(piece);
    } else if (value === "O" && assets.tail) {
      const piece = document.createElement("img");
      piece.className = "piece-img";
      piece.src = assets.tail;
      piece.alt = `${theme} tails`;
      cell.appendChild(piece);
    } else {
      cell.textContent = value;
    }

    cell.addEventListener("click", () => humanMove(idx));
    boardEl.appendChild(cell);
  });
}

function winner(mark) {
  return wins.some(([a,b,c]) => board[a] === mark && board[b] === mark && board[c] === mark);
}

function full() {
  return board.every(c => c !== "");
}

function endGame(resultText, outcome) {
  gameOver = true;
  statusEl.textContent = resultText;
  postScore(outcome).catch(() => {});
}

function humanMove(idx) {
  if (gameOver || board[idx]) return;
  board[idx] = "X";
  renderBoard();

  if (winner("X")) return endGame("You win!", "W");
  if (full()) return endGame("Draw!", "D");

  statusEl.textContent = "Computer turn...";
  setTimeout(aiMove, 300);
}

function aiMove() {
  if (gameOver) return;
  const open = board.map((v, i) => v === "" ? i : -1).filter(i => i >= 0);
  const pick = open[Math.floor(Math.random() * open.length)];
  board[pick] = "O";
  renderBoard();

  if (winner("O")) return endGame("Computer wins!", "L");
  if (full()) return endGame("Draw!", "D");

  statusEl.textContent = "Your turn (X)";
}

async function postScore(outcome) {
  if (!canSaveScore) {
    statusEl.textContent += ` Sign in to save score (${loginUrl}).`;
    return;
  }

  const difficulty = difficultyEl.value;

  const res = await fetch("/api/score/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ difficulty, outcome })
  });

  const data = await res.json();
  if (!data.ok) {
    statusEl.textContent += ` Score not saved: ${data.error}`;
  }
}

function reset() {
  board = Array(9).fill("");
  gameOver = false;
  statusEl.textContent = "Your turn (X)";
  renderBoard();
}

resetBtn.addEventListener("click", reset);
if (themeEl) {
  themeEl.addEventListener("change", renderBoard);
}
reset();