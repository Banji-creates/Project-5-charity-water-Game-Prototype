// Game state variables
let gameRunning = false;
let dropMaker;
let canMaker;
let gameTimer;
let remainingTime = 30;
let score = 0;
const winningScore = 100;

const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const startButton = document.getElementById("start-btn");
const resetButton = document.getElementById("reset-btn");

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGameState);

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  resetGame();
  dropMaker = setInterval(createDrop, 900);
  canMaker = setInterval(createCan, 2500);
  gameTimer = setInterval(updateTimer, 1000);
  startButton.textContent = "Game Running...";
  startButton.disabled = true;
}

function resetGame() {
  score = 0;
  remainingTime = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = remainingTime;
  clearGameObjects();
}

function clearGameObjects() {
  while (gameContainer.firstChild) {
    gameContainer.removeChild(gameContainer.firstChild);
  }
}

function updateTimer() {
  remainingTime -= 1;
  timeDisplay.textContent = remainingTime;
  if (remainingTime <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(canMaker);
  clearInterval(gameTimer);
  startButton.textContent = "Start Game";
  startButton.disabled = false;

  const didWin = score >= winningScore;
  if (didWin) {
    showConfetti();
  }
  showEndMessage(didWin);
}

function resetGameState() {
  clearInterval(dropMaker);
  clearInterval(canMaker);
  clearInterval(gameTimer);
  gameRunning = false;
  startButton.textContent = "Start Game";
  startButton.disabled = false;
  resetGame();
}

function showEndMessage(didWin) {
  const message = document.createElement("div");
  message.className = "game-message";
  message.textContent = didWin
    ? `You Win! Final score: ${score}`
    : `Time's up! Final score: ${score}`;
  gameContainer.appendChild(message);
  setTimeout(() => {
    if (message.parentNode) {
      message.parentNode.removeChild(message);
    }
  }, 3000);
}

function showConfetti() {
  const colors = ["#ff3cac", "#ffb347", "#6ee7b7", "#9b5ded", "#f97316"];

  for (let i = 0; i < 50; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.width = `${Math.random() * 8 + 6}px`;
    piece.style.height = `${Math.random() * 14 + 6}px`;
    piece.style.opacity = `${Math.random() * 0.6 + 0.4}`;
    piece.style.animationDuration = `${Math.random() * 1.5 + 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    gameContainer.appendChild(piece);

    piece.addEventListener("animationend", () => {
      if (piece.parentNode) {
        piece.parentNode.removeChild(piece);
      }
    });
  }
}

function createDrop() {
  const drop = document.createElement("div");
  const isBad = Math.random() < 0.2;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";

  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.7 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  drop.style.left = `${xPosition}px`;

  drop.style.animationDuration = `${3 + Math.random() * 2}s`;
  drop.addEventListener("click", () => collectDrop(drop, isBad));
  drop.addEventListener("animationend", () => drop.remove());
  gameContainer.appendChild(drop);
}

function collectDrop(drop, isBad) {
  if (!gameRunning || !gameContainer.contains(drop)) return;
  drop.classList.add("collected");

  const points = isBad ? -5 : 10;
  score = Math.max(0, score + points);
  scoreDisplay.textContent = score;
  flashScore(points);
  showFloatingText(drop, `${points > 0 ? "+" : ""}${points}`);

  setTimeout(() => {
    if (drop.parentNode) {
      drop.parentNode.removeChild(drop);
    }
  }, 120);
}

function createCan() {
  const can = document.createElement("div");
  const isBonus = Math.random() < 0.25;
  can.className = `collectible-can ${isBonus ? "bonus-can" : "good-can"}`;
  can.textContent = isBonus ? "⭐" : "CAN";

  const size = isBonus ? 60 : 50;
  can.style.width = `${size}px`;
  can.style.height = `${size}px`;

  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  can.style.left = `${xPosition}px`;

  can.style.animationDuration = `${4 + Math.random() * 2}s`;
  can.addEventListener("click", () => collectCan(can, isBonus));
  can.addEventListener("animationend", () => can.remove());
  gameContainer.appendChild(can);
}

function collectCan(can, isBonus) {
  if (!gameRunning || !gameContainer.contains(can)) return;
  can.classList.add("collected");

  const points = isBonus ? 25 : 15;
  score += points;
  scoreDisplay.textContent = score;
  flashScore(points);
  showFloatingText(can, `+${points}`);

  setTimeout(() => {
    if (can.parentNode) {
      can.parentNode.removeChild(can);
    }
  }, 120);
}

function flashScore(points) {
  scoreDisplay.classList.remove("flash-positive", "flash-negative");
  void scoreDisplay.offsetWidth;
  scoreDisplay.classList.add(points >= 0 ? "flash-positive" : "flash-negative");
  setTimeout(() => {
    scoreDisplay.classList.remove("flash-positive", "flash-negative");
  }, 350);
}

function showFloatingText(element, text) {
  const floatText = document.createElement("span");
  floatText.className = "floating-text";
  floatText.textContent = text;
  floatText.style.left = `${element.offsetLeft + element.offsetWidth / 2}px`;
  floatText.style.top = `${element.offsetTop}px`;
  gameContainer.appendChild(floatText);

  requestAnimationFrame(() => {
    floatText.style.transform = "translate(-50%, -40px)";
    floatText.style.opacity = "0";
  });

  setTimeout(() => {
    if (floatText.parentNode) {
      floatText.parentNode.removeChild(floatText);
    }
  }, 800);
}
