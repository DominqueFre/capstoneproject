// Piece Choice and Gallery Visibility Logic

document.addEventListener('DOMContentLoaded', function () {
  const choiceForm = document.getElementById('choiceForm');
  const pieceChoiceOptions = document.getElementById('pieceChoiceOptions');
  const selectedPieceImageContainer = document.getElementById('selectedPieceImageContainer');
  const thumbnailGallerySection = document.getElementById('thumbnailGallerySection');
  const changeSelectedAvatarContainer = document.getElementById('changeSelectedAvatarContainer');
  const changeSelectedAvatarRadio = document.getElementById('changeSelectedAvatarRadio');
  const gallerySelectionForm = document.getElementById('gallerySelectionForm');
  const saveGalleryBtn = document.getElementById('saveGalleryBtn');
  const galleryMessage = document.getElementById('galleryMessage');

  // Helper: get current radio value
  function getPieceChoiceValue() {
    const radios = choiceForm.querySelectorAll('input[type="radio"][name$=choice]');
    for (const radio of radios) {
      if (radio.checked) return radio.value;
    }
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
      if (thumbnailGallerySection) thumbnailGallerySection.style.display = '';
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

  // Listen for radio changes
  if (choiceForm) {
    choiceForm.addEventListener('change', function (e) {
      if (e.target.name.endsWith('choice')) {
        changeMode = false;
        updateGalleryVisibility();
      }
      if (e.target.id === 'changeSelectedAvatarRadio') {
        changeMode = e.target.checked;
        updateGalleryVisibility();
      }
    });
  }

  // Listen for gallery save

  if (gallerySelectionForm) {
    gallerySelectionForm.addEventListener('submit', function () {
      changeMode = false;
      // Update SAVED_PIECE_IDENTIFIER after save
      const selected = gallerySelectionForm.querySelector('.thumbnail-item.is-selected');
      if (selected) {
        window.SAVED_PIECE_IDENTIFIER = selected.dataset.pieceId;
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

  // Initial state
  updateGalleryVisibility();
});
