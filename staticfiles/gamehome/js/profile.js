const profileForm = document.getElementById("profileForm");
const displayNameEl = document.getElementById("displayName");
const defaultDifficultyEl = document.getElementById("defaultDifficulty");
const defaultThemeEl = document.getElementById("defaultTheme");
const resetPreferencesBtn = document.getElementById("resetPreferences");
const profileMessageEl = document.getElementById("profileMessage");
const commentFormEl = document.getElementById("commentForm");
const messageTypeEl = document.getElementById("id_message_type");
const commentTextEl = document.getElementById("id_comment_text");
const commentIdEl = document.getElementById("id_comment_id");
const commentEditorWrapEl = document.getElementById("commentEditorWrap");
const commentLimitMessageEl = document.getElementById("commentLimitMessage");
const saveCommentBtnEl = document.getElementById("saveCommentBtn");
const clearEditBtn = document.getElementById("clearEditBtn");
const quickEditButtons = document.querySelectorAll(".edit-comment-btn");

const PROFILE_STORAGE_KEYS = {
  displayName: "ttt.displayName",
  difficulty: "ttt.defaultDifficulty",
  theme: "ttt.defaultTheme"
};

const ALLOWED_DIFFICULTIES = new Set(["easy", "normal", "hard", "fiendish"]);
const ALLOWED_THEMES = new Set(["traditional", "robot", "flowers", "fantasy"]);

const commentCountsScript = document.getElementById("comment-counts-data");
const commentCounts = commentCountsScript ? JSON.parse(commentCountsScript.textContent) : {};

const MAX_COMMENTS_PER_TYPE = 10;

function getStoredValue(key) {
  return window.localStorage.getItem(key) || "";
}

function setMessage(message) {
  if (profileMessageEl) {
    profileMessageEl.textContent = message;
  }
}

function loadPreferences() {
  const storedName = getStoredValue(PROFILE_STORAGE_KEYS.displayName);
  const storedDifficulty = getStoredValue(PROFILE_STORAGE_KEYS.difficulty);
  const storedTheme = getStoredValue(PROFILE_STORAGE_KEYS.theme);

  displayNameEl.value = storedName;

  if (ALLOWED_DIFFICULTIES.has(storedDifficulty)) {
    defaultDifficultyEl.value = storedDifficulty;
  }

  if (ALLOWED_THEMES.has(storedTheme)) {
    defaultThemeEl.value = storedTheme;
  }
}

function savePreferences(event) {
  event.preventDefault();
  const cleanedName = displayNameEl.value.trim();
  const difficulty = defaultDifficultyEl.value;
  const theme = defaultThemeEl.value;

  window.localStorage.setItem(PROFILE_STORAGE_KEYS.displayName, cleanedName);
  if (ALLOWED_DIFFICULTIES.has(difficulty)) {
    window.localStorage.setItem(PROFILE_STORAGE_KEYS.difficulty, difficulty);
  }
  if (ALLOWED_THEMES.has(theme)) {
    window.localStorage.setItem(PROFILE_STORAGE_KEYS.theme, theme);
  }

  setMessage("Preferences saved.");
}

function resetPreferences() {
  window.localStorage.removeItem(PROFILE_STORAGE_KEYS.displayName);
  window.localStorage.removeItem(PROFILE_STORAGE_KEYS.difficulty);
  window.localStorage.removeItem(PROFILE_STORAGE_KEYS.theme);

  displayNameEl.value = "";
  defaultDifficultyEl.value = "easy";
  defaultThemeEl.value = "traditional";
  setMessage("Preferences reset.");
}

function updateCommentEditorVisibility() {
  if (!messageTypeEl || !commentEditorWrapEl || !commentLimitMessageEl) {
    return;
  }

  const selectedType = messageTypeEl.value;
  const countForType = Number(commentCounts[selectedType] || 0);
  const editingExisting = Boolean(commentIdEl && commentIdEl.value);
  const atLimit = countForType >= MAX_COMMENTS_PER_TYPE;

  if (atLimit && !editingExisting) {
    commentEditorWrapEl.hidden = true;
    commentLimitMessageEl.hidden = false;
  } else {
    commentEditorWrapEl.hidden = false;
    commentLimitMessageEl.hidden = true;
  }
}

function clearEditState() {
  if (!commentIdEl || !commentTextEl) {
    return;
  }

  commentIdEl.value = "";
  commentTextEl.value = "";
  if (saveCommentBtnEl) {
    saveCommentBtnEl.textContent = "Add comment";
  }
  updateCommentEditorVisibility();
}

function quickEditComment(event) {
  if (!messageTypeEl || !commentTextEl || !commentIdEl) {
    return;
  }

  const btn = event.currentTarget;
  const commentType = btn.getAttribute("data-message-type") || "win";
  const commentId = btn.getAttribute("data-comment-id") || "";
  const commentText = btn.getAttribute("data-comment-text") || "";

  messageTypeEl.value = commentType;
  commentIdEl.value = commentId;
  commentTextEl.value = commentText;

  if (saveCommentBtnEl) {
    saveCommentBtnEl.textContent = "Update comment";
  }
  if (commentEditorWrapEl) {
    commentEditorWrapEl.hidden = false;
  }
  if (commentLimitMessageEl) {
    commentLimitMessageEl.hidden = true;
  }
  commentTextEl.focus();
}

if (profileForm) {
  profileForm.addEventListener("submit", savePreferences);
}
if (resetPreferencesBtn) {
  resetPreferencesBtn.addEventListener("click", resetPreferences);
}

if (messageTypeEl) {
  messageTypeEl.addEventListener("change", () => {
    if (commentIdEl) {
      commentIdEl.value = "";
    }
    if (saveCommentBtnEl) {
      saveCommentBtnEl.textContent = "Add comment";
    }
    updateCommentEditorVisibility();
  });
}

if (clearEditBtn) {
  clearEditBtn.addEventListener("click", clearEditState);
}

if (quickEditButtons.length) {
  quickEditButtons.forEach((btn) => {
    btn.addEventListener("click", quickEditComment);
  });
}

if (commentFormEl) {
  updateCommentEditorVisibility();
}

loadPreferences();
