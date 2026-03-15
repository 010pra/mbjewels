/* ============================================================
   MB JEWELS — app.js (Firebase Integration)
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdb93Xt_iML-n5OsUrQOSxrz2ClkMIewM",
  authDomain: "mbjewels-e2502.firebaseapp.com",
  projectId: "mbjewels-e2502",
  storageBucket: "mbjewels-e2502.firebasestorage.app",
  messagingSenderId: "313753132085",
  appId: "1:313753132085:web:9e39d510b33e647039257c",
  measurementId: "G-9D1JMQV9JD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---- Globals for UI ----
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

// ---- Render Firebase Products ----
async function loadProducts() {
  const productsGrid = document.getElementById("products-grid");
  if (!productsGrid) return;

  try {
    const q = query(collection(db, "products"), where("visible", "==", true), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    // Clear loading state
    productsGrid.innerHTML = "";

    if (querySnapshot.empty) {
      productsGrid.innerHTML = `
        <div class="empty-state">
          <p>Our collection is being curated.</p>
          <small>Check back soon for new arrivals!</small>
        </div>
      `;
      return;
    }

    let html = "";
    querySnapshot.forEach((docSnap) => {
      const p = docSnap.data();
      const id = docSnap.id;

      // Constructing product message
      const msg = `Hello MB Jewels, I am interested in the *${p.name}* (₹${p.price}). Please share more details and photos.`;
      const link = `https://wa.me/919886350530?text=${encodeURIComponent(msg)}`;

      html += `
        <article class="product-card" data-category="${p.category}" role="listitem">
            <div class="product-image-wrap">
                <img src="${p.imageUrl}" alt="${p.name}" class="product-image" loading="lazy" decoding="async" />
                <div class="product-overlay">
                    <button class="product-quick" onclick="window.openProductWa('${encodeURIComponent(p.name)}', '${p.price}')">
                        Quick View
                    </button>
                </div>
            </div>
            <div class="product-info">
                <p class="product-category">${p.category}</p>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc">${p.description}</p>
                <div class="product-meta">
                    <span class="product-price">₹${p.price}</span>
                    <span class="product-material">Temple Style</span>
                </div>
                <a href="${link}" class="btn-wa" target="_blank" rel="noopener">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12.004 2C6.477 2 2 6.477 2 12.004c0 1.99.583 3.842 1.59 5.396L2 22l4.722-1.568A9.963 9.963 0 0012.004 22C17.53 22 22 17.523 22 12.004 22 6.477 17.53 2 12.004 2zm0 18.135a8.17 8.17 0 01-4.168-1.143l-.299-.177-3.1 1.024 1.035-3.01-.194-.308a8.129 8.129 0 01-1.278-4.52c0-4.514 3.672-8.186 8.186-8.186 4.514 0 8.186 3.672 8.186 8.186-.001 4.514-3.673 8.134-8.168 8.134z"/>
                    </svg>
                    Order on WhatsApp
                </a>
            </div>
        </article>
      `;
    });
    productsGrid.innerHTML = html;

    // Re-bind observers on dynamic cards
    document.querySelectorAll('.product-card').forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  } catch (err) {
    console.warn("Could not load products:", err);
    productsGrid.innerHTML = `
      <div class="empty-state">
        <p>Failed to load collection.</p>
        <small>Please refresh the page or try again later.</small>
      </div>
    `;
  }
}
loadProducts();

// ---- Nav scroll effect ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ---- Scroll Reveal initial setup for static elements ----
const staticRevealEls = document.querySelectorAll(
  '.why-card, .bridal-banner-content, .section-header'
);
staticRevealEls.forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ---- Category pill filter ----
const bindFilters = () => {
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
};
bindFilters();

// ---- Quick view (Dynamic support bound to window) ----
window.openProductWa = function (nameEncoded, price) {
  const name = decodeURIComponent(nameEncoded);
  const msg = `Hello MB Jewels, I am interested in the *${name}* (₹${price}). Please share more details and photos.`;
  window.open(`https://wa.me/919886350530?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
};

// ---- Smooth-scroll anchors ----
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const selector = anchor.getAttribute('href');
    if (selector && selector !== '#') {
      const target = document.querySelector(selector);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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

console.log('%c✦ MB Jewels — Phase 2 Loaded (Firebase Dynamic)', 'color:#C8922A; font-weight:700; font-size:14px;');
