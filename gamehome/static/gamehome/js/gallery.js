// Thumbnail Gallery Selection Logic
document.addEventListener('DOMContentLoaded', function () {
  const galleryItems = document.querySelectorAll('.thumbnail-item');
  const selectedPieceIdInput = document.getElementById('selectedPieceId');
  const saveGalleryBtn = document.getElementById('saveGalleryBtn');
  const clearGalleryBtn = document.getElementById('clearGalleryBtn');
  const galleryMessage = document.getElementById('galleryMessage');

  // Initialize: find current selection if any
  let currentSelection = null;
  galleryItems.forEach(item => {
    if (item.classList.contains('is-selected')) {
      currentSelection = item.dataset.pieceId;
    }
  });

  // Handle thumbnail item clicks
  galleryItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();

      // Remove previous selection
      galleryItems.forEach(i => i.classList.remove('is-selected'));

      // Add selection to clicked item
      this.classList.add('is-selected');
      currentSelection = this.dataset.pieceId;
      selectedPieceIdInput.value = currentSelection;

      // Enable save button
      saveGalleryBtn.disabled = false;

      // Show message
      galleryMessage.textContent = `Selected: ${currentSelection}`;
      galleryMessage.style.color = 'var(--theme-accent, #204f9f)';
    });
  });

  // Clear selection button
  if (clearGalleryBtn) {
    clearGalleryBtn.addEventListener('click', function (e) {
      e.preventDefault();

      // Remove all selections
      galleryItems.forEach(i => i.classList.remove('is-selected'));
      currentSelection = null;
      selectedPieceIdInput.value = '';

      // Disable save button
      saveGalleryBtn.disabled = true;

      // Clear message
      galleryMessage.textContent = '';
    });
  }

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
