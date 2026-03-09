const boardEl = document.getElementById("board");
const boardFrameEl = document.getElementById("boardFrame");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const difficultyEl = document.getElementById("difficulty");
const themeEl = document.getElementById("theme");
const tossControlsEl = document.getElementById("tossControls");
const pickHeadsBtn = document.getElementById("pickHeadsBtn");
const pickTailsBtn = document.getElementById("pickTailsBtn");
const canSaveScore = Boolean(window.GAME_CAN_SAVE_SCORE);
const loginUrl = window.GAME_LOGIN_URL || "/accounts/login/";

const PROFILE_STORAGE_KEYS = {
  displayName: "ttt.displayName",
  difficulty: "ttt.defaultDifficulty",
  theme: "ttt.defaultTheme"
};

const themeAssets = window.GAME_THEME_ASSETS || {};

let board = Array(9).fill("");
let gameOver = false;
const PLAYER_MARK = "X";
const COMPUTER_MARK = "O";
let playerPieceAssetKey = "pieceA";
let computerPieceAssetKey = "pieceB";
let isHumanTurn = true;
let tossPicker = "player";

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

    const pieceKey = value === PLAYER_MARK ? playerPieceAssetKey : computerPieceAssetKey;
    const pieceAsset = assets[pieceKey];

    if (value === PLAYER_MARK && pieceAsset) {
      const piece = document.createElement("img");
      piece.className = "piece-img";
      piece.src = pieceAsset;
      piece.alt = `${theme} ${pieceKey}`;
      cell.appendChild(piece);
    } else if (value === COMPUTER_MARK && pieceAsset) {
      const piece = document.createElement("img");
      piece.className = "piece-img";
      piece.src = pieceAsset;
      piece.alt = `${theme} ${pieceKey}`;
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

function getTurnMessage() {
  const savedDisplayName = window.localStorage.getItem(PROFILE_STORAGE_KEYS.displayName);
  if (savedDisplayName) {
    return `${savedDisplayName}, your turn (X)`;
  }
  return "Your turn (X)";
}

function randomizePieceAssignment() {
  const playerGetsPieceA = Math.random() < 0.5;
  playerPieceAssetKey = playerGetsPieceA ? "pieceA" : "pieceB";
  computerPieceAssetKey = playerGetsPieceA ? "pieceB" : "pieceA";
}

function showTossControls(show) {
  if (tossControlsEl) {
    tossControlsEl.hidden = !show;
  }
}

function runCoinToss(theme) {
  const assets = themeAssets[theme] || {};
  const tossIsHead = Math.random() < 0.5;
  const coinImage = tossIsHead ? assets.coinHead : assets.coinTail;

  return {
    tossLabel: tossIsHead ? "Heads" : "Tails",
    coinImage,
  };
}

function startTurnAfterToss(humanStarts) {
  isHumanTurn = humanStarts;
  if (!isHumanTurn) {
    setTimeout(() => {
      statusEl.textContent = "Computer turn...";
      aiMove();
    }, 500);
    return;
  }

  setTimeout(() => {
    statusEl.textContent = getTurnMessage();
  }, 500);
}

function resolveToss(picker, pickedSide) {
  const theme = themeEl ? themeEl.value : "traditional";
  const toss = runCoinToss(theme);
  const tossLower = toss.tossLabel.toLowerCase();
  const pickerWins = pickedSide === tossLower;
  const humanStarts = picker === "player" ? pickerWins : !pickerWins;
  const pickerLabel = picker === "player" ? "You" : "Computer";

  showTossControls(false);
  statusEl.textContent = `${pickerLabel} picked ${pickedSide}. Toss: ${toss.tossLabel}. ${humanStarts ? "You start." : "Computer starts."}`;
  startTurnAfterToss(humanStarts);
}

function beginCoinTossFlow() {
  tossPicker = Math.random() < 0.5 ? "player" : "computer";
  isHumanTurn = false;

  if (tossPicker === "player") {
    showTossControls(true);
    statusEl.textContent = "You get to pick. Choose Heads or Tails.";
    return;
  }

  showTossControls(false);
  const computerPick = Math.random() < 0.5 ? "heads" : "tails";
  statusEl.textContent = `Computer picks ${computerPick}. Tossing...`;
  setTimeout(() => {
    resolveToss("computer", computerPick);
  }, 400);
}

function onPlayerPick(side) {
  if (tossPicker !== "player") {
    return;
  }
  resolveToss("player", side);
}

function applySavedPreferences() {
  const savedDifficulty = window.localStorage.getItem(PROFILE_STORAGE_KEYS.difficulty);
  const savedTheme = window.localStorage.getItem(PROFILE_STORAGE_KEYS.theme);

  if (savedDifficulty && difficultyEl && [...difficultyEl.options].some(o => o.value === savedDifficulty)) {
    difficultyEl.value = savedDifficulty;
  }

  if (savedTheme && themeEl && [...themeEl.options].some(o => o.value === savedTheme)) {
    themeEl.value = savedTheme;
  }
}

function endGame(resultText, outcome) {
  gameOver = true;
  statusEl.textContent = resultText;
  postScore(outcome).catch(() => {});
}

function humanMove(idx) {
  if (gameOver || !isHumanTurn || board[idx]) return;
  board[idx] = PLAYER_MARK;
  renderBoard();

  if (winner(PLAYER_MARK)) return endGame("You win!", "W");
  if (full()) return endGame("Draw!", "D");

  isHumanTurn = false;
  statusEl.textContent = "Computer turn...";
  setTimeout(aiMove, 300);
}

function aiMove() {
  if (gameOver) return;
  const open = board.map((v, i) => v === "" ? i : -1).filter(i => i >= 0);
  const pick = open[Math.floor(Math.random() * open.length)];
  board[pick] = COMPUTER_MARK;
  renderBoard();

  if (winner(COMPUTER_MARK)) return endGame("Computer wins!", "L");
  if (full()) return endGame("Draw!", "D");

  isHumanTurn = true;
  statusEl.textContent = getTurnMessage();
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
  randomizePieceAssignment();
  renderBoard();
  beginCoinTossFlow();
}

resetBtn.addEventListener("click", reset);
if (themeEl) {
  themeEl.addEventListener("change", renderBoard);
}
if (pickHeadsBtn) {
  pickHeadsBtn.addEventListener("click", () => onPlayerPick("heads"));
}
if (pickTailsBtn) {
  pickTailsBtn.addEventListener("click", () => onPlayerPick("tails"));
}
applySavedPreferences();
reset();