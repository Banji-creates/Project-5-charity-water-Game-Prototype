// Game state variables
let gameRunning = false;
let dropMaker;
let canMaker;
let gameTimer;
let remainingTime = 30;
let score = 0;
let winningScore = 100;
let currentDifficulty = "normal";
let audioContext = null;
let reachedMilestones = [];

const difficultySettings = {
  easy: {
    label: "Easy",
    time: 45,
    winningScore: 70,
    dropInterval: 1100,
    canInterval: 3200,
    badDropChance: 0.12,
    goodDropPoints: 8,
    badDropPenalty: -4,
    canPoints: 12,
    bonusCanPoints: 22
  },
  normal: {
    label: "Normal",
    time: 30,
    winningScore: 100,
    dropInterval: 900,
    canInterval: 2500,
    badDropChance: 0.2,
    goodDropPoints: 10,
    badDropPenalty: -5,
    canPoints: 15,
    bonusCanPoints: 25
  },
  hard: {
    label: "Hard",
    time: 20,
    winningScore: 140,
    dropInterval: 700,
    canInterval: 1800,
    badDropChance: 0.28,
    goodDropPoints: 12,
    badDropPenalty: -7,
    canPoints: 18,
    bonusCanPoints: 28
  }
};

const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const startButton = document.getElementById("start-btn");
const resetButton = document.getElementById("reset-btn");
const statusDisplay = document.getElementById("game-status");
const difficultySelect = document.getElementById("difficulty-select");

startButton.addEventListener("click", () => {
  playSound("button");
  startGame();
});
resetButton.addEventListener("click", () => {
  playSound("button");
  resetGameState();
});
difficultySelect.addEventListener("change", () => {
  playSound("button");
  handleDifficultyChange();
});

function getCurrentDifficultySettings() {
  return difficultySettings[currentDifficulty] || difficultySettings.normal;
}

function handleDifficultyChange() {
  currentDifficulty = difficultySelect.value;
  const settings = getCurrentDifficultySettings();
  updateStatus(`${settings.label} mode selected. Aim for ${settings.winningScore} points in ${settings.time} seconds.`);

  if (!gameRunning) {
    resetGame();
  }
}

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  resetGame();
  const settings = getCurrentDifficultySettings();
  dropMaker = setInterval(createDrop, settings.dropInterval);
  canMaker = setInterval(createCan, settings.canInterval);
  gameTimer = setInterval(updateTimer, 1000);
  startButton.textContent = "Game Running...";
  startButton.disabled = true;
  updateStatus(`Difficulty: ${settings.label}. Collect the blue drops and cans while avoiding the red ones!`);
}

function resetGame() {
  const settings = getCurrentDifficultySettings();
  score = 0;
  remainingTime = settings.time;
  winningScore = settings.winningScore;
  reachedMilestones = [];
  scoreDisplay.textContent = score;
  timeDisplay.textContent = remainingTime;
  clearGameObjects();
  updateStatus(`Press start to begin ${settings.label.toLowerCase()} mode. Goal: ${winningScore} points in ${settings.time} seconds.`);
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
  const settings = getCurrentDifficultySettings();
  if (didWin) {
    playSound("win");
    showConfetti();
    updateStatus(`You win in ${settings.label.toLowerCase()} mode! Final score: ${score}`);
  } else {
    updateStatus(`Time's up in ${settings.label.toLowerCase()} mode! Final score: ${score}`);
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

function updateStatus(message) {
  if (statusDisplay) {
    statusDisplay.textContent = message;
  }
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
  const colors = ["#ff3cac", "#ffb347", "#6ee7b7", "#9b5ded", "#f97316", "#2e9df7"];

  for (let i = 0; i < 70; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.width = `${Math.random() * 8 + 6}px`;
    piece.style.height = `${Math.random() * 14 + 6}px`;
    piece.style.opacity = `${Math.random() * 0.6 + 0.4}`;
    piece.style.animationDuration = `${Math.random() * 1.3 + 1.2}s`;
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
  const settings = getCurrentDifficultySettings();
  const drop = document.createElement("div");
  const isBad = Math.random() < settings.badDropChance;
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
  createInteractionEffect(drop, isBad ? "penalty" : "success");

  const settings = getCurrentDifficultySettings();
  const points = isBad ? settings.badDropPenalty : settings.goodDropPoints;
  if (isBad) {
    playSound("miss");
  } else {
    playSound("collect");
  }
  score = Math.max(0, score + points);
  scoreDisplay.textContent = score;
  flashScore(points);
  showFloatingText(drop, `${points > 0 ? "+" : ""}${points}`);
  checkMilestones();
  updateStatus(isBad ? `That red drop cost you ${Math.abs(points)} points. Stay focused!` : `Nice catch! The good drops add ${settings.goodDropPoints} points.`);

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
  createInteractionEffect(can, isBonus ? "bonus" : "success");

  const settings = getCurrentDifficultySettings();
  const points = isBonus ? settings.bonusCanPoints : settings.canPoints;
  playSound("collect");
  score += points;
  scoreDisplay.textContent = score;
  flashScore(points);
  showFloatingText(can, `+${points}`);
  checkMilestones();
  updateStatus(isBonus ? "Bonus can collected! That was a big score boost." : "Great catch! The can adds points.");

  setTimeout(() => {
    if (can.parentNode) {
      can.parentNode.removeChild(can);
    }
  }, 120);
}

function ensureAudioContext() {
  if (!window.AudioContext && !window.webkitAudioContext) {
    return null;
  }

  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playSound(type) {
  const context = ensureAudioContext();
  if (!context) return;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  if (type === "collect") {
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(660, now);
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  } else if (type === "miss") {
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(220, now);
    oscillator.frequency.exponentialRampToValueAtTime(140, now + 0.16);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  } else if (type === "button") {
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(720, now);
    oscillator.frequency.exponentialRampToValueAtTime(540, now + 0.06);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
  } else if (type === "win") {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(523.25, now);
    oscillator.frequency.setValueAtTime(659.25, now + 0.1);
    oscillator.frequency.setValueAtTime(783.99, now + 0.2);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  }

  oscillator.start(now);
  oscillator.stop(now + 0.35);
}

function checkMilestones() {
  const milestoneMessages = [
    { threshold: Math.floor(winningScore / 2), message: "Halfway there!" },
    { threshold: Math.floor(winningScore * 0.75), message: "You’re close to the goal!" },
    { threshold: winningScore, message: "Goal reached!" }
  ];

  milestoneMessages.forEach((milestone) => {
    if (score >= milestone.threshold && !reachedMilestones.includes(milestone.threshold)) {
      reachedMilestones.push(milestone.threshold);
      updateStatus(milestone.message);
      showFloatingText(scoreDisplay, milestone.message);
    }
  });
}

function flashScore(points) {
  scoreDisplay.classList.remove("flash-positive", "flash-negative");
  void scoreDisplay.offsetWidth;
  scoreDisplay.classList.add(points >= 0 ? "flash-positive" : "flash-negative");
  setTimeout(() => {
    scoreDisplay.classList.remove("flash-positive", "flash-negative");
  }, 350);
}

function createInteractionEffect(element, type) {
  const effect = document.createElement("div");
  effect.className = `interaction-effect ${type}`;

  const containerRect = gameContainer.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  effect.style.left = `${elementRect.left - containerRect.left + elementRect.width / 2}px`;
  effect.style.top = `${elementRect.top - containerRect.top + elementRect.height / 2}px`;

  effect.textContent = type === "bonus" ? "★" : type === "penalty" ? "!" : "+";
  gameContainer.appendChild(effect);

  requestAnimationFrame(() => {
    effect.classList.add("active");
  });

  effect.addEventListener("animationend", () => {
    if (effect.parentNode) {
      effect.parentNode.removeChild(effect);
    }
  });
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
