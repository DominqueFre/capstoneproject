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
      if (choice === 'Selection' && pieceSaved && !changeMode && window.SAVED_PIECE_IDENTIFIER) {
        const url = getPieceImageUrl(window.SAVED_PIECE_IDENTIFIER);
        if (url) {
          const img = document.createElement('img');
          img.src = url;
          img.alt = 'Selected piece';
          img.style.height = '2.4em'; // 3x typical 0.8em radio label font
          img.style.verticalAlign = 'middle';
          img.style.marginLeft = '0.5em';
          selectedPieceImageContainer.appendChild(img);
        }
      }
    }

    if (choice === 'Selection' && (!pieceSaved || changeMode)) {
      // Show gallery
      if (thumbnailGallerySection) {
        thumbnailGallerySection.style.display = '';
        if (window.attachGalleryListeners) window.attachGalleryListeners();
      }
      if (changeSelectedAvatarContainer) changeSelectedAvatarContainer.style.display = 'none';
    } else if (choice === 'Selection' && pieceSaved && !changeMode) {
      // Hide gallery, show change radio
      if (thumbnailGallerySection) thumbnailGallerySection.style.display = 'none';
      if (changeSelectedAvatarContainer) changeSelectedAvatarContainer.style.display = '';
    } else {
      // Hide everything
      if (thumbnailGallerySection) thumbnailGallerySection.style.display = 'none';
      if (changeSelectedAvatarContainer) changeSelectedAvatarContainer.style.display = 'none';
      changeMode = false;
      if (changeSelectedAvatarRadio) changeSelectedAvatarRadio.checked = false;
    }
  }
  // Expose globally for gallery.js
  window.updateGalleryVisibility = updateGalleryVisibility;

  // Save piece choice via AJAX
  function savePieceChoiceAJAX(choice, pieceIdentifier) {
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
          window.SAVED_PIECE_IDENTIFIER = data.piece_identifier || '';
          updateGalleryVisibility();
        } else {
          // If error is 'piece_identifier required for Selection', open gallery for first selection, no alert
          if (data.error && data.error.includes('piece_identifier required for Selection')) {
            changeMode = true;
            updateGalleryVisibility();
          } else if (window.alert) {
            alert('Failed to save piece choice: ' + (data.error || 'Unknown error'));
          }
        }
      });
  }

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
      img.alt = 'Selected piece';
      img.style.height = '1.2em'; // Match heading font size
      img.style.verticalAlign = 'middle';
      img.style.borderRadius = '0.2em';
      wrapper.appendChild(img);
      container.appendChild(wrapper);
    }
  }

  // Listen for gallery save

  if (gallerySelectionForm) {
    gallerySelectionForm.addEventListener('submit', function (e) {
      e.preventDefault();
      changeMode = false;
      const selected = gallerySelectionForm.querySelector('.thumbnail-item.is-selected');
      if (selected) {
        // Save Selection choice with selected piece
        savePieceChoiceAJAX('Selection', selected.dataset.pieceId);
      }
      setTimeout(updateGalleryVisibility, 100); // after save
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
    if (window.CURRENT_PIECE_CHOICE) initial = window.CURRENT_PIECE_CHOICE;
    else if (window.SAVED_PIECE_IDENTIFIER) initial = 'Selected';
    pieceChoiceBtns.forEach(b => {
      if (b.dataset.choice === initial) b.classList.add('is-selected');
      else b.classList.remove('is-selected');
    });
    if (pieceChoiceHiddenInput) pieceChoiceHiddenInput.value = initial;
    updateGalleryVisibility();
  }
  setInitialPieceChoice();
});
