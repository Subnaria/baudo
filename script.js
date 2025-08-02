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

// Animation du message à propos
const aboutMsg = document.getElementById('about-message');
const baseMsg = "à méditer";
const altMsg = "Dax a infecté le site de Baudo ! attention à toi !";
const charsMsg = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?<>-_";
let aboutMsgInterval = null;

function hackerAboutMessage(targetMsg, callback) {
  let progress = 0;
  let display = Array(targetMsg.length).fill("");
  clearInterval(aboutMsgInterval);

  aboutMsgInterval = setInterval(() => {
    for (let i = 0; i < targetMsg.length; i++) {
      if (i < progress) {
        display[i] = targetMsg[i];
      } else {
        display[i] = charsMsg[Math.floor(Math.random() * charsMsg.length)];
      }
    }
    aboutMsg.textContent = display.join("");
    if (progress <= targetMsg.length) {
      progress++;
    } else {
      clearInterval(aboutMsgInterval);
      if (callback) setTimeout(callback, 1800);
    }
  }, 45);
}

function animateAboutMessage() {
  setTimeout(() => {
    hackerAboutMessage(altMsg, () => {
      setTimeout(() => {
        hackerAboutMessage(baseMsg, animateAboutMessage);
      }, 3000);
    });
  }, 3000);
}

// Fonction pour mettre à jour le compteur d'abonnés
function updateSubCount() {
  fetch('https://baudo-compt-abo.onrender.com/api/subscribers')
    .then(res => res.json())
    .then(data => {
      const subCount = document.getElementById('sub-count');
      if (subCount && data && data.subscriberCount) {
        subCount.textContent = "Abonnés : " + Number(data.subscriberCount).toLocaleString('fr-FR');
      } else {
        subCount.textContent = "Abonnés : (erreur API)";
        console.log('API data:', data);
      }
    })
    .catch(err => {
      const subCount = document.getElementById('sub-count');
      subCount.textContent = "Abonnés : (erreur réseau)";
      console.error('Erreur API:', err);
    });
}

updateSubCount();
setInterval(updateSubCount, 120000);

// Anti-vol d'image : bloque le clic droit sur les images
document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

console.log(
  "%cAttention : Toute tentative d'attaque ou de vol de contenu sera signalée.",
  "color: #00ccff; font-size: 1.2em;"
);
