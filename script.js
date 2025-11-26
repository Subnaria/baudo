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
      // Lance les animations différées pour les liens
      document.querySelectorAll('.fade-in-link').forEach(el => {
        el.style.animationPlayState = 'running';
      });
    }, 250); // <-- plus rapide qu'avant
  }, 400); // <-- plus rapide qu'avant

  hackerEffect();
  updateSubCount();
  animateAboutMessage();
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
  "%cAttention : Toute tentative d'attaque ou de vol de contenu sera ENREGISTRÉE DANS NOS LOGS!!!",
  "color: #00ccff; font-size: 1.2em;"
);
