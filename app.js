/* ============================================================
   SWARNA JEWELS — app.js
   ============================================================ */

'use strict';

// ---- Nav scroll effect ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ---- Scroll Reveal ----
const revealEls = document.querySelectorAll(
  '.product-card, .why-card, .bridal-banner-content, .section-header'
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ---- Category pill filter ----
const pills = document.querySelectorAll('.category-pill');
pills.forEach((pill) => {
  pill.addEventListener('click', (e) => {
    e.preventDefault();
    pills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');

    const filter = pill.dataset.filter;
    const cards = document.querySelectorAll('.product-card');

    cards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      if (matches) {
        card.style.opacity = '1';
        card.style.transform = '';
        card.style.display = '';
      } else {
        card.style.opacity = '0.25';
        card.style.transform = 'scale(0.97)';
      }
    });
  });
});

// ---- Quick view (placeholder — Phase 2 will have modal) ----
function openProduct(id) {
  const products = {
    1: {
      name: 'Lakshmi Gaja Necklace Set',
      msg: 'Hello MB Jewels, I am interested in the *Lakshmi Gaja Necklace Set*. Please share more details, photos, and current price.',
    },
    2: {
      name: 'Peacock Temple Jhumkas',
      msg: 'Hello MB Jewels, I am interested in the *Peacock Temple Jhumkas*. Please share more details, photos, and current price.',
    },
    3: {
      name: 'Nakshi Temple Bangle Set',
      msg: 'Hello MB Jewels, I am interested in the *Nakshi Temple Bangle Set*. Please share more details, photos, and current price.',
    },
    4: {
      name: 'Lakshmi Chandramauli Tikka',
      msg: 'Hello MB Jewels, I am interested in the *Lakshmi Chandramauli Tikka*. Please share more details, photos, and current price.',
    },
  };

  const p = products[id];
  if (p) {
    const encoded = encodeURIComponent(p.msg);
    window.open(`https://wa.me/919886350530?text=${encoded}`, '_blank', 'noopener,noreferrer');
  }
}

// Expose for inline onclick usage
window.openProduct = openProduct;

// ---- Smooth-scroll anchors ----
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Hero scroll indicator ----
const heroScrollCta = document.querySelector('.hero-scroll-cta');
if (heroScrollCta) {
  window.addEventListener('scroll', () => {
    heroScrollCta.style.opacity = window.scrollY > 80 ? '0' : '1';
  }, { passive: true });
}

// ---- Staggered reveal for why-cards ----
const whyCards = document.querySelectorAll('.why-card');
whyCards.forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

// ---- Marquee pause on hover ----
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

console.log('%c✦ MB Jewels — Phase 1 Loaded', 'color:#C8922A; font-weight:700; font-size:14px;');
