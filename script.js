// Animation d'arrivée originale et punchy
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('animating');
  // Lance le flash (animation CSS via .animating)
  setTimeout(() => {
    document.getElementById('intro-overlay').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('intro-overlay').style.display = 'none';
      document.body.classList.remove('animating');
      document.body.classList.add('ready');
      // Lance les animations différées pour les liens avec un petit stagger
      document.querySelectorAll('.fade-in-link').forEach((el, i) => {
        el.style.setProperty('--delay', (i * 0.06) + 's');
        el.style.animationPlayState = 'running';
      });
      // Ajoute une animation subtile de flottement sur la photo de profil
      const profile = document.querySelector('.profile-pic');
      if (profile) profile.classList.add('animate-float');
    }, 350); // increased for better visibility
  }, 600); // increased for better flash visibility

  hackerEffect();
  if (typeof updateSubCount === 'function') updateSubCount();
  if (typeof animateAboutMessage === 'function') animateAboutMessage();
  initHeroParallax();
  initButtonFlashEffect();
});

// Create particle effect on button hover
function createParticles(btn) {
  const rect = btn.getBoundingClientRect();
  const colors = ['rgba(255,155,61,0.8)', 'rgba(47,180,255,0.8)', 'rgba(255,255,255,0.6)'];
  
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.pointerEvents = 'none';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.borderRadius = '50%';
    particle.style.left = (rect.left + rect.width / 2) + 'px';
    particle.style.top = (rect.top + rect.height / 2) + 'px';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.boxShadow = '0 0 10px currentColor';
    particle.style.zIndex = '9998';
    
    document.body.appendChild(particle);
    
    const angle = (Math.PI * 2 * i) / 5;
    const velocity = 2 + Math.random() * 2;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let x = rect.left + rect.width / 2;
    let y = rect.top + rect.height / 2;
    let opacity = 1;
    
    const animate = () => {
      x += vx;
      y += vy;
      opacity -= 0.02;
      
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };
    
    animate();
  }
}

// Button flash effect that follows cursor
function initButtonFlashEffect() {
  const btn = document.getElementById('subscribe-btn');
  if (!btn) return;

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create a pseudo-element flash at cursor position
    const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI);
    btn.style.setProperty('--flash-angle', angle + 'deg');
    btn.style.setProperty('--flash-x', x + 'px');
    btn.style.setProperty('--flash-y', y + 'px');
    
    // Add subtle scale pulse on movement
    btn.style.setProperty('--move-scale', '1.12');
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.setProperty('--flash-x', '50%');
    btn.style.setProperty('--flash-y', '50%');
    btn.style.setProperty('--move-scale', '1');
  });
  
  // Add particle effect on hover
  btn.addEventListener('mouseenter', () => {
    createParticles(btn);
  });
}

// Stub for updateSubCount if not defined elsewhere
if (typeof updateSubCount !== 'function') {
  function updateSubCount() {
    // Placeholder: real implementation may be added later
  }
}

// Stub for animateAboutMessage if not defined elsewhere
if (typeof animateAboutMessage !== 'function') {
  function animateAboutMessage() {
    // Placeholder: real implementation may be added later
  }
}

function initHeroParallax(){
  // Skip if reduced motion requested
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = document.querySelector('.hero');
  const bg = hero ? hero.querySelector('.hero-bg') : null;
  if (!hero || !bg) return;

  let rect = hero.getBoundingClientRect();
  let targetX = 0, targetY = 0, targetBlur = 0;
  let currentX = 0, currentY = 0, currentBlur = 0;
  const maxX = 18; // px
  const maxY = 12; // px
  const maxBlur = 5; // px
  const ease = 0.08; // smoothing
  let isHover = false;

  const updateRect = () => { rect = hero.getBoundingClientRect(); };
  window.addEventListener('resize', updateRect);

  const onMove = (e) => {
    isHover = true;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nx = (x / rect.width - 0.5) * 2; // -1 .. 1
    const ny = (y / rect.height - 0.5) * 2; // -1 .. 1
    targetX = nx * maxX * -1; // invert for parallax
    targetY = ny * maxY * -1;
    const dist = Math.min(1, Math.sqrt(nx*nx + ny*ny));
    targetBlur = Math.round(dist * maxBlur * 10) / 10; // one decimal
  };

  const onLeave = () => {
    isHover = false; targetX = 0; targetY = 0; targetBlur = 0;
  };

  hero.addEventListener('mousemove', onMove);
  hero.addEventListener('mouseleave', onLeave);
  hero.addEventListener('touchmove', onMove, { passive: true });
  hero.addEventListener('touchend', onLeave);

  function raf(){
    // lerp
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;
    currentBlur += (targetBlur - currentBlur) * ease;
    // apply
    bg.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1.06)`;
    bg.style.filter = `blur(${currentBlur}px) saturate(1.06)`;
    requestAnimationFrame(raf);
  }
  raf();
}

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
  "%c Oh il y a un curieux par ici👀...  ",
  "color: #97eaffff; font-size: 1.2em;"
);

console.log(
  "%c By csc.pacman 🚀  ",
  "color: #ff9b3dff; font-size: 1em;"
);
