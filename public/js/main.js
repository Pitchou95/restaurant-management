/**
 * GourmetHub - Client-Side Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuIcon = document.getElementById('menuIcon');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        if (menuIcon) {
          menuIcon.classList.remove('fa-bars');
          menuIcon.classList.add('fa-xmark');
        }
      } else {
        mobileMenu.classList.add('hidden');
        if (menuIcon) {
          menuIcon.classList.remove('fa-xmark');
          menuIcon.classList.add('fa-bars');
        }
      }
    });
  }

  // 2. Global Delete Confirmation Modal Handler
  const deleteModal = document.getElementById('deleteModal');
  const deleteForm = document.getElementById('deleteForm');
  const deleteItemName = document.getElementById('deleteItemName');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const deleteTriggers = document.querySelectorAll('.open-delete-modal');

  function openDeleteModal(name, actionUrl) {
    if (!deleteModal || !deleteForm) return;
    if (deleteItemName) {
      deleteItemName.textContent = name || 'this item';
    }
    const cleanUrl = actionUrl.includes('?') ? actionUrl + '&_method=DELETE' : actionUrl + '?_method=DELETE';
    deleteForm.action = cleanUrl;
    deleteModal.classList.remove('hidden');
    deleteModal.classList.add('flex');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeDeleteModal() {
    if (!deleteModal) return;
    deleteModal.classList.add('hidden');
    deleteModal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  deleteTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.getAttribute('data-name');
      const action = btn.getAttribute('data-action');
      openDeleteModal(name, action);
    });
  });

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  }

  // Close when clicking modal backdrop
  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        closeDeleteModal();
      }
    });
  }

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && deleteModal && !deleteModal.classList.contains('hidden')) {
      closeDeleteModal();
    }
  });

  // 3. Auto-dismiss Flash Alerts
  const flashAlerts = document.querySelectorAll('.flash-alert');
  flashAlerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });
});
