const profileForm = document.getElementById("profileForm");
const displayNameEl = document.getElementById("displayName");
const defaultDifficultyEl = document.getElementById("defaultDifficulty");
const defaultThemeEl = document.getElementById("defaultTheme");
const profileDifficultyButtons = document.querySelectorAll(".profile-difficulty-btn");
const profileThemeButtons = document.querySelectorAll(".profile-theme-btn");
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
const commentTypeButtons = document.querySelectorAll(".comment-type-btn");
const commentTypePanels = document.querySelectorAll("[data-message-list]");
const commentFeedbackMessageEl = document.getElementById("commentFeedbackMessage");

const PROFILE_STORAGE_KEYS = {
  difficulty: "ttt.defaultDifficulty",
  theme: "ttt.defaultTheme"
};

const allowedDifficulties = Array.isArray(window.PROFILE_ALLOWED_DIFFICULTIES)
  ? window.PROFILE_ALLOWED_DIFFICULTIES
  : ["easy"];
const allowedThemes = Array.isArray(window.PROFILE_ALLOWED_THEMES)
  ? window.PROFILE_ALLOWED_THEMES
  : ["traditional"];

const ALLOWED_DIFFICULTIES = new Set(allowedDifficulties);
const ALLOWED_THEMES = new Set(allowedThemes);
const DEFAULT_DIFFICULTY = allowedDifficulties[0] || "easy";
const DEFAULT_THEME = allowedThemes[0] || "traditional";

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
  const storedDifficulty = getStoredValue(PROFILE_STORAGE_KEYS.difficulty);
  const storedTheme = getStoredValue(PROFILE_STORAGE_KEYS.theme);

  if (displayNameEl) {
    displayNameEl.value = window.PROFILE_DISPLAY_NAME || displayNameEl.value || "";
  }

  if (ALLOWED_DIFFICULTIES.has(storedDifficulty)) {
    defaultDifficultyEl.value = storedDifficulty;
  }

  if (ALLOWED_THEMES.has(storedTheme)) {
    defaultThemeEl.value = storedTheme;
  }

  updatePreferenceBars();
}

function updatePreferenceBars() {
  profileDifficultyButtons.forEach((btn) => {
    const value = btn.getAttribute("data-difficulty") || "easy";
    const isSelected = value === defaultDifficultyEl.value;
    btn.classList.toggle("is-selected", isSelected);
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });

  profileThemeButtons.forEach((btn) => {
    const value = btn.getAttribute("data-theme") || "traditional";
    const isSelected = value === defaultThemeEl.value;
    btn.classList.toggle("is-selected", isSelected);
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

function savePreferences(event) {
  const difficulty = defaultDifficultyEl.value;
  const theme = defaultThemeEl.value;

  if (ALLOWED_DIFFICULTIES.has(difficulty)) {
    window.localStorage.setItem(PROFILE_STORAGE_KEYS.difficulty, difficulty);
  }
  if (ALLOWED_THEMES.has(theme)) {
    window.localStorage.setItem(PROFILE_STORAGE_KEYS.theme, theme);
  }
}

function resetPreferences() {
  window.localStorage.removeItem(PROFILE_STORAGE_KEYS.difficulty);
  window.localStorage.removeItem(PROFILE_STORAGE_KEYS.theme);

  if (displayNameEl) {
    displayNameEl.value = window.PROFILE_DISPLAY_NAME || "";
  }
  defaultDifficultyEl.value = DEFAULT_DIFFICULTY;
  defaultThemeEl.value = DEFAULT_THEME;
  updatePreferenceBars();
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

function updateCommentTypeButtons() {
  if (!messageTypeEl || !commentTypeButtons.length) {
    return;
  }

  const selectedType = messageTypeEl.value;
  commentTypeButtons.forEach((btn) => {
    const value = btn.getAttribute("data-message-type") || "win";
    const isSelected = value === selectedType;
    btn.classList.toggle("is-selected", isSelected);
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

function updateVisibleCommentList() {
  if (!messageTypeEl || !commentTypePanels.length) {
    return;
  }

  const selectedType = messageTypeEl.value;
  commentTypePanels.forEach((panel) => {
    const panelType = panel.getAttribute("data-message-list");
    panel.hidden = panelType !== selectedType;
  });
}

function applySelectedCommentType() {
  updateCommentTypeButtons();
  updateVisibleCommentList();
  updateCommentEditorVisibility();
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
  applySelectedCommentType();
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
  updateCommentTypeButtons();
  updateVisibleCommentList();
  commentTextEl.focus();
}

if (profileForm) {
  profileForm.addEventListener("submit", savePreferences);
}
if (resetPreferencesBtn) {
  resetPreferencesBtn.addEventListener("click", resetPreferences);
}

if (profileDifficultyButtons.length) {
  profileDifficultyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-difficulty") || "easy";
      if (!ALLOWED_DIFFICULTIES.has(value)) {
        return;
      }
      defaultDifficultyEl.value = value;
      updatePreferenceBars();
    });
  });
}

if (profileThemeButtons.length) {
  profileThemeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-theme") || "traditional";
      if (!ALLOWED_THEMES.has(value)) {
        return;
      }
      defaultThemeEl.value = value;
      updatePreferenceBars();
    });
  });
}

if (messageTypeEl) {
  messageTypeEl.addEventListener("change", () => {
    if (commentIdEl) {
      commentIdEl.value = "";
    }
    if (saveCommentBtnEl) {
      saveCommentBtnEl.textContent = "Add comment";
    }
    applySelectedCommentType();
  });
}

if (commentTypeButtons.length && messageTypeEl) {
  commentTypeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-message-type") || "win";
      messageTypeEl.value = value;
      if (commentIdEl) {
        commentIdEl.value = "";
      }
      if (saveCommentBtnEl) {
        saveCommentBtnEl.textContent = "Add comment";
      }
      applySelectedCommentType();
    });
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
  applySelectedCommentType();
}

if (commentFeedbackMessageEl) {
  const feedbackText = (commentFeedbackMessageEl.textContent || "").trim();
  const shouldAutoHide = /\b(saved|deleted|updated)\b/i.test(feedbackText);
  if (shouldAutoHide) {
    window.setTimeout(() => {
      commentFeedbackMessageEl.hidden = true;
    }, 20000);
  }
}

loadPreferences();
