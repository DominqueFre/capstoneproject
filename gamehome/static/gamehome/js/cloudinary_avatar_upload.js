// Cloudinary Widget Integration for profile avatar upload
// Requires: cloudinary widget loaded globally, and template variables for cloudName and uploadPreset

document.addEventListener('DOMContentLoaded', function () {
  const openCloudinaryBtn = document.getElementById('openCloudinaryWidget');
  const avatarImageInput = document.getElementById('id_avatar_image');
  const avatarForm = document.getElementById('avatarForm');

  if (openCloudinaryBtn && avatarImageInput && avatarForm && window.cloudinary) {
    openCloudinaryBtn.addEventListener('click', function (e) {
      e.preventDefault();

      // Initialize Cloudinary upload widget
      cloudinary.openUploadWidget(
        {
          cloudName: window.CLOUDINARY_CLOUD_NAME,
          uploadPreset: window.CLOUDINARY_UPLOAD_PRESET,
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif'],
          maxFileSize: 2000000,  // 2MB
          multiple: false,
          autoMinimize: true,
          folder: 'ttt-avatars/',
          resourceType: 'image'
        },
        function (error, result) {
          if (!error && result && result.event === 'success') {
            avatarImageInput.value = result.info.secure_url;

            let preview = avatarForm.querySelector('.avatar-preview');
            if (!preview) {
              preview = document.createElement('p');
              preview.className = 'avatar-preview';
              avatarForm.appendChild(preview);
            }
            preview.textContent = 'Avatar uploaded. Saving to your profile...';
            avatarForm.submit();
          }
        }
      );
    });
  }
});
