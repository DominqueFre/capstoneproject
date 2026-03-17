// Alt descriptions for all game piece images
const GAME_PIECE_ALTS = {
  "game_traditional_gamepiece_0": "ornate 0, gold and turquoise",
  "game_traditional_gamepiece_1": "ornate X, gold, engraved",
  "game_robot_gamepiece_0": "cute light blue robot",
  "game_robot_gamepiece_1": "cute orange robot",
  "game_robot_gamepiece_2": "relentless, fierce dog robot",
  "game_robot_gamepiece_3": "green, orb, hover robot with claw",
  "game_robot_gamepiece_4": "cute big headed robot",
  "game_robot_gamepiece_5": "blue crawler robot",
  "game_robot_gamepiece_6": "red dual antennaed robot",
  "game_robot_gamepiece_7": "multi-armed silver humanoid robot",
  "game_robot_gamepiece_8": "waving turquoise robot",
  "game_robot_gamepiece_9": "small silver robot",
  "game_fantasy_gamepiece_0": "wizard, holding a wooden staff",
  "game_fantasy_gamepiece_1": "witch, holding a blue bubbling potion",
  "game_fantasy_gamepiece_2": "young, female adventurer",
  "game_fantasy_gamepiece_3": "woodcutter, holding a fearsome axe",
  "game_fantasy_gamepiece_4": "a young girl, holding a broom",
  "game_fantasy_gamepiece_5": "elf in green cloak",
  "game_fantasy_gamepiece_6": "portly king wearing a crown",
  "game_fantasy_gamepiece_7": "princess in pink gown",
  "game_fantasy_gamepiece_8": "green dragon",
  "game_fantasy_gamepiece_9": "brown dragon",
  "game_flowers_gamepiece_0": "red rose",
  "game_flowers_gamepiece_1": "yellow and white daffodil",
  "game_flowers_gamepiece_2": "purple pansy",
  "game_flowers_gamepiece_3": "poppy",
  "game_flowers_gamepiece_4": "daisy",
  "game_flowers_gamepiece_5": "lily of the valley",
  "game_flowers_gamepiece_6": "pink tulip",
  "game_flowers_gamepiece_7": "peony",
  "game_flowers_gamepiece_8": "dahlia",
  "game_flowers_gamepiece_9": "sunflower"
};
// Piece Choice and Gallery Visibility Logic

document.addEventListener('DOMContentLoaded', function () {
  // On page load, show the heading image if a piece is selected
  if (window.SAVED_PIECE_IDENTIFIER) {
    showPieceChoiceHeadingImage(window.SAVED_PIECE_IDENTIFIER);
  }
  const choiceForm = document.getElementById('choiceForm');
  const pieceChoiceOptions = document.getElementById('pieceChoiceOptions');
  const selectedPieceImageContainer = document.getElementById('selectedPieceImageContainer');
  const thumbnailGallerySection = document.getElementById('thumbnailGallerySection');
  const gallerySelectionForm = document.getElementById('gallerySelectionForm');
  const saveGalleryBtn = document.getElementById('saveGalleryBtn');
  const galleryMessage = document.getElementById('galleryMessage');
  const pieceChoiceHiddenInput = document.getElementById('pieceChoiceHiddenInput');
  const pieceChoiceBtns = document.querySelectorAll('.piece-choice-btn');

  // Helper: get current radio value
  function getPieceChoiceValue() {
    if (pieceChoiceHiddenInput) return pieceChoiceHiddenInput.value;
    return null;
  }


  // Helper: is a piece saved?
  function isPieceSaved() {
    // Use backend value for saved piece
    if (window.SAVED_PIECE_IDENTIFIER && window.SAVED_PIECE_IDENTIFIER !== "") {
      return true;
    }
    // Fallback: check if a piece is selected in the gallery
    if (!gallerySelectionForm) return false;
    const selected = gallerySelectionForm.querySelector('.thumbnail-item.is-selected');
    return !!selected;
  }

  // State: are we in 'change' mode?
  let changeMode = false;

  // Map piece identifier to image URL (must match backend logic)
  function getPieceImageUrl(pieceId) {
    if (!pieceId) return null;
    if (pieceId === 'avatar' && window.AVATAR_IMAGE_URL) {
      return window.AVATAR_IMAGE_URL;
    }
    if (pieceId.startsWith('traditional_')) {
      const idx = pieceId.split('_')[1];
      return `/static/gamehome/images/game_traditional_gamepiece_${idx}.png`;
    }
    if (pieceId.startsWith('robot_')) {
      const idx = pieceId.split('_')[1];
      return `/static/gamehome/images/game_robot_gamepiece_${idx}.png`;
    }
    if (pieceId.startsWith('fantasy_')) {
      const idx = pieceId.split('_')[1];
      return `/static/gamehome/images/game_fantasy_gamepiece_${idx}.png`;
    }
    if (pieceId.startsWith('flowers_')) {
      const idx = pieceId.split('_')[1];
      return `/static/gamehome/images/game_flowers_gamepiece_${idx}.png`;
    }
    return null;
  }

  // Show/hide gallery and update selected piece image
  function updateGalleryVisibility() {
    const choice = getPieceChoiceValue();
    const pieceSaved = isPieceSaved();

    // Update selected piece image
    if (selectedPieceImageContainer) {
      selectedPieceImageContainer.innerHTML = '';
      // Always show the selected piece if set, unless gallery is open for selection
      if (window.SAVED_PIECE_IDENTIFIER && !(choice === 'Selection' && changeMode)) {
        const url = getPieceImageUrl(window.SAVED_PIECE_IDENTIFIER);
        if (url) {
          const img = document.createElement('img');
          img.src = url;
          // Use alt from dictionary, fallback to generic
          const altKey = `game_${window.SAVED_PIECE_IDENTIFIER.replace(/_.*/, '_gamepiece_')}${window.SAVED_PIECE_IDENTIFIER.split('_').pop()}`;
          img.alt = GAME_PIECE_ALTS[altKey] || 'Selected game piece';
          img.style.height = '2.4em';
          img.style.verticalAlign = 'middle';
          img.style.marginLeft = '0.5em';
          selectedPieceImageContainer.appendChild(img);
        }
      }
    }

    const profileContentSection = document.getElementById('profileContentSection');
    // Debug: log class lists after every toggle
    if (profileContentSection) {
      console.log('[DEBUG] #profileContentSection classList:', Array.from(profileContentSection.classList));
    } else {
      console.warn('[DEBUG] #profileContentSection not found');
    }
    if (thumbnailGallerySection) {
      console.log('[DEBUG] #thumbnailGallerySection classList:', Array.from(thumbnailGallerySection.classList));
    } else {
      console.warn('[DEBUG] #thumbnailGallerySection not found');
    }

    if (choice === 'Selection' && (!pieceSaved || changeMode)) {
      // Show gallery, hide main content
      if (thumbnailGallerySection) {
        thumbnailGallerySection.classList.remove('d-none');
        if (typeof window.attachGalleryListeners === 'function') {
          window.attachGalleryListeners();
        } else {
          console.warn('attachGalleryListeners is not defined on window. Gallery will not be interactive.');
        }
      }
      if (profileContentSection) profileContentSection.classList.add('d-none');
    } else {
      // Hide gallery, show main content
      if (thumbnailGallerySection) thumbnailGallerySection.classList.add('d-none');
      if (profileContentSection) profileContentSection.classList.remove('d-none');
      changeMode = false;
    }
    // Debug: log class lists after toggling
    if (profileContentSection) {
      console.log('[DEBUG][AFTER] #profileContentSection classList:', Array.from(profileContentSection.classList));
    }
    if (thumbnailGallerySection) {
      console.log('[DEBUG][AFTER] #thumbnailGallerySection classList:', Array.from(thumbnailGallerySection.classList));
    }
  }
  // Expose globally for gallery.js
  window.updateGalleryVisibility = updateGalleryVisibility;

  // Save piece choice via AJAX
  function savePieceChoiceAJAX(choice, pieceIdentifier, skipInit, callback) {
    fetch('/api/piece-choice/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ choice: choice, piece_identifier: pieceIdentifier }),
      credentials: 'same-origin',
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          console.log('[PieceChoice] AJAX response:', data);
          window.SAVED_PIECE_IDENTIFIER = data.piece_identifier || '';
          window.CURRENT_PIECE_CHOICE = data.choice || '';
          console.log('[PieceChoice] window.CURRENT_PIECE_CHOICE after save:', window.CURRENT_PIECE_CHOICE);
          if (!skipInit) setInitialPieceChoice();
          if (typeof callback === 'function') callback(true);
        } else {
          // If error is 'piece_identifier required for Selection', open gallery for first selection, no alert
          if (data.error && data.error.includes('piece_identifier required for Selection')) {
            changeMode = true;
            updateGalleryVisibility();
          } else if (window.alert) {
            alert('Failed to save piece choice: ' + (data.error || 'Unknown error'));
          }
          if (typeof callback === 'function') callback(false);
        }
      });
  }

  // Expose globally for gallery.js
  window.savePieceChoiceAJAX = savePieceChoiceAJAX;

  // Listen for piece choice button clicks
  pieceChoiceBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const choice = this.dataset.choice;
      if (choice === 'Change') {
        // Only open gallery, do not persist selection
        changeMode = true;
        updateGalleryVisibility();
        // Revert button highlight to previous after a tick
        setTimeout(() => {
          pieceChoiceBtns.forEach(b => b.classList.remove('is-selected'));
          // Restore previous selection
          let prev = window.CURRENT_PIECE_CHOICE || (window.SAVED_PIECE_IDENTIFIER ? 'Selection' : 'Standard');
          pieceChoiceBtns.forEach(b => {
            if (b.dataset.choice === prev) b.classList.add('is-selected');
          });
          if (pieceChoiceHiddenInput) pieceChoiceHiddenInput.value = prev;
        }, 0);
        return;
      }
      // For Default, Random, Selected
      pieceChoiceBtns.forEach(b => b.classList.remove('is-selected'));
      this.classList.add('is-selected');
      if (pieceChoiceHiddenInput) pieceChoiceHiddenInput.value = choice;
      changeMode = false;
      updateGalleryVisibility();
      if (choice === 'Selected') {
        if (window.SAVED_PIECE_IDENTIFIER) {
          showPieceChoiceHeadingImage(window.SAVED_PIECE_IDENTIFIER);
          // Always send the saved piece identifier from the database
          savePieceChoiceAJAX('Selection', window.SAVED_PIECE_IDENTIFIER);
        } else {
          // No piece selected, open gallery for first selection
          changeMode = true;
          updateGalleryVisibility();
        }
      } else {
        savePieceChoiceAJAX(choice, null);
        showPieceChoiceHeadingImage(null);
      }
    });
  });

  // Show the selected piece image at the end of the heading
  function showPieceChoiceHeadingImage(pieceId) {
    const container = document.getElementById('pieceChoiceHeadingImageContainer');
    if (!container) return;
    container.innerHTML = '';
    if (!pieceId) return;
    const url = getPieceImageUrl(pieceId);
    if (url) {
      const wrapper = document.createElement('span');
      wrapper.className = 'piece-choice-avatar-bg';
      const img = document.createElement('img');
      img.src = url;
      // Use alt from dictionary, fallback to generic
      const altKey = pieceId ? `game_${pieceId.replace(/_.*/, '_gamepiece_')}${pieceId.split('_').pop()}` : '';
      img.alt = GAME_PIECE_ALTS[altKey] || 'Selected game piece';
      img.style.height = '1.2em'; // Match heading font size
      img.style.verticalAlign = 'middle';
      img.style.borderRadius = '0.2em';
      wrapper.appendChild(img);
      container.appendChild(wrapper);
    }
  }

  // Expose globally so gallery.js can call it
  window.showPieceChoiceHeadingImage = showPieceChoiceHeadingImage;

  // Listen for gallery save

  if (gallerySelectionForm) {
    gallerySelectionForm.addEventListener('submit', function (e) {
      e.preventDefault();
      changeMode = false;
      const selected = gallerySelectionForm.querySelector('.thumbnail-item.is-selected');
      if (selected) {
        // Save Selection choice with selected piece, skip setInitialPieceChoice
        savePieceChoiceAJAX('Selection', selected.dataset.pieceId, true);
      }
      // No longer call updateGalleryVisibility here; hideGalleryAndShowProfile will handle UI update.
    });
  }

  // Listen for clear selection

  if (gallerySelectionForm) {
    const clearBtn = gallerySelectionForm.querySelector('#clearGalleryBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        window.SAVED_PIECE_IDENTIFIER = "";
        setTimeout(updateGalleryVisibility, 100);
      });
    }
  }

  // Expose avatar image URL if present
  if (window.SAVED_PIECE_IDENTIFIER === 'avatar') {
    // Try to get from DOM (avatar image in gallery)
    const avatarBtn = document.querySelector('.thumbnail-item[data-piece-id="avatar"] img');
    if (avatarBtn) {
      window.AVATAR_IMAGE_URL = avatarBtn.src;
    }
  }

  // Initial state: highlight correct button and set hidden input
  function setInitialPieceChoice() {
    let initial = 'Standard';
    if (window.CURRENT_PIECE_CHOICE) {
      initial = window.CURRENT_PIECE_CHOICE;
    } else if (window.SAVED_PIECE_IDENTIFIER) {
      initial = 'Selection';
    }
    // Always highlight 'Selected' if a piece is saved and no explicit choice is set
    if (!window.CURRENT_PIECE_CHOICE && window.SAVED_PIECE_IDENTIFIER) {
      initial = 'Selection';
    }
    pieceChoiceBtns.forEach(b => {
      if (b.dataset.choice === initial) b.classList.add('is-selected');
      else b.classList.remove('is-selected');
    });
    if (pieceChoiceHiddenInput) pieceChoiceHiddenInput.value = initial;
    // Always show the selected piece image if a piece is saved
    if (window.SAVED_PIECE_IDENTIFIER) {
      showPieceChoiceHeadingImage(window.SAVED_PIECE_IDENTIFIER);
    }
    updateGalleryVisibility();
  }
  setInitialPieceChoice();

  function showGallery() {
    const main = document.getElementById('profileContentSection');
    const gallery = document.getElementById('thumbnailGallerySection');
    console.log('[showGallery] called. main:', main, 'gallery:', gallery);
    if (main) {
      main.classList.add('d-none');
      console.log('[showGallery] Hiding profileMainContent');
    }
    if (gallery) {
      gallery.classList.remove('d-none');
      console.log('[showGallery] Showing thumbnailGallerySection, d-none removed');
    }
    if (typeof window.attachGalleryListeners === 'function') window.attachGalleryListeners();
  }

  function hideGalleryAndShowProfile() {
    const main = document.getElementById('profileContentSection');
    const gallery = document.getElementById('thumbnailGallerySection');
    console.log('[hideGalleryAndShowProfile] called. main:', main, 'gallery:', gallery);
    if (gallery) {
      gallery.classList.add('d-none');
      console.log('[hideGalleryAndShowProfile] Hiding thumbnailGallerySection, d-none added');
    }
    if (main) {
      main.classList.remove('d-none');
      console.log('[hideGalleryAndShowProfile] Showing profileContentSection, d-none removed');
    }
    if (window.showPieceChoiceHeadingImage && typeof window.SAVED_PIECE_IDENTIFIER !== 'undefined') {
      window.showPieceChoiceHeadingImage(window.SAVED_PIECE_IDENTIFIER);
    }
    // Do NOT call updateGalleryVisibility here, to avoid re-hiding the profile section immediately after showing it.
    const heading = document.getElementById('pieceChoiceHeadingImageContainer');
    if (heading) heading.scrollIntoView({block: 'center', behavior: 'instant'});
  }
  // Expose globally for gallery.js
  window.hideGalleryAndShowProfile = hideGalleryAndShowProfile;
});
