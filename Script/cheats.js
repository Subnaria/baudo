// ================================
//   CHEAT CODE MANAGER - Baudo
// ================================

const cheatInput = document.getElementById("cheatInput");

cheatInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const code = this.value.toLowerCase().trim();
    activateCheat(code);
    this.value = ""; // reset input
  }
});

// =======================================
//             MINI PAC-MAN
// =======================================

let pacmanX = 40, pacmanY = 40;
let pacmanDir = "right";
let pacSpeed = 4;
let pacInterval;
let pacmanMusic = null;
let score = 0;

// Image Pac-Man personnalisée
let pacmanImg = new Image();
pacmanImg.src = "img/pacman.png"; // mets ton image ici
let pacmanLoaded = false;
pacmanImg.onload = () => { pacmanLoaded = true; };
pacmanImg.onerror = () => { 
    pacmanLoaded = false; 
    console.error("Erreur : Impossible de charger l'image Pac-Man !");
};

// Grille
const canvasSize = 480;
const tileSize = 24;
const rows = canvasSize / tileSize;
const cols = canvasSize / tileSize;
let map = Array.from({length: rows}, () => Array(cols).fill(0));

// Ajout des murs
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (r === 0 || r === rows-1 || c === 0 || c === cols-1) map[r][c] = 1;
    if ((r % 4 === 0 && c % 4 !== 0)) map[r][c] = 1;
  }
}

// Pellets
let pellets = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if(map[r][c] === 0){
      pellets.push({ x: c*tileSize + tileSize/2, y: r*tileSize + tileSize/2, eaten: false });
    }
  }
}

// Fantômes
let ghosts = [
  {x: 12*tileSize, y: 12*tileSize, dir: "left", color:"#FF0000"},
  {x: 10*tileSize, y: 8*tileSize, dir: "up", color:"#00FFFF"}
];

// ----------------------------------------
// START PAC-MAN MODE
// ----------------------------------------
function startPacmanMode() {
  if (!pacmanMusic) {
    pacmanMusic = new Audio("song/Pacman-song.mp3"); 
    pacmanMusic.loop = true;
  }
  pacmanMusic.play();

  if (!document.getElementById("pacmanOverlay")) {
    const overlay = document.createElement("div");
    overlay.id = "pacmanOverlay";
    overlay.style = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
    `;

    overlay.innerHTML = `
      <canvas id="pacmanCanvas" width="480" height="480" style="
        background: #000;
        border: 4px solid #FFD700;
        border-radius: 12px;
      "></canvas>

      <button id="closePacman" style="
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 10px 16px;
        border-radius: 10px;
        border: none;
        background: #ff4d4d;
        color: white;
        font-size: 16px;
        cursor: pointer;
      ">Quitter</button>
    `;

    document.body.appendChild(overlay);

    document.getElementById("closePacman").onclick = () => {
      pacmanMusic.pause();
      overlay.remove();
      stopPacmanGame();
    };

    launchPacmanGame();
  }
}

// ----------------------------------------
// LAUNCH GAME LOOP
// ----------------------------------------
function launchPacmanGame() {
  const canvas = document.getElementById("pacmanCanvas");
  const ctx = canvas.getContext("2d");

  document.addEventListener("keydown", handlePacmanKey);

  pacInterval = setInterval(() => {
    // Fond
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // Dessiner murs
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (map[r][c] === 1) {
          ctx.fillStyle = "#FFD700";
          ctx.fillRect(c*tileSize, r*tileSize, tileSize, tileSize);
        }
      }
    }

    // Déplacement Pac-Man
    let nextX = pacmanX;
    let nextY = pacmanY;
    switch(pacmanDir){
      case "right": nextX += pacSpeed; break;
      case "left": nextX -= pacSpeed; break;
      case "up": nextY -= pacSpeed; break;
      case "down": nextY += pacSpeed; break;
    }
    if(!checkCollision(nextX, nextY)) {
      pacmanX = nextX;
      pacmanY = nextY;
    }

    // Dessiner Pac-Man (image ou fallback)
    if(pacmanLoaded){
        ctx.save();
        ctx.translate(pacmanX, pacmanY);
        switch(pacmanDir){
          case "right": ctx.rotate(0); break;
          case "left": ctx.rotate(Math.PI); break;
          case "up": ctx.rotate(-Math.PI/2); break;
          case "down": ctx.rotate(Math.PI/2); break;
        }
        ctx.drawImage(pacmanImg, -20, -20, 40, 40);
        ctx.restore();
    } else {
        ctx.fillStyle="#FFD700";
        ctx.beginPath();
        ctx.arc(pacmanX, pacmanY, 20, 0, Math.PI*2);
        ctx.fill();
    }

    // Dessiner pellets
    pellets.forEach(p => {
      if(!p.eaten){
        ctx.fillStyle="#FFFFFF";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI*2);
        ctx.fill();

        // Collision Pac-Man / pellet
        if(Math.abs(pacmanX - p.x) < 16 && Math.abs(pacmanY - p.y) < 16){
          p.eaten = true;
          score += 10;
        }
      }
    });

    // Fantômes
    ghosts.forEach(ghost => {
      moveGhost(ghost);
      ctx.fillStyle = ghost.color;
      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, 20, 0, Math.PI*2);
      ctx.fill();

      // Collision Pac-Man / fantôme
      if(Math.abs(pacmanX - ghost.x) < 24 && Math.abs(pacmanY - ghost.y) < 24){
        pacmanMusic.pause();
        alert("💀 Pac-Man a été attrapé !");
        stopPacmanGame();
        document.getElementById("pacmanOverlay")?.remove();
      }
    });

    // Score
    ctx.fillStyle="white";
    ctx.font="18px Rubik, sans-serif";
    ctx.fillText("Score: " + score, 10, 20);

  }, 30);
}

// ----------------------------------------
// FONCTIONS UTILES
// ----------------------------------------
function handlePacmanKey(e){
  switch(e.key){
    case "ArrowRight": pacmanDir="right"; break;
    case "ArrowLeft": pacmanDir="left"; break;
    case "ArrowUp": pacmanDir="up"; break;
    case "ArrowDown": pacmanDir="down"; break;
  }
}

function checkCollision(x,y){
  const row = Math.floor(y/tileSize);
  const col = Math.floor(x/tileSize);
  return map[row] && map[row][col] === 1;
}

function moveGhost(ghost){
  if(Math.random() < 0.02){
    const dirs = ["left","right","up","down"];
    ghost.dir = dirs[Math.floor(Math.random()*dirs.length)];
  }

  let nextX = ghost.x;
  let nextY = ghost.y;

  switch(ghost.dir){
    case "right": nextX += 2; break;
    case "left": nextX -= 2; break;
    case "up": nextY -= 2; break;
    case "down": nextY += 2; break;
  }

  if(!checkCollision(nextX,nextY)){
    ghost.x = nextX;
    ghost.y = nextY;
  } else {
    ghost.dir = ["left","right","up","down"][Math.floor(Math.random()*4)];
  }
}

function stopPacmanGame(){
  clearInterval(pacInterval);
  document.removeEventListener("keydown", handlePacmanKey);
  pacmanX = 40; pacmanY = 40; pacmanDir = "right";
  score = 0;
  ghosts.forEach(g => { g.x = 12*tileSize; g.y = 12*tileSize; g.dir="left"; });
}
// ----------------------------------------
// ACTIVATE CHEAT CODE
// ----------------------------------------
function activateCheat(code) {
  switch (code) {
    case "pacman":
      alert("🟡 Mode Pacman activé !");
      startPacmanMode();

      break;
    case "glow":
      document.body.style.filter = "drop-shadow(0 0 20px #ffa73d)";
      alert("✨ Mode Glow activé !");
      break;

    case "invert":
      document.body.style.filter = "invert(1)";
      alert("🌀 Mode Couleurs Inversées !");
      break;

    case "party":
      document.body.style.animation = "party 0.2s infinite";
      alert("🎉 Mode Party !");
      break;

    case "reset":
      document.body.style.filter = "none";
      document.body.style.animation = "none";
      alert("🔄 Effets réinitialisés !");
      break;

    default:
      alert("❌ bizzz invalide !");
  }
}

// Animation pour le cheat "party"
const style = document.createElement("style");
style.innerHTML = `
@keyframes party {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
`;
document.head.appendChild(style);
