// Thumbnail Gallery Selection Logic
document.addEventListener('DOMContentLoaded', function () {

  function attachGalleryListeners() {
    const galleryItems = document.querySelectorAll('.thumbnail-item');
    const selectedPieceIdInput = document.getElementById('selectedPieceId');
    const galleryMessage = document.getElementById('galleryMessage');
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
                // Uncheck all radios, then check the 'Selection' radio button
                const radios = document.querySelectorAll('input[type="radio"][name$=choice]');
                radios.forEach(radio => { radio.checked = false; });
                radios.forEach(radio => {
                  if (radio.value === 'Selection') {
                    radio.click(); // This will check the radio and fire the change event
                  }
                });
                // Hide gallery and update UI via updateGalleryVisibility
                const section = document.getElementById('thumbnailGallerySection');
                if (section) section.style.display = 'none';
                if (window.updateGalleryVisibility) window.updateGalleryVisibility();
                // Show message
                if (galleryMessage) {
                  galleryMessage.textContent = `Saved: ${currentSelection}`;
                  galleryMessage.style.color = 'var(--theme-accent, #204f9f)';
                }
              } else {
                let errorMsg = 'Failed to save: ' + (data.error || 'Unknown error');
                if (res.status === 401) {
                  errorMsg = 'You must be logged in to save your piece selection.';
                }
                if (galleryMessage) {
                  galleryMessage.textContent = errorMsg;
                  galleryMessage.style.color = '#9b1c1c';
                }
                alert(errorMsg); // Show error to user
              }
            })
            .catch(err => {
              console.error('Piece choice save error:', err);
              if (galleryMessage) {
                galleryMessage.textContent = 'Network or server error while saving.';
                galleryMessage.style.color = '#9b1c1c';
              }
              alert('Network or server error while saving.');
            })
            .finally(() => {
              // Always update UI after save attempt
              if (window.updateGalleryVisibility) window.updateGalleryVisibility();
            });
        } else {
          // Fallback: always update UI
          if (window.updateGalleryVisibility) window.updateGalleryVisibility();
        }
      });
    });
  }

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
