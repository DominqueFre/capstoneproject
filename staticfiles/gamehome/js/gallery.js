// Thumbnail Gallery Selection Logic
document.addEventListener('DOMContentLoaded', function () {

  function attachGalleryListeners() {
    const galleryItems = document.querySelectorAll('.thumbnail-item');
    const selectedPieceIdInput = document.getElementById('selectedPieceId');
    let currentSelection = null;

    // Always sync highlight to saved piece when gallery is shown, but only if visible
    const section = document.getElementById('thumbnailGallerySection');
    if (section && !section.classList.contains('d-none')) {
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
        // Save immediately via AJAX using savePieceChoiceAJAX with skipInit=true
        if (window.savePieceChoiceAJAX) {
          // Patch: call hideGalleryAndShowProfile only after save is successful
          window.savePieceChoiceAJAX('Selection', currentSelection, true, function(success) {
            if (success && window.hideGalleryAndShowProfile) window.hideGalleryAndShowProfile();
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

  // Handle form submission
  const galleryForm = document.getElementById('gallerySelectionForm');
  if (galleryForm) {
    galleryForm.addEventListener('submit', function (e) {
      if (!currentSelection) {
        e.preventDefault();
      }
    });
  }
});
