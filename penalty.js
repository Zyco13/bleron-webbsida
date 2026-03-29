const canvas = document.getElementById("penaltyCanvas");
const ctx = canvas.getContext("2d");

// ---- VARIABLER ----
const goalWidth = 450;
const goalHeight = 230;
const goalX = canvas.width / 2 - goalWidth / 2;
const goalY = 50;

let goals = 0; // Antal mål
let shots = 0; // Antal skott

let keeperCurrentX = canvas.width / 2;
const keeperY = goalY + goalHeight - 60;
let keeperAngle = 0;    // Keeperns rotation — 0 = upprätt
let keeperDiveX = 0;    // Hur långt keepern har dykt i x
let keeperDiveY = 0;    // Hur långt keepern har dykt i y

const playerX = 330;
const playerY = 450;

let ballX = canvas.width / 2;
let ballY = 420;
let ballSpeedX = 0;
let ballSpeedY = 0;
let shooting = false;
let currentTarget = null;

let message = ''; // Meddelandet som visas efter varje skott

const targets = {
  topLeft: { x: goalX + 40, y: goalY + 30 },
  topRight: { x: goalX + goalWidth - 40, y: goalY + 30 },
  bottomLeft: { x: goalX + 40, y: goalY + goalHeight - 30 },
  bottomRight: { x: goalX + goalWidth - 40, y: goalY + goalHeight - 30 },
  center: { x: goalX + goalWidth / 2, y: goalY + goalHeight / 2 },
};

const zones = [
  {
    name: "center",
    x: goalX + goalWidth / 4,
    y: goalY + goalHeight / 4,
    w: goalWidth / 2,
    h: goalHeight / 2,
  },
  { name: "topLeft", x: goalX, y: goalY, w: goalWidth / 2, h: goalHeight / 2 },
  {
    name: "topRight",
    x: goalX + goalWidth / 2,
    y: goalY,
    w: goalWidth / 2,
    h: goalHeight / 2,
  },
  {
    name: "bottomLeft",
    x: goalX,
    y: goalY + goalHeight / 2,
    w: goalWidth / 2,
    h: goalHeight / 2,
  },
  {
    name: "bottomRight",
    x: goalX + goalWidth / 2,
    y: goalY + goalHeight / 2,
    w: goalWidth / 2,
    h: goalHeight / 2,
  },
];

// ---- DRAW-FUNKTIONEN ----
// Ritar om ALLT varje gång den körs
function draw() {
  // Gräsplan
  ctx.fillStyle = "#2d8a2d";
  ctx.fillRect(0, 0, 800, 500);

  // Straffområde
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.strokeRect(canvas.width / 2 - 225, goalY + goalHeight, 450, 180);

  // Målområde
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width / 2 - 125, goalY + goalHeight, 250, 80);

  // Mål — bakgrund
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(goalX, goalY, goalWidth, goalHeight);

  // Målram
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.strokeRect(goalX, goalY, goalWidth, goalHeight);

  // Målnät — vertikala linjer
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1;
  for (let x = goalX; x < goalX + goalWidth; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, goalY);
    ctx.lineTo(x, goalY + goalHeight);
    ctx.stroke();
  }

  // Målnät — horisontella linjer
  for (let y = goalY; y < goalY + goalHeight; y += 30) {
    ctx.beginPath();
    ctx.moveTo(goalX, y);
    ctx.lineTo(goalX + goalWidth, y);
    ctx.stroke();
  }

  // Spara canvas-läget, rotera runt keepern, rita, återställ
ctx.save();
ctx.translate(keeperCurrentX, keeperY);
ctx.rotate(keeperAngle);
ctx.translate(-keeperCurrentX, -keeperY);

  // Målvakt — huvud
  ctx.fillStyle = "#f5c5a3";
  ctx.beginPath();
  ctx.arc(keeperCurrentX, keeperY - 25, 15, 0, Math.PI * 2);
  ctx.fill();

  // Målvakt — kropp och armar
  ctx.fillStyle = "#ffdd00";
  ctx.fillRect(keeperCurrentX - 15, keeperY - 10, 30, 35);
  ctx.fillRect(keeperCurrentX - 30, keeperY - 10, 16, 10);
  ctx.fillRect(keeperCurrentX + 14, keeperY - 10, 16, 10);

  // Målvakt — ben och skor
  // Huvud — större radie (var 15, nu 20)
  ctx.arc(keeperCurrentX, keeperY - 30, 20, 0, Math.PI * 2);

  // Kropp — bredare och längre (var 30x35, nu 40x45)
  ctx.fillRect(keeperCurrentX - 20, keeperY - 10, 40, 45);

  // Vänster arm — längre (var 16, nu 22)
  ctx.fillRect(keeperCurrentX - 42, keeperY - 10, 22, 12);

  // Höger arm — längre
  ctx.fillRect(keeperCurrentX + 20, keeperY - 10, 22, 12);

  // Handskar — gröna cirklar på slutet av armarna
ctx.fillStyle = '#00aa00';
ctx.beginPath();
ctx.arc(keeperCurrentX - 42, keeperY - 5, 10, 0, Math.PI * 2); // Vänster handske
ctx.fill();
ctx.beginPath();
ctx.arc(keeperCurrentX + 42, keeperY - 5, 10, 0, Math.PI * 2); // Höger handske
ctx.fill();

  // Ben — bredare
  ctx.fillRect(keeperCurrentX - 18, keeperY + 35, 14, 25);
  ctx.fillRect(keeperCurrentX + 4, keeperY + 35, 14, 25);

  // Skor
  ctx.fillRect(keeperCurrentX - 20, keeperY + 58, 16, 8);
  ctx.fillRect(keeperCurrentX + 4, keeperY + 58, 16, 8);

  ctx.restore(); // Återställ canvas-rotationen
  // Spelare — huvud


  ctx.fillStyle = "#f5c5a3";
  ctx.beginPath();
  ctx.arc(playerX, playerY - 60, 20, 0, Math.PI * 2);
  ctx.fill();

  // Spelare — tröja
  ctx.fillStyle = "#1a1aff";
  ctx.fillRect(playerX - 20, playerY - 40, 40, 45);
  ctx.fillStyle = "white";
  ctx.font = "7px Press Start 2P";
  ctx.textAlign = "center";
  ctx.fillText("BLERON", playerX, playerY - 20);
  ctx.font = "8px Press Start 2P";
  ctx.fillText("10", playerX, playerY - 8);

  // Spelare — ben och skor
  ctx.fillStyle = "#1a1aff";
  ctx.fillRect(playerX - 18, playerY + 5, 14, 30);
  ctx.fillRect(playerX + 4, playerY + 5, 14, 30);
  ctx.fillStyle = "#111";
  ctx.fillRect(playerX - 20, playerY + 33, 16, 8);
  ctx.fillRect(playerX + 4, playerY + 33, 16, 8);

  // Boll
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ballX, ballY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(ballX, ballY, 12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'white';
    ctx.font = '14px Press Start 2P';
    ctx.textAlign = 'left';
    ctx.fillText('MÅL: ' + goals + ' / ' + shots, 20, 40);

    // Visar MÅL eller RÄDDAD i mitten av canvasen
if (message !== '') {
    ctx.fillStyle = 'white'; // Alltid vit
ctx.font = '20px Press Start 2P'; // Lite mindre
ctx.textAlign = 'center';
ctx.fillText(message, canvas.width / 2, goalY - 20); // Ovanför målet
}
}

// ---- KLICK-LOGIK ----
canvas.addEventListener("click", function (event) {
  // Om bollen redan är på väg, gör ingenting
  if (shooting) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    if (
      clickX > zone.x &&
      clickX < zone.x + zone.w &&
      clickY > zone.y &&
      clickY < zone.y + zone.h
    ) {
      // Hämtar målpositionen för den klickade zonen
      const target = targets[zone.name];

      // Räknar ut hur snabbt bollen ska röra sig i x och y
      // Delat på 20 = bollen tar 20 steg för att nå målet
      ballSpeedX = (target.x - ballX) / 20;
      ballSpeedY = (target.y - ballY) / 20;

      shooting = true; // Sparket är igång!
    const random = Math.random();
if (random < 0.33) {
    keeperCurrentX = goalX + 80;             // Dyker vänster
    keeperAngle = -0.8;                        // Lutar åt vänster
} else if (random < 0.66) {
    keeperCurrentX = goalX + goalWidth - 80; // Dyker höger
    keeperAngle = 0.8;                       // Lutar åt höger
} else {
    keeperCurrentX = canvas.width / 2;       // Stannar i mitten
    keeperAngle = 0;                          // Upprätt
}
      currentTarget = zone.name;
      break;
    }
  }
});

// ---- ANIMATIONS-LOOP ----
// requestAnimationFrame kör draw() ~60 gånger per sekund
function gameLoop() {
  // Om bollen är på väg — flytta den
  if (shooting) {
    ballX += ballSpeedX; // Flytta bollen i x-riktning
    ballY += ballSpeedY; // Flytta bollen i y-riktning

    // Kolla om bollen nått målet (inom 10 pixlar)
    // Kolla om bollen nått sin målposition (kollar BÅDE x och y)
    const target = targets[currentTarget];
    if (
      target &&
      Math.abs(ballX - target.x) < 10 &&
      Math.abs(ballY - target.y) < 10
    ) {
      shooting = false;
      shots++;

        if (Math.abs(keeperCurrentX - target.x) > 80) {
        goals++; // Mål!
        console.log('MÅL! ' + goals + ' / ' + shots);
    } else {
        console.log('RÄDDAD! ' + goals + ' / ' + shots);
    }

    if (Math.abs(keeperCurrentX - target.x) > 80) {
    goals++;
    message = 'MÅL!'; // ← lägg till
} else {
    message = 'RÄDDAD!'; // ← lägg till
}

      setTimeout(function () {
        ballX = canvas.width / 2;
        ballY = 420;
        keeperCurrentX = canvas.width / 2;
        keeperAngle = 0; // Keepern rätar upp sig igen
        currentTarget = null;
        message = ''; // ← Rensa meddelandet
      }, 1000);
    }
  }

  draw();
  requestAnimationFrame(gameLoop); // Kör igen nästa bildruta
}

// Starta loopen
gameLoop();
