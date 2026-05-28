/* ==========================================================================
   KeeZ Campus - TPO Partnership Landing Page Scripts
   Company: Keezenix Global | Brand: KeeZ Campus
   ========================================================================== */

(function () {
  'use strict';

  /* ── DOM References ──────────────────────────────────────────────────── */
  const DOM = {
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('navToggle'),
    navLinks: document.getElementById('navLinks'),
    mobileOverlay: document.getElementById('mobileOverlay'),
    scrollTop: document.getElementById('scrollTop'),
    tpoForm: document.getElementById('tpoForm'),
    successPopup: document.getElementById('successPopup'),
    popupClose: document.getElementById('popupClose'),
    entriesContainer: document.getElementById('entriesTableContainer'),
    entriesCount: document.getElementById('entriesCount'),
    storedEntries: document.getElementById('storedEntries'),
  };

  /* ── Configuration ───────────────────────────────────────────────────── */
  const STORAGE_KEY = 'keez_tpo_entries';
  const SCROLL_THRESHOLD = 80;
  const REVEAL_THRESHOLD = 0.15;

  /* ═══════════════════════════════════════════════════════════════════════
     1. STICKY NAVBAR
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Toggles the 'scrolled' class on the navbar when
   * the user scrolls past a threshold.
   */
  function handleNavbarScroll() {
    if (!DOM.navbar) return;
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    DOM.navbar.classList.toggle('scrolled', scrolled);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     2. MOBILE MENU TOGGLE
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Opens or closes the mobile navigation menu.
   */
  function toggleMobileMenu() {
    const isOpen = DOM.navLinks.classList.contains('active');

    DOM.navLinks.classList.toggle('active');
    DOM.navToggle.classList.toggle('active');
    DOM.mobileOverlay.classList.toggle('active');

    // Accessibility: toggle aria-expanded
    DOM.navToggle.setAttribute('aria-expanded', !isOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  /**
   * Closes the mobile menu (used when a link is clicked or overlay tapped).
   */
  function closeMobileMenu() {
    DOM.navLinks.classList.remove('active');
    DOM.navToggle.classList.remove('active');
    DOM.mobileOverlay.classList.remove('active');
    DOM.navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ═══════════════════════════════════════════════════════════════════════
     3. SMOOTH SCROLLING NAVIGATION
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Handles smooth scroll to target section when
   * a navigation link with a hash is clicked.
   */
  function handleSmoothScroll(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    closeMobileMenu();

    const navHeight = DOM.navbar ? DOM.navbar.offsetHeight : 0;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     4. ACTIVE NAV LINK HIGHLIGHTING
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Highlights the current section's corresponding nav link
   * based on scroll position.
   */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = DOM.navLinks ? DOM.navLinks.querySelectorAll('a[href^="#"]') : [];
    const navHeight = DOM.navbar ? DOM.navbar.offsetHeight + 40 : 40;

    let currentSection = '';

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - navHeight;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     5. SCROLL REVEAL ANIMATIONS
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Uses IntersectionObserver to reveal elements with the
   * '.reveal' class as they enter the viewport.
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately
      revealElements.forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: REVEAL_THRESHOLD,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     6. SCROLL TO TOP BUTTON
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Shows/hides the scroll-to-top button based on scroll position.
   */
  function handleScrollTopVisibility() {
    if (!DOM.scrollTop) return;
    DOM.scrollTop.classList.toggle('visible', window.scrollY > 400);
  }

  /**
   * Scrolls smoothly to the top of the page.
   */
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     7. FORM VALIDATION & SUBMISSION
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Validates a single form field.
   * Returns true if valid, false otherwise.
   * @param {HTMLElement} input - The input element to validate
   * @param {HTMLElement} errorEl - The error message element
   * @param {Function} validationFn - Custom validation function
   * @returns {boolean}
   */
  function validateField(input, errorEl, validationFn) {
    const value = input.value.trim();
    const isValid = validationFn(value);

    input.classList.toggle('error', !isValid);
    errorEl.classList.toggle('show', !isValid);

    return isValid;
  }

  /**
   * Validates the email format using a basic regex.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    if (!email) return false;
    var pattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  }

  /**
   * Validates phone number (must be 10 digits, optionally with country code).
   * @param {string} phone
   * @returns {boolean}
   */
  function isValidPhone(phone) {
    if (!phone) return false;
    // Strip spaces, dashes, parentheses, and leading +91
    var cleaned = phone.replace(/[\s\-()]/g, '').replace(/^\+91/, '');
    return /^\d{10}$/.test(cleaned);
  }

  /**
   * Handles form submission with full validation.
   * @param {Event} e - The submit event
   */
  function handleFormSubmit(e) {
    e.preventDefault();

    // Get field references
    var collegeName = document.getElementById('collegeName');
    var tpoName = document.getElementById('tpoName');
    var email = document.getElementById('email');
    var phone = document.getElementById('phone');
    var program = document.getElementById('program');

    var collegeNameError = document.getElementById('collegeNameError');
    var tpoNameError = document.getElementById('tpoNameError');
    var emailError = document.getElementById('emailError');
    var phoneError = document.getElementById('phoneError');
    var programError = document.getElementById('programError');

    // Run all validations
    var validations = [
      validateField(collegeName, collegeNameError, function (v) { return v.length > 0; }),
      validateField(tpoName, tpoNameError, function (v) { return v.length > 0; }),
      validateField(email, emailError, isValidEmail),
      validateField(phone, phoneError, isValidPhone),
      validateField(program, programError, function (v) { return v.length > 0; }),
    ];

    // Check if all valid
    var allValid = validations.every(function (v) { return v === true; });

    if (!allValid) {
      // Focus the first invalid field
      var firstInvalid = DOM.tpoForm.querySelector('.form-input.error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Build entry object
    var entry = {
      id: Date.now(),
      collegeName: collegeName.value.trim(),
      tpoName: tpoName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      program: program.value,
      submittedAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    // Save to localStorage
    saveEntry(entry);

    // Show success popup
    showSuccessPopup();

    // Clear form
    DOM.tpoForm.reset();

    // Remove any lingering error states
    DOM.tpoForm.querySelectorAll('.form-input').forEach(function (input) {
      input.classList.remove('error');
    });
    DOM.tpoForm.querySelectorAll('.form-error').forEach(function (err) {
      err.classList.remove('show');
    });

    // Refresh entries display
    renderEntries();
  }

  /**
   * Clears error state on input when user starts typing.
   */
  function clearErrorOnInput(e) {
    var input = e.target;
    var errorEl = input.parentElement.querySelector('.form-error');
    if (input.classList.contains('error')) {
      input.classList.remove('error');
      if (errorEl) errorEl.classList.remove('show');
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     8. LOCAL STORAGE MANAGEMENT
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Retrieves all stored entries from localStorage.
   * @returns {Array}
   */
  function getEntries() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error reading localStorage:', err);
      return [];
    }
  }

  /**
   * Saves a new entry to localStorage.
   * @param {Object} entry
   */
  function saveEntry(entry) {
    var entries = getEntries();
    entries.unshift(entry); // Add to beginning (newest first)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }

  /**
   * Removes an entry from localStorage by its ID.
   * @param {number} id
   */
  function removeEntry(id) {
    var entries = getEntries();
    var filtered = entries.filter(function (e) { return e.id !== id; });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.error('Error removing from localStorage:', err);
    }
    renderEntries();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     9. RENDER STORED ENTRIES TABLE
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Renders all stored entries as a styled HTML table.
   */
  function renderEntries() {
    var entries = getEntries();
    var container = DOM.entriesContainer;
    var countEl = DOM.entriesCount;

    if (!container) return;

    // Update count badge
    if (countEl) countEl.textContent = entries.length;

    // If no entries, show empty message
    if (entries.length === 0) {
      container.innerHTML =
        '<div class="entries-empty">' +
        '<p>No partnership inquiries yet. Submit the form above to get started!</p>' +
        '</div>';
      return;
    }

    // Build table HTML
    var html =
      '<table class="entries-table">' +
      '<thead>' +
      '<tr>' +
      '<th>College</th>' +
      '<th>TPO Name</th>' +
      '<th>Email</th>' +
      '<th>Phone</th>' +
      '<th>Program</th>' +
      '<th>Date</th>' +
      '<th>Action</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>';

    entries.forEach(function (entry) {
      html +=
        '<tr>' +
        '<td>' + escapeHtml(entry.collegeName) + '</td>' +
        '<td>' + escapeHtml(entry.tpoName) + '</td>' +
        '<td>' + escapeHtml(entry.email) + '</td>' +
        '<td>' + escapeHtml(entry.phone) + '</td>' +
        '<td>' + escapeHtml(entry.program) + '</td>' +
        '<td>' + escapeHtml(entry.submittedAt || '—') + '</td>' +
        '<td><button class="delete-btn" data-id="' + entry.id + '" title="Remove entry">✕ Remove</button></td>' +
        '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    // Attach delete event listeners
    container.querySelectorAll('.delete-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var entryId = parseInt(this.getAttribute('data-id'), 10);
        if (confirm('Are you sure you want to remove this entry?')) {
          removeEntry(entryId);
        }
      });
    });
  }

  /**
   * Escapes HTML special characters to prevent XSS.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     10. SUCCESS POPUP
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Shows the success popup modal.
   */
  function showSuccessPopup() {
    if (!DOM.successPopup) return;
    DOM.successPopup.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hides the success popup modal.
   */
  function hideSuccessPopup() {
    if (!DOM.successPopup) return;
    DOM.successPopup.classList.remove('show');
    document.body.style.overflow = '';
  }

  /* ═══════════════════════════════════════════════════════════════════════
     11. EVENT LISTENERS & INITIALIZATION
     ═══════════════════════════════════════════════════════════════════════ */

  function init() {
    // ── Scroll events (throttled) ──
    var scrollTicking = false;
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        window.requestAnimationFrame(function () {
          handleNavbarScroll();
          handleScrollTopVisibility();
          updateActiveNavLink();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    });

    // ── Mobile menu toggle ──
    if (DOM.navToggle) {
      DOM.navToggle.addEventListener('click', toggleMobileMenu);
    }

    // ── Mobile overlay click ──
    if (DOM.mobileOverlay) {
      DOM.mobileOverlay.addEventListener('click', closeMobileMenu);
    }

    // ── Smooth scrolling for all anchor links ──
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', handleSmoothScroll);
    });

    // ── Scroll to top button ──
    if (DOM.scrollTop) {
      DOM.scrollTop.addEventListener('click', scrollToTop);
    }

    // ── Form submission ──
    if (DOM.tpoForm) {
      DOM.tpoForm.addEventListener('submit', handleFormSubmit);

      // Clear errors on user input
      DOM.tpoForm.querySelectorAll('.form-input').forEach(function (input) {
        input.addEventListener('input', clearErrorOnInput);
        input.addEventListener('change', clearErrorOnInput);
      });
    }

    // ── Success popup close ──
    if (DOM.popupClose) {
      DOM.popupClose.addEventListener('click', hideSuccessPopup);
    }

    // Close popup on background click
    if (DOM.successPopup) {
      DOM.successPopup.addEventListener('click', function (e) {
        if (e.target === DOM.successPopup) {
          hideSuccessPopup();
        }
      });
    }

    // ── Keyboard accessibility ──
    document.addEventListener('keydown', function (e) {
      // Close popup on Escape
      if (e.key === 'Escape') {
        hideSuccessPopup();
        closeMobileMenu();
      }
    });

    // ── Initialize scroll reveal animations ──
    initScrollReveal();

    // ── Render stored entries on page load ──
    renderEntries();

    // ── Initial state checks ──
    handleNavbarScroll();
    handleScrollTopVisibility();

    console.log('✅ KeeZ Campus TPO Partnership Page initialized successfully.');
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
