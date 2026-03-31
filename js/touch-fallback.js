/**
 * touch-fallback.js — Mobile/tablet touch interaction layer
 * Provides "tap to select + tap to place" as a fallback for drag-and-drop.
 * Also enhances touch targets for simulator buy/sell buttons.
 *
 * <!-- FUTURE: Vietnamese i18n — wrap hint text in t() -->
 */

'use strict';

const TouchFallback = (() => {
  let isTouchDevice = false;
  let selectedCompany = null;

  function init() {
    // Detect touch capability
    isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (isTouchDevice) {
      document.body.classList.add('touch-device');
      initTapRanking();
      enhanceTouchTargets();
    }

    // Also listen for first touch event as a fallback detection
    window.addEventListener('touchstart', function onFirstTouch() {
      if (!isTouchDevice) {
        isTouchDevice = true;
        document.body.classList.add('touch-device');
        initTapRanking();
        enhanceTouchTargets();
      }
      window.removeEventListener('touchstart', onFirstTouch);
    }, { passive: true });
  }

  /* ──────────── Tap-to-Select Ranking (Module 3) ──────────── */
  function initTapRanking() {
    const cards = document.querySelectorAll('.company-card[draggable]');
    const slots = document.querySelectorAll('.rank-slot');

    // Disable native drag on touch (it conflicts)
    cards.forEach(card => {
      card.setAttribute('draggable', 'false');

      card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleCardTap(card);
      });

      // Prevent context menu on long-press
      card.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    slots.forEach(slot => {
      slot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSlotTap(slot);
      });
    });

    // Tap anywhere else to deselect
    document.addEventListener('click', (e) => {
      if (selectedCompany && !e.target.closest('.company-card') && !e.target.closest('.rank-slot')) {
        deselectCard();
      }
    });
  }

  function handleCardTap(card) {
    const companyId = card.dataset.company;

    if (selectedCompany === companyId) {
      // Tap same card again = deselect
      deselectCard();
      return;
    }

    // Deselect previous
    deselectCard();

    // Select this card
    selectedCompany = companyId;
    card.classList.add('tap-selected');

    // Update hint
    const hint = document.getElementById('rankTouchHint');
    if (hint) {
      const company = COMPANIES.find(c => c.id === companyId);
      hint.textContent = `${company?.emoji || ''} ${company?.name || ''} selected — now tap a slot to place it!`;
      hint.style.background = 'rgba(20,184,166,0.1)';
      hint.style.color = 'var(--teal)';
      hint.style.fontWeight = '600';
    }
  }

  function handleSlotTap(slot) {
    if (!selectedCompany) {
      // If no card selected, check if slot has a company and allow "picking it up"
      if (slot.dataset.filled) {
        const companyId = slot.dataset.filled;
        // Remove from slot
        slot.dataset.filled = '';
        slot.querySelector('.rank-content').textContent = 'Tap to place a company here';

        // Sync rankingFilled counter in App
        if (typeof App !== 'undefined' && App.state) {
          App.state.rankingFilled = Math.max(0, App.state.rankingFilled - 1);
          // Hide rank feedback if no longer all filled
          const fb = document.getElementById('rankFeedback');
          if (fb) fb.style.display = 'none';
        }

        // Re-show original card
        const card = document.querySelector(`.company-card[data-company="${companyId}"]`);
        if (card) card.style.opacity = '1';

        // Select it
        selectedCompany = companyId;
        if (card) card.classList.add('tap-selected');
      }
      return;
    }

    // Place the selected company in this slot
    if (typeof App !== 'undefined' && App.placeCompanyInSlot) {
      App.placeCompanyInSlot(selectedCompany, slot);
    }
    deselectCard();
    resetHint();
  }

  function deselectCard() {
    if (selectedCompany) {
      const card = document.querySelector(`.company-card[data-company="${selectedCompany}"]`);
      if (card) card.classList.remove('tap-selected');
      selectedCompany = null;
      resetHint();
    }
  }

  function resetHint() {
    const hint = document.getElementById('rankTouchHint');
    if (hint) {
      hint.textContent = '👆 Tap a company card to pick it up, then tap a slot to place it';
      hint.style.background = '';
      hint.style.color = '';
      hint.style.fontWeight = '';
    }
  }

  /* ──────────── Enhanced Touch Targets ──────────── */
  function enhanceTouchTargets() {
    // Make trade buttons larger on touch
    const style = document.createElement('style');
    style.textContent = `
      .touch-device .trade-btn {
        width: 48px;
        height: 48px;
        font-size: 1.3rem;
      }
      .touch-device .quiz-option {
        padding: 14px 18px;
        min-height: 48px;
      }
      .touch-device .nav-item {
        padding: 14px 16px;
      }
      .touch-device .btn-primary,
      .touch-device .btn-secondary {
        padding: 14px 24px;
        min-height: 48px;
      }
      .touch-device .sim-advance-btn {
        padding: 16px 32px;
        min-height: 52px;
      }
      .touch-device .dyk-card {
        padding: 16px 20px;
      }
      .touch-device .rank-slot {
        padding: 14px 16px;
        min-height: 56px;
        cursor: pointer;
      }
      .touch-device .rank-slot:active {
        background: rgba(20,184,166,0.05);
      }
    `;
    document.head.appendChild(style);
  }

  /* ──────────── Public API ──────────── */
  return { init };
})();

// Boot after DOM ready
document.addEventListener('DOMContentLoaded', TouchFallback.init);
