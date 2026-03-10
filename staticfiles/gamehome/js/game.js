const boardEl = document.getElementById("board");
const boardFrameEl = document.getElementById("boardFrame");
const statusEl = document.getElementById("status");
const playerStatusEl = document.getElementById("playerStatus");
const computerStatusEl = document.getElementById("computerStatus");
const resetBtn = document.getElementById("resetBtn");
const difficultyEl = document.getElementById("difficulty");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const themeEl = document.getElementById("theme");
const themeButtons = document.querySelectorAll(".theme-btn");
const tossControlsEl = document.getElementById("tossControls");
const pickHeadsBtn = document.getElementById("pickHeadsBtn");
const pickTailsBtn = document.getElementById("pickTailsBtn");
const coinIndicatorEl = document.getElementById("coinIndicator");
const coinIndicatorImgEl = document.getElementById("coinIndicatorImg");
const canSaveScore = Boolean(window.GAME_CAN_SAVE_SCORE);
const loginUrl = window.GAME_LOGIN_URL || "/accounts/login/";
const allowedThemes = Array.isArray(window.GAME_ALLOWED_THEMES)
  ? window.GAME_ALLOWED_THEMES
  : ["traditional"];
const allowedDifficulties = Array.isArray(window.GAME_ALLOWED_DIFFICULTIES)
  ? window.GAME_ALLOWED_DIFFICULTIES
  : ["easy"];

const PROFILE_STORAGE_KEYS = {
  difficulty: "ttt.defaultDifficulty",
  theme: "ttt.defaultTheme"
};

const themeAssets = window.GAME_THEME_ASSETS || {};

function getThemeAssets(theme) {
  const safeTheme = allowedThemes.includes(theme) ? theme : "traditional";
  const selected = themeAssets[safeTheme] || {};
  const fallback = themeAssets.traditional || {};

  const selectedPieces = Array.isArray(selected.pieces) ? selected.pieces : [];
  const fallbackPieces = Array.isArray(fallback.pieces) ? fallback.pieces : [];

  return {
    board: selected.board || fallback.board,
    coinHead: selected.coinHead || fallback.coinHead,
    coinTail: selected.coinTail || fallback.coinTail,
    pieces: selectedPieces.length ? selectedPieces : fallbackPieces,
  };
}

let board = Array(9).fill("");
let gameOver = false;
const PLAYER_MARK = "X";
const COMPUTER_MARK = "O";
let playerPieceIndex = 0;
let computerPieceIndex = 1;
let isHumanTurn = true;
let tossPicker = "player";
let hasGameStarted = false;
let activeStatusSide = "player";
let canResetFromCoin = false;
let canResetFromGlobalClick = false;

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function renderBoard() {
  const theme = themeEl ? themeEl.value : "traditional";
  const assets = getThemeAssets(theme);

  if (boardFrameEl) {
    boardFrameEl.style.backgroundImage = assets.board ? `url("${assets.board}")` : "none";
  }

  boardEl.innerHTML = "";
  board.forEach((value, idx) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.type = "button";

    const piecePool = assets.pieces;
    const pieceIndex = value === PLAYER_MARK ? playerPieceIndex : computerPieceIndex;
    const pieceAsset = piecePool[pieceIndex];

    if (value === PLAYER_MARK && pieceAsset) {
      const piece = document.createElement("img");
      piece.className = "piece-img";
      piece.src = pieceAsset;
      piece.alt = `${theme} player piece`;
      cell.appendChild(piece);
    } else if (value === COMPUTER_MARK && pieceAsset) {
      const piece = document.createElement("img");
      piece.className = "piece-img";
      piece.src = pieceAsset;
      piece.alt = `${theme} computer piece`;
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
  const profileDisplayName = (window.GAME_DISPLAY_NAME || "").trim();
  if (profileDisplayName) {
    return `${profileDisplayName}, your turn (X)`;
  }
  return "Your turn (X)";
}

function inferStatusSide(message) {
  if (/computer/i.test(message)) {
    return "computer";
  }
  return "player";
}

function setStatus(message, side) {
  const resolvedSide = side || inferStatusSide(message);
  activeStatusSide = resolvedSide;

  if (statusEl) {
    statusEl.textContent = message;
  }

  if (playerStatusEl && computerStatusEl) {
    if (resolvedSide === "computer") {
      computerStatusEl.textContent = message;
      playerStatusEl.textContent = "";
    } else {
      playerStatusEl.textContent = message;
      computerStatusEl.textContent = "";
    }
  }
}

function randomizePieceAssignment(theme) {
  const assets = getThemeAssets(theme);
  const piecePool = assets.pieces;

  if (piecePool.length === 0) {
    playerPieceIndex = 0;
    computerPieceIndex = 0;
    return;
  }

  playerPieceIndex = Math.floor(Math.random() * piecePool.length);

  if (piecePool.length === 1) {
    computerPieceIndex = playerPieceIndex;
    return;
  }

  do {
    computerPieceIndex = Math.floor(Math.random() * piecePool.length);
  } while (computerPieceIndex === playerPieceIndex);
}

function showTossControls(show) {
  if (tossControlsEl) {
    tossControlsEl.hidden = !show;
  }
}

function setThemeSelectable(canSelect) {
  if (themeEl) {
    themeEl.disabled = !canSelect;
  }
  updateThemeButtons();
}

function updateDifficultyButtons() {
  if (!difficultyButtons.length || !difficultyEl) {
    return;
  }

  difficultyButtons.forEach((btn) => {
    const btnDifficulty = btn.getAttribute("data-difficulty") || "easy";
    const isSelected = btnDifficulty === difficultyEl.value;
    btn.classList.toggle("is-selected", isSelected);
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

function updateThemeButtons() {
  if (!themeButtons.length || !themeEl) {
    return;
  }

  themeButtons.forEach((btn) => {
    const btnTheme = btn.getAttribute("data-theme") || "traditional";
    const isSelected = btnTheme === themeEl.value;
    const isDisabled = Boolean(themeEl.disabled);

    btn.classList.toggle("is-selected", isSelected);
    btn.classList.toggle("is-disabled", isDisabled && !isSelected);
    btn.disabled = isDisabled;
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

function runCoinToss(theme) {
  const tossIsHead = Math.random() < 0.5;

  return {
    tossLabel: tossIsHead ? "Heads" : "Tails",
  };
}

function setCoinIndicatorImage(src, altText) {
  if (!coinIndicatorEl || !coinIndicatorImgEl || !src) {
    return;
  }

  coinIndicatorImgEl.src = src;
  coinIndicatorImgEl.alt = altText;
  coinIndicatorEl.hidden = false;
}

function setCoinResetState(isReady) {
  canResetFromCoin = isReady;
  if (!coinIndicatorEl) {
    return;
  }

  coinIndicatorEl.classList.toggle("is-reset-ready", isReady);
  coinIndicatorEl.setAttribute(
    "title",
    isReady ? "Click coin to start next game" : "Coin toss"
  );
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function ensureComputerOpeningMove(remainingAttempts = 3) {
  if (gameOver || remainingAttempts <= 0) {
    return;
  }

  if (board.some((cell) => cell === COMPUTER_MARK)) {
    return;
  }

  aiMove();

  if (board.some((cell) => cell === COMPUTER_MARK) || gameOver) {
    return;
  }

  setTimeout(() => {
    ensureComputerOpeningMove(remainingAttempts - 1);
  }, 250);
}

async function animateCoinToss(theme, finalTossLabel) {
  const assets = getThemeAssets(theme);
  const head = assets.coinHead;
  const tail = assets.coinTail;

  if (!head || !tail || !coinIndicatorImgEl) {
    return;
  }

  coinIndicatorEl.hidden = false;
  coinIndicatorImgEl.classList.add("flipping");

  for (let i = 0; i < 8; i += 1) {
    const frame = i % 2 === 0 ? head : tail;
    setCoinIndicatorImage(frame, "coin toss in progress");
    await sleep(90);
  }

  const finalImage = finalTossLabel === "Heads" ? head : tail;
  setCoinIndicatorImage(finalImage, `${finalTossLabel} coin`);
  coinIndicatorImgEl.classList.remove("flipping");
}

function startTurnAfterToss(humanStarts) {
  isHumanTurn = humanStarts;
  hasGameStarted = true;
  setThemeSelectable(false);

  if (!isHumanTurn) {
    setTimeout(() => {
      if (gameOver) {
        return;
      }
      setStatus("Computer turn...", "computer");
      ensureComputerOpeningMove();
    }, 500);
    return;
  }

  setTimeout(() => {
    setStatus(getTurnMessage(), "player");
  }, 500);
}

async function resolveToss(picker, pickedSide) {
  const theme = themeEl ? themeEl.value : "traditional";
  const toss = runCoinToss(theme);
  const tossLower = toss.tossLabel.toLowerCase();
  const pickerWins = pickedSide === tossLower;
  const humanStarts = picker === "player" ? pickerWins : !pickerWins;
  const pickerLabel = picker === "player" ? "You" : "Computer";

  showTossControls(false);
  await animateCoinToss(theme, toss.tossLabel);
  setStatus(
    `${pickerLabel} picked ${pickedSide}. Toss: ${toss.tossLabel}. ${humanStarts ? "You start." : "Computer starts."}`,
    humanStarts ? "player" : "computer"
  );
  startTurnAfterToss(humanStarts);
}

function beginCoinTossFlow() {
  const theme = themeEl ? themeEl.value : "traditional";
  const themeCoin = getThemeAssets(theme);
  setCoinIndicatorImage(themeCoin.coinHead, "coin");

  tossPicker = Math.random() < 0.5 ? "player" : "computer";
  isHumanTurn = false;

  if (tossPicker === "player") {
    showTossControls(true);
    setStatus("New round: pick Heads or Tails to start the toss.", "player");
    return;
  }

  showTossControls(false);
  const computerPick = Math.random() < 0.5 ? "heads" : "tails";
  setStatus(`Computer picks ${computerPick}. Tossing...`, "computer");
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

  if (
    savedDifficulty
    && difficultyEl
    && allowedDifficulties.includes(savedDifficulty)
  ) {
    difficultyEl.value = savedDifficulty;
  }

  updateDifficultyButtons();

  if (
    savedTheme
    && themeEl
    && themeAssets[savedTheme]
    && allowedThemes.includes(savedTheme)
  ) {
    themeEl.value = savedTheme;
  }

  updateThemeButtons();
}

function endGame(resultText, outcome) {
  gameOver = true;
  hasGameStarted = false;
  setCoinResetState(true);
  canResetFromGlobalClick = false;
  setTimeout(() => {
    canResetFromGlobalClick = true;
  }, 0);
  setThemeSelectable(true);
  setStatus(`${resultText} Click anywhere to start the next game.`, inferStatusSide(resultText));
  postScore(outcome).catch(() => {});
}

function evaluateMoveOutcome(mark) {
  if (winner(mark)) {
    if (mark === PLAYER_MARK) {
      endGame("You win!", "W");
    } else {
      endGame("Computer wins!", "L");
    }
    return true;
  }

  if (full()) {
    endGame("Draw!", "D");
    return true;
  }

  return false;
}

function evaluateBoardState(state) {
  const computerWon = wins.some(
    ([a, b, c]) => state[a] === COMPUTER_MARK && state[b] === COMPUTER_MARK && state[c] === COMPUTER_MARK
  );
  if (computerWon) {
    return 10;
  }

  const playerWon = wins.some(
    ([a, b, c]) => state[a] === PLAYER_MARK && state[b] === PLAYER_MARK && state[c] === PLAYER_MARK
  );
  if (playerWon) {
    return -10;
  }

  return 0;
}

function minimax(state, isComputerTurn, depth) {
  const score = evaluateBoardState(state);
  if (score !== 0) {
    return score > 0 ? score - depth : score + depth;
  }

  const open = state.map((v, i) => (v === "" ? i : -1)).filter((i) => i >= 0);
  if (!open.length) {
    return 0;
  }

  if (isComputerTurn) {
    let bestScore = -Infinity;
    for (const idx of open) {
      state[idx] = COMPUTER_MARK;
      const nextScore = minimax(state, false, depth + 1);
      state[idx] = "";
      bestScore = Math.max(bestScore, nextScore);
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (const idx of open) {
    state[idx] = PLAYER_MARK;
    const nextScore = minimax(state, true, depth + 1);
    state[idx] = "";
    bestScore = Math.min(bestScore, nextScore);
  }
  return bestScore;
}

function pickFiendishMove(openCells) {
  let bestScore = -Infinity;
  let bestMove = openCells[0];

  for (const pick of openCells) {
    board[pick] = COMPUTER_MARK;
    const score = minimax(board, false, 0);
    board[pick] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMove = pick;
    }
  }

  return bestMove;
}

function pickComputerMove(openCells, difficulty) {
  // Step 1 (easy): computer play is random.
  if (difficulty === "easy") {
    return openCells[Math.floor(Math.random() * openCells.length)];
  }

  if (difficulty === "normal") {
    for (const pick of openCells) {
      board[pick] = COMPUTER_MARK;
      const winsNow = winner(COMPUTER_MARK);
      board[pick] = "";
      if (winsNow) {
        return pick;
      }
    }

    return openCells[Math.floor(Math.random() * openCells.length)];
  }

  if (difficulty === "hard") {
    for (const pick of openCells) {
      board[pick] = COMPUTER_MARK;
      const winsNow = winner(COMPUTER_MARK);
      board[pick] = "";
      if (winsNow) {
        return pick;
      }
    }

    for (const pick of openCells) {
      board[pick] = PLAYER_MARK;
      const playerWouldWin = winner(PLAYER_MARK);
      board[pick] = "";
      if (playerWouldWin) {
        return pick;
      }
    }

    return openCells[Math.floor(Math.random() * openCells.length)];
  }

  if (difficulty === "fiendish") {
    return pickFiendishMove(openCells);
  }

  // Placeholder until higher difficulties are implemented.
  return openCells[Math.floor(Math.random() * openCells.length)];
}

function humanMove(idx) {
  if (gameOver || !isHumanTurn || board[idx]) return;
  board[idx] = PLAYER_MARK;
  renderBoard();

  if (evaluateMoveOutcome(PLAYER_MARK)) {
    return;
  }

  isHumanTurn = false;
  setStatus("Computer turn...", "computer");
  setTimeout(aiMove, 300);
}

function aiMove() {
  if (gameOver) return;
  const difficulty = difficultyEl ? difficultyEl.value : "easy";
  const open = board.map((v, i) => v === "" ? i : -1).filter(i => i >= 0);
  if (!open.length) {
    return endGame("Draw!", "D");
  }

  const pick = pickComputerMove(open, difficulty);
  board[pick] = COMPUTER_MARK;
  renderBoard();

  if (evaluateMoveOutcome(COMPUTER_MARK)) {
    return;
  }

  isHumanTurn = true;
  setStatus(getTurnMessage(), "player");
}

async function postScore(outcome) {
  if (!canSaveScore) {
    setStatus(`${statusEl.textContent} Sign in to save score (${loginUrl}).`, activeStatusSide);
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
    setStatus(`${statusEl.textContent} Score not saved: ${data.error}`, activeStatusSide);
  }
}

function reset() {
  board = Array(9).fill("");
  gameOver = false;
  hasGameStarted = false;
  setCoinResetState(false);
  canResetFromGlobalClick = false;
  setThemeSelectable(false);
  const theme = themeEl ? themeEl.value : "traditional";
  randomizePieceAssignment(theme);
  renderBoard();
  beginCoinTossFlow();
}

function initializeFirstVisitState() {
  board = Array(9).fill("");
  gameOver = true;
  isHumanTurn = false;
  hasGameStarted = false;
  showTossControls(false);
  setCoinResetState(false);
  setThemeSelectable(true);

  const theme = themeEl ? themeEl.value : "traditional";
  const themeCoin = getThemeAssets(theme);
  setCoinIndicatorImage(themeCoin.coinHead, "coin");
  renderBoard();
  updateThemeButtons();
  setStatus("Choose a theme, then press Reset to start.", "player");
}

resetBtn.addEventListener("click", reset);
if (themeButtons.length && themeEl) {
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (hasGameStarted || themeEl.disabled) {
        return;
      }

      const nextTheme = btn.getAttribute("data-theme") || "traditional";
      if (!themeAssets[nextTheme] || !allowedThemes.includes(nextTheme)) {
        return;
      }

      themeEl.value = nextTheme;
      updateThemeButtons();
      renderBoard();
      const themeCoin = getThemeAssets(nextTheme);
      setCoinIndicatorImage(themeCoin.coinHead, "coin");
    });
  });
}

if (difficultyButtons.length && difficultyEl) {
  difficultyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextDifficulty = btn.getAttribute("data-difficulty") || "easy";
      if (!allowedDifficulties.includes(nextDifficulty)) {
        return;
      }
      difficultyEl.value = nextDifficulty;
      updateDifficultyButtons();
    });
  });
}
if (pickHeadsBtn) {
  pickHeadsBtn.addEventListener("click", () => onPlayerPick("heads"));
}
if (pickTailsBtn) {
  pickTailsBtn.addEventListener("click", () => onPlayerPick("tails"));
}
if (coinIndicatorEl) {
  coinIndicatorEl.addEventListener("click", () => {
    if (!canResetFromCoin) {
      return;
    }
    reset();
  });
}
document.addEventListener("click", () => {
  if (!canResetFromGlobalClick) {
    return;
  }
  reset();
});
applySavedPreferences();
initializeFirstVisitState();