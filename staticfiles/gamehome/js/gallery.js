// Thumbnail Gallery Selection Logic
document.addEventListener('DOMContentLoaded', function () {

  function attachGalleryListeners() {
    const galleryItems = document.querySelectorAll('.thumbnail-item');
    const selectedPieceIdInput = document.getElementById('selectedPieceId');
    let currentSelection = null;

    // Always sync highlight to saved piece when gallery is shown, but only if visible
    const section = document.getElementById('thumbnailGallerySection');
    if (section && section.style.display !== 'none') {
      const savedId = window.SAVED_PIECE_IDENTIFIER || '';
      galleryItems.forEach(item => {
        if (item.dataset.pieceId === savedId) {
          item.classList.add('is-selected');
          currentSelection = savedId;
          if (selectedPieceIdInput) selectedPieceIdInput.value = savedId;
        } else {
          item.classList.remove('is-selected');
        }
      });
    }

    galleryItems.forEach(item => {
      // Remove any previous listeners by replacing the node
      const newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);
    });
    // Re-query after replacement
    const newGalleryItems = document.querySelectorAll('.thumbnail-item');
    newGalleryItems.forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        // Remove previous selection
        newGalleryItems.forEach(i => i.classList.remove('is-selected'));
        // Add selection to clicked item
        this.classList.add('is-selected');
        currentSelection = this.dataset.pieceId;
        if (selectedPieceIdInput) selectedPieceIdInput.value = currentSelection;
        // Save immediately via AJAX
        if (window.fetch) {
          fetch('/api/piece-choice/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ choice: 'Selection', piece_identifier: currentSelection }),
            credentials: 'same-origin',
          })
            .then(async res => {
              let data, text;
              text = await res.text();
              try {
                data = JSON.parse(text);
              } catch (e) {
                console.error('Invalid JSON response. Raw response:', text);
                data = { ok: false, error: 'Invalid JSON response', raw: text };
              }
              console.log('Piece choice save response:', res.status, data); // Debug log
              if (data.ok) {
                window.SAVED_PIECE_IDENTIFIER = data.piece_identifier || '';
                window.CURRENT_PIECE_CHOICE = 'Selection';
                const pieceChoiceHiddenInput = document.getElementById('pieceChoiceHiddenInput');
                if (pieceChoiceHiddenInput) pieceChoiceHiddenInput.value = 'Selection';
                const pieceChoiceBtns = document.querySelectorAll('.piece-choice-btn');
                pieceChoiceBtns.forEach(btn => btn.classList.remove('is-selected'));
                pieceChoiceBtns.forEach(btn => {
                  if (btn.dataset.choice === 'Selection') btn.classList.add('is-selected');
                });
                // Use the new toggle logic
                if (window.hideGalleryAndShowProfile) window.hideGalleryAndShowProfile();
                // Hide the gallery
                const section = document.getElementById('thumbnailGallerySection');
                if (section) section.style.display = 'none';
                if (window.updateGalleryVisibility) window.updateGalleryVisibility();
                if (window.showPieceChoiceHeadingImage && typeof window.SAVED_PIECE_IDENTIFIER !== 'undefined') {
                  window.showPieceChoiceHeadingImage(window.SAVED_PIECE_IDENTIFIER);
                }
                // Scroll to the heading/image container to show update
                const heading = document.getElementById('pieceChoiceHeadingImageContainer');
                if (heading) heading.scrollIntoView({block: 'center', behavior: 'instant'});
              } else {
                let errorMsg = 'Failed to save: ' + (data.error || 'Unknown error');
                if (res.status === 401) {
                  errorMsg = 'You must be logged in to save your piece selection.';
                }
                alert(errorMsg); // Show error to user
              }
            })
            .catch(err => {
              console.error('Piece choice save error:', err);
              if (window.updateGalleryVisibility) window.updateGalleryVisibility();
            })
            .finally(() => {
              // No-op: all UI updates now handled in .then()
            });
        } else {
          // Fallback: always update UI
          if (window.updateGalleryVisibility) window.updateGalleryVisibility();
        }
      });
    });
  }
  // Expose globally for piece_choice.js and others
  window.attachGalleryListeners = attachGalleryListeners;

  // Expose for use in piece_choice.js
  window.attachGalleryListeners = attachGalleryListeners;

  // Attach on DOMContentLoaded (for initial render)
  attachGalleryListeners();

  // (clearGalleryBtn code removed as it was undefined and unused)

  // Handle form submission
  const galleryForm = document.getElementById('gallerySelectionForm');
  if (galleryForm) {
    galleryForm.addEventListener('submit', function (e) {
      if (!currentSelection) {
        e.preventDefault();
        galleryMessage.textContent = 'Please select a piece before saving.';
        galleryMessage.style.color = '#9b1c1c';
      }
    });
  }
});
