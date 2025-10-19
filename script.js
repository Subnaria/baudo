// Animation d'arrivée originale et punchy
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('animating');
  const overlay = document.getElementById('intro-overlay');
  // Lance le flash (si overlay présent)
  if (overlay) {
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.classList.remove('animating');
        document.body.classList.add('ready');
        // Lance les animations différées pour les liens
        document.querySelectorAll('.fade-in-link').forEach(el => {
          el.style.animationPlayState = 'running';
        });
      }, 250);
    }, 400);
  } else {
    // Pas d'overlay -> passer directement à ready
    document.body.classList.remove('animating');
    document.body.classList.add('ready');
    document.querySelectorAll('.fade-in-link').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }

  // Thème: appliquer depuis URL/localStorage au chargement
  initThemeFromContext();

  hackerEffect();
  updateSubCount();
  if (typeof window.animateAboutMessage === 'function') {
    window.animateAboutMessage();
  }

  // Charger contenu JSON et injecter
  loadAndRenderContent();
});

// Effet "hacker" sur le pseudo BAUDO
const hackerTitle = document.getElementById('hacker-title');
const pseudo = "BAUDO";
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?<>-_";
let interval = null;

function hackerEffect() {
  const delayPerLetter = 180; // ms, vitesse d'apparition
  const glitchPerLetter = 10; // nombre de "glitch" par lettre
  const eraseDelay = 120;     // ms, vitesse d'effacement
  let i = 0;

  function writeNextLetter() {
    if (i < pseudo.length) {
      let glitchCount = 0;
      let letterIndex = i;
      let glitchInterval = setInterval(() => {
        if (glitchCount < glitchPerLetter) {
          // Affiche les lettres déjà validées + une lettre glitchée + espaces pour le reste
          let temp = [];
          for (let j = 0; j < pseudo.length; j++) {
            if (j < letterIndex) temp[j] = pseudo[j];
            else if (j === letterIndex) temp[j] = chars[Math.floor(Math.random() * chars.length)];
            else temp[j] = "\u00A0";
          }
          hackerTitle.textContent = temp.join("");
          glitchCount++;
        } else {
          // Fixe la bonne lettre et passe à la suivante
          let temp = [];
          for (let j = 0; j < pseudo.length; j++) {
            if (j <= letterIndex) temp[j] = pseudo[j];
            else temp[j] = "\u00A0";
          }
          hackerTitle.textContent = temp.join("");
          clearInterval(glitchInterval);
          i++;
          setTimeout(writeNextLetter, delayPerLetter);
        }
      }, Math.floor(delayPerLetter / glitchPerLetter));
    } else {
      // Pause, puis efface lettre par lettre
      setTimeout(() => {
        let eraseIndex = pseudo.length;
        let eraseInterval = setInterval(() => {
          eraseIndex--;
          let temp = [];
          for (let j = 0; j < pseudo.length; j++) {
            if (j < eraseIndex) temp[j] = pseudo[j];
            else temp[j] = "\u00A0";
          }
          hackerTitle.textContent = temp.join("");
          if (eraseIndex === 0) {
            clearInterval(eraseInterval);
            setTimeout(hackerEffect, 1200);
          }
        }, eraseDelay);
      }, 1200);
    }
  }

  writeNextLetter();
}

function updateSubCount() {
  fetch('/api/subscribers')
    .then(res => res.json())
    .then(data => {
      const subCount = document.getElementById('sub-count');
      if (subCount && typeof data.subscriberCount !== 'undefined') {
        subCount.textContent = "Abonnés : " + Number(data.subscriberCount).toLocaleString('fr-FR');
      } else {
        subCount.textContent = "Abonnés : (erreur API)";
      }
    })
    .catch(err => {
      document.getElementById('sub-count').textContent = "Abonnés : (erreur réseau)";
      console.error(err);
    });
}

updateSubCount();
setInterval(updateSubCount, 120000); // toutes les 2 minutes

document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".scroll-reveal").forEach(el => {
    observer.observe(el);
  });
});

// Anti-vol d'image : bloque le clic droit sur les images
document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

console.log(
  "%cAttention : Toute tentative d'attaque ou de vol de contenu sera ENREGISTRÉE DANS NOS LOGS!!!",
  "color: #00ccff; font-size: 1.2em;"
);

// =====================
// Gestion des thèmes
// =====================
const AVAILABLE_THEMES = ["pack", "halloween", "noel"];

function applyTheme(theme) {
  if (!AVAILABLE_THEMES.includes(theme)) theme = "pack";
  // Retire les classes existantes
  AVAILABLE_THEMES.forEach(t => document.body.classList.remove(`theme-${t}`));
  // Ajoute la classe du thème choisi
  document.body.classList.add(`theme-${theme}`);
  try { localStorage.setItem('theme', theme); } catch (_) {}
}

function initThemeFromContext() {
  const params = new URLSearchParams(window.location.search);
  const qp = params.get('theme');
  if (qp && AVAILABLE_THEMES.includes(qp)) {
    applyTheme(qp);
    return;
  }
  try {
    const saved = localStorage.getItem('theme');
    if (saved && AVAILABLE_THEMES.includes(saved)) {
      applyTheme(saved);
      return;
    }
  } catch (_) {}
  applyTheme('pack');
}

// Expose en global pour permettre window.setTheme('halloween'|'noel'|'pack')
window.setTheme = applyTheme;

// =====================
// Chargement de contenu JSON
// =====================
async function loadAndRenderContent() {
  try {
    const res = await fetch('content.json', { cache: 'no-store' });
    const data = await res.json();
    renderBrand(data.brand);
    renderList('#contact-list', data.contact);
    renderList('#social-list', data.social);
    renderList('#games-list', data.games);
    // Décorations saisonnières
    injectSeasonalDecor();
  } catch (e) {
    console.error('Erreur chargement contenu:', e);
  }
}

function renderBrand(brand) {
  if (!brand) return;
  const titleEl = document.getElementById('hacker-title');
  const subtitleEl = document.getElementById('subtitle');
  const bannerEl = document.getElementById('banner-img');
  const profileEl = document.getElementById('profile-img');
  const aboutEl = document.getElementById('about-content');

  if (titleEl && brand.title) titleEl.textContent = brand.title;
  if (subtitleEl && brand.subtitle) subtitleEl.textContent = brand.subtitle;
  if (bannerEl && brand.banner) bannerEl.src = brand.banner;
  if (profileEl && brand.profile) profileEl.src = brand.profile;
  if (aboutEl && brand.about && Array.isArray(brand.about.paragraphs)) {
    aboutEl.innerHTML = brand.about.paragraphs.map(p => `<p style="margin-top:12px;">${p}</p>`).join('');
  }
}

function renderList(containerSelector, items) {
  const container = document.querySelector(containerSelector);
  if (!container || !Array.isArray(items)) return;
  container.innerHTML = items.map(item => `
    <a href="${item.url}" target="_blank" class="blueprint-card">
      <img src="${item.icon}" alt="${escapeHtml(item.label)} icon">
      <span>${escapeHtml(item.label)}</span>
    </a>
  `).join('');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Décorations saisonnières simples selon le thème
function injectSeasonalDecor() {
  const currentTheme = [...document.body.classList].find(c => c.startsWith('theme-')) || 'theme-pack';
  const header = document.querySelector('.blueprint-header');
  if (!header) return;

  // Nettoyer décorations précédentes
  header.querySelectorAll('.season-decor').forEach(n => n.remove());

  const decor = document.createElement('div');
  decor.className = 'season-decor';

  const icons = {
    pack: [],
    halloween: [
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1.2 0 2 .8 2 2 2.5.3 4.5 2.4 4.9 4.9 1.7.5 3.1 2 3.1 3.9 0 2.2-1.8 4-4 4h-1c-.5 2.3-2.5 4-4.9 4s-4.4-1.7-4.9-4H6c-2.2 0-4-1.8-4-4 0-1.9 1.4-3.4 3.1-3.9C5.5 6.4 7.5 4.3 10 4c0-1.2.8-2 2-2zM9 11h2v2H9v-2zm4 0h2v2h-2v-2z"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21l9-9 9 9M3 3l9 9 9-9" fill="none"/></svg>'
    ],
    noel: [
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.6L12 15l-4.9 2.3.9-5.6-4-3.9 5.5-.8L12 2z"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c4-3 6-6 6-9a6 6 0 10-12 0c0 3 2 6 6 9z"/></svg>'
    ]
  };

  const key = currentTheme.replace('theme-', '');
  decor.innerHTML = (icons[key] || []).join('');

  header.appendChild(decor);
}

// Réinjecter la déco quand on change de thème via window.setTheme
const prevSetTheme = window.setTheme;
window.setTheme = function(t) {
  prevSetTheme(t);
  injectSeasonalDecor();
};
