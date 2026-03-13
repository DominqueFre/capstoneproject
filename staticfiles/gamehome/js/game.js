const boardEl = document.getElementById("board");
const boardFrameEl = document.getElementById("boardFrame");
const statusEl = document.getElementById("status");
const playerStatusEl = document.getElementById("playerStatus");
const computerStatusEl = document.getElementById("computerStatus");
const startBtn = document.getElementById("startBtn");
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
const userMessageSets = window.GAME_USER_MESSAGES || {};
const userMessagesReady = Boolean(window.GAME_USER_MESSAGES_READY);
const profileDisplayName = (window.GAME_DISPLAY_NAME || "").trim();

const computerMessageSets = {
  win: [
    "Congratulations! You win!",
    "Well done! You are the champion!",
    "You did it! Victory is yours!",
    "Amazing! You are the winner!",
    "Great job! You have won the game!",
    "Fantastic! You are the master of this game!",
    "You are simply the best.",
    "I look forward to getting the chance to win...sometime!",
    "You're a winning machine.",
    "You're a superstar",
    "You make me dizzy.",
    "Even the best players lose sometimes."
  ],
  lose: [
    "Better luck next time! Try again.",
    "Don't give up! Play again to win.",
    "So close! Play again to claim victory.",
    "Keep trying! You'll get it next time.",
    "Don't worry, it's just a game! Play again to win.",
    "Almost had it! Play again to see if you can win this time.",
    "Another day, another flawless victory... for me.",
    "Keep your chin up.",
    "This is just a learning opportunity.",
    "You were a tough adversary.",
    "Losing is part of the game!",
    "You played with your heart."
  ],
  draw: [
    "It's a draw! Try again.",
    "No winner this time. Play again!",
    "It's a tie! Give it another shot.",
    "Stalemate! Play again to break the tie.",
    "It's a draw! Who will win next time?",
    "What a great game! It's a draw. Try again to see who will win next time.",
    "It's a draw.",
    "Stalemate.",
    "We're on a level pegging.",
    "I'll get you next time.",
    "Room for improvement on both sides.",
    "No losers here!",
    "What a closely fought battle.",
    "Another tie!",
    "A tie!",
    "I'm having such a good time.",
    "I don't want to stop at all."
  ],
  move: [
    "Your turn! Make your move.",
    "Off you go.",
    "Think carefully! Your move can change the game.",
    "The game is heating up! Make your move.",
    "It's getting intense! Choose your next move wisely.",
    "The board is filling up! Make your move before it's too late.",
    "The game is in full swing! Place your counter!",
    "Every move counts! Choose wisely and see if you can be the smart one.",
    "Time to play!",
    "If only we could both win!",
    "Let's see who comes out on top!",
    "Your move.",
    "I have lots of patience.",
    "This is a tough one to call.",
    "Your go.",
    "I've made my move.",
    "Waiting on you now.",
    "Just waiting...",
    "Done.",
    "Ready.",
    "OK, time to rock on.",
    "It's time to move it, move it.",
    "Push the button.",
    "Don't stop now.",
    "Keep it going.",
    "Be kind.",
    "Don't suppose you fancy letting me win one?",
    "All moves are good moves.",
    "Click away.",
    "The clock is ticking.",
    "The board calls.",
    "Where will you go next?",
    "Go for it.",
    "It's all you.",
    "The ball's in your court.",
    "It's your play now.",
    "Boss calls the shots, you choose your slot.",
    "Bop it.",
    "Es tu turno.",
    "C'est ton tour.",
    "Du bist dran.",
    "E il tuo turno.",
    "Eich tro chi yw hi.",
    "I think, therefore I have taken my turn.",
    "One small step for me, a giant step for mankind.",
    "This game is like a box of chocolates.",
    "Actions speak louder than words, take your turn!",
    "To choose or not to choose... please choose.",
    "Carpe diem.",
    "Y.O.L.O.",
    "Break a leg.",
    "Easy, peasy, lemon squeezy.",
    "Don't bite off more than you can chew.",
    "What's your move?",
    "If you win, pigs might fly.",
    "A stitch in time saves nine.",
    "Mind your p's and q's.",
    "Don't throw the baby out with the bath water."
  ]
};

const PROFILE_STORAGE_KEYS = {
  difficulty: "ttt.defaultDifficulty",
  theme: "ttt.defaultTheme"
};

const themeAssets = window.GAME_THEME_ASSETS || {};
const piecePreference = window.GAME_PIECE_PREFERENCE || null;

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

function getThemePieceEntries(theme) {
  const assets = themeAssets[theme] || {};
  return (Array.isArray(assets.pieces) ? assets.pieces : []).map(
    (url, index) => ({
      id: `${theme}_${index}`,
      url,
    })
  );
}

function getGlobalPieceEntries() {
  const themeOrder = ["traditional", "robot", "fantasy", "flowers"];
  const entries = themeOrder.flatMap((theme) => getThemePieceEntries(theme));

  if (piecePreference && piecePreference.avatarImage) {
    entries.push({
      id: "avatar",
      url: piecePreference.avatarImage,
    });
  }

  return entries;
}

function pickRandomEntry(pool) {
  if (!Array.isArray(pool) || pool.length === 0) {
    return null;
  }

  return pool[Math.floor(Math.random() * pool.length)] || null;
}

function getPlayerEntry(theme) {
  if (!piecePreference || piecePreference.choice === "Standard") {
    // Standard: random within theme
    return pickRandomEntry(getThemePieceEntries(theme));
  }

  if (piecePreference.choice === "Selection" && piecePreference.pieceIdentifier) {
    return getGlobalPieceEntries().find(
      (entry) => entry.id === piecePreference.pieceIdentifier
    ) || null;
  }

  if (piecePreference.choice === "Random") {
    // Global random
    return pickRandomEntry(getGlobalPieceEntries());
  }

  // Fallback to standard
  return pickRandomEntry(getThemePieceEntries(theme));
}

let board = Array(9).fill("");
let gameOver = false;
const PLAYER_MARK = "X";
const COMPUTER_MARK = "O";
let playerPieceAsset = "";
let computerPieceAsset = "";
let isHumanTurn = true;
let tossPicker = "player";
let hasGameStarted = false;
let activeStatusSide = "player";
let userMessageHintShown = false;

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

    const pieceAsset = value === PLAYER_MARK ? playerPieceAsset : computerPieceAsset;

    if (value === PLAYER_MARK && pieceAsset) {
      const piece = document.createElement("img");
      piece.className = "piece-img";
      piece.src = pieceAsset;
      piece.alt = "player piece";
      cell.appendChild(piece);
    } else if (value === COMPUTER_MARK && pieceAsset) {
      const piece = document.createElement("img");
      piece.className = "piece-img";
      piece.src = pieceAsset;
      piece.alt = "computer piece";
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

function pickRandomMessage(pool, fallback) {
  if (!Array.isArray(pool) || pool.length === 0) {
    return fallback;
  }
  return pool[Math.floor(Math.random() * pool.length)] || fallback;
}

function getComputerMessage(type, fallback) {
  const pool = computerMessageSets[type] || [];
  return pickRandomMessage(pool, fallback);
}

function getUserMessage(type) {
  const pool = userMessageSets[type];
  if (!Array.isArray(pool) || pool.length === 0) {
    return "";
  }
  return pickRandomMessage(pool, "");
}

function getPlayerTurnMessage() {
  return getComputerMessage("move", "Your turn (X).");
}

function getPlayerMoveReactionMessage() {
  const userMsg = getUserMessage("move");
  if (userMsg) return userMsg;
  return getComputerMessage("move", "Your turn (X).");
}

function getComputerTurnMessage() {
  return getComputerMessage("move", "Computer turn...");
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
    const target = resolvedSide === "computer" ? computerStatusEl : playerStatusEl;
    const item = document.createElement("div");
    item.className = "status-item";
    item.textContent = message;
    target.prepend(item);
  }
}

function clearStatusPanels() {
  if (playerStatusEl) {
    playerStatusEl.innerHTML = "";
  }
  if (computerStatusEl) {
    computerStatusEl.innerHTML = "";
  }
}

function showUserMessageHint() {
  const hasAnyUserMessages = ["win", "lose", "draw", "move"].some(
    type => Array.isArray(userMessageSets[type]) && userMessageSets[type].length > 0
  );
  if (userMessageHintShown || !canSaveScore || hasAnyUserMessages) {
    return;
  }
  userMessageHintShown = true;
  setStatus(
    "Tip: add your own messages on your Profile page and they'll appear here during the game.",
    "player"
  );
}

function assignPieceAssets(theme) {
  const playerEntry = getPlayerEntry(theme);
  const playerId = playerEntry ? playerEntry.id : null;

  let computerPool;
  if (piecePreference) {
    if (piecePreference.choice === "Random") {
      // If player is global random, computer is also global random (but not same piece)
      computerPool = getGlobalPieceEntries();
    } else {
      // For Standard or Selection, computer is theme-random (not same as player)
      computerPool = getThemePieceEntries(theme);
    }
  } else {
    // Default: Standard (theme-random)
    computerPool = getThemePieceEntries(theme);
  }

  const filteredComputerPool = computerPool.filter(
    (entry) => entry.id !== playerId
  );
  const computerEntry = pickRandomEntry(filteredComputerPool) || playerEntry;

  playerPieceAsset = playerEntry ? playerEntry.url : "";
  computerPieceAsset = computerEntry ? computerEntry.url : playerPieceAsset;
}

function setTossControlsMode(mode) {
  if (!tossControlsEl) {
    return;
  }

  const showStart = mode === "start";
  const showPick = mode === "pick";

  tossControlsEl.hidden = mode === "none";

  if (startBtn) {
    startBtn.hidden = !showStart;
  }
  if (pickHeadsBtn) {
    pickHeadsBtn.hidden = !showPick;
  }
  if (pickTailsBtn) {
    pickTailsBtn.hidden = !showPick;
  }

  const tossOrLabel = tossControlsEl.querySelector("span");
  if (tossOrLabel) {
    tossOrLabel.hidden = !showPick;
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
      setStatus(getComputerTurnMessage(), "computer");
      ensureComputerOpeningMove();
    }, 500);
    return;
  }

  setTimeout(() => {
    setStatus(getPlayerTurnMessage(), "player");
  }, 500);
}

async function resolveToss(picker, pickedSide) {
  const theme = themeEl ? themeEl.value : "traditional";
  const toss = runCoinToss(theme);
  const tossLower = toss.tossLabel.toLowerCase();
  const pickerWins = pickedSide === tossLower;
  const humanStarts = picker === "player" ? pickerWins : !pickerWins;
  const pickerLabel = picker === "player" ? "You" : "Computer";

  setTossControlsMode("none");
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
    setTossControlsMode("pick");
    setStatus("New round: pick Heads or Tails to start the toss.", "player");
    showUserMessageHint();
    return;
  }

  setTossControlsMode("none");
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
  if (startBtn) {
    startBtn.textContent = "Play Again";
  }
  setTossControlsMode("start");
  setThemeSelectable(true);

  if (outcome === "W") {
    setStatus(getComputerMessage("win", "You win!"), "computer");
  } else if (outcome === "L") {
    setStatus(getComputerMessage("lose", "Computer wins!"), "computer");
  } else {
    setStatus(getComputerMessage("draw", "Draw!"), "computer");
  }

  const userType = outcome === "W" ? "win" : outcome === "L" ? "lose" : "draw";
  const userMessage = getUserMessage(userType);
  if (userMessage) {
    setStatus(userMessage, "player");
  }

  setStatus(`${resultText} Press Start for the next game.`, inferStatusSide(resultText));
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
  setStatus(getComputerTurnMessage(), "computer");
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
  setStatus(getPlayerMoveReactionMessage(), "player");
}

async function postScore(outcome) {
  if (!canSaveScore) {
    setStatus("Why not register or sign in and make your way up the Leaderboard!", "player");
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
    setStatus(`Score not saved: ${data.error}`, activeStatusSide);
  }
}

function startGame() {
  board = Array(9).fill("");
  gameOver = false;
  hasGameStarted = false;
  clearStatusPanels();
  setTossControlsMode("none");
  setThemeSelectable(false);
  const theme = themeEl ? themeEl.value : "traditional";
  assignPieceAssets(theme);
  renderBoard();
  beginCoinTossFlow();
}

function initializeFirstVisitState() {
  board = Array(9).fill("");
  gameOver = true;
  isHumanTurn = false;
  hasGameStarted = false;
  clearStatusPanels();
  setTossControlsMode("start");
  setThemeSelectable(true);

  // Use saved default theme if available and allowed
  const savedTheme = window.localStorage.getItem(PROFILE_STORAGE_KEYS.theme);
  let theme = (themeEl && themeEl.value) || "traditional";
  if (
    savedTheme &&
    themeAssets[savedTheme] &&
    allowedThemes.includes(savedTheme)
  ) {
    theme = savedTheme;
    if (themeEl) themeEl.value = savedTheme;
  }

  const themeCoin = getThemeAssets(theme);
  setCoinIndicatorImage(themeCoin.coinHead, "coin");
  assignPieceAssets(theme);
  renderBoard();
  updateThemeButtons();
  if (startBtn) {
    startBtn.textContent = "Start";
  }

  setStatus("Choose a theme, then press Start to begin.", "player");
  showUserMessageHint();
}

if (startBtn) {
  startBtn.addEventListener("click", startGame);
}
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
      document.documentElement.dataset.theme = nextTheme;
      updateThemeButtons();
      // Always re-assign piece assets so global random is respected
      assignPieceAssets(nextTheme);
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
applySavedPreferences();
initializeFirstVisitState();