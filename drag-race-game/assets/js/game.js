// Game state
let gameState = {
  running: false,
  carType: 'muscle',
  playerGear: 0,
  cpuGear: 0,
  rpmValue: 0,
  playerSpeed: 0,
  cpuSpeed: 0,
  playerPosition: 0,
  cpuPosition: 0,
  startTime: null,
  gameInterval: null,
  score: 0,
  level: 1
};

// DOM Elements
const elements = {
  startScreen: document.getElementById('start-screen'),
  gameScreen: document.getElementById('game-screen'),
  endScreen: document.getElementById('end-screen'),
  playerCar: document.getElementById('player-car'),
  cpuCar: document.getElementById('cpu-car'),
  playerLabel: document.getElementById('player-label'),
  cpuLabel: document.getElementById('cpu-label'),
  rpmIndicator: document.getElementById('rpm-indicator'),
  shiftTarget: document.getElementById('shift-target'),
  gearDisplay: document.getElementById('gear-display'),
  speedDisplay: document.getElementById('speed-display'),
  levelDisplay: document.getElementById('level-display'),
  scoreDisplay: document.getElementById('score-display'),
  message: document.getElementById('message'),
  resultMessage: document.getElementById('result-message'),
  finalScore: document.getElementById('final-score'),
  track: document.getElementById('track')
};

// Add keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && gameState.running) {
    shiftGear();
  }
});

// Car selection
function selectCar(type) {
  gameState.carType = type;
  const options = document.getElementsByClassName('car-option');
  Array.from(options).forEach(option => option.classList.remove('selected'));
  
  const selectedOption = Array.from(options).find(option => 
    option.querySelector('h3').textContent.toLowerCase() === type.toUpperCase()
  );
  if (selectedOption) selectedOption.classList.add('selected');
  
  // Update car colors
  elements.playerCar.style.backgroundColor = GAME_CONFIG.carStats[type].color;
  
  // Update shift target
  elements.shiftTarget.style.height = GAME_CONFIG.carStats[type].shiftWindow + '%';
  const optimalPoint = GAME_CONFIG.optimalShiftPoint;
  const windowHeight = GAME_CONFIG.carStats[type].shiftWindow;
  elements.shiftTarget.style.top = (100 - optimalPoint - (windowHeight / 2)) + '%';
}

// Screen management
function showScreen(screenId) {
  ['start-screen', 'game-screen', 'end-screen'].forEach(id => {
    const screen = document.getElementById(id);
    if (screen) {
      screen.classList.toggle('active', id === screenId);
    }
  });
}

function showStartScreen() {
  showScreen('start-screen');
  resetGameState();
}

function resetGameState() {
  gameState = {
    ...gameState,
    running: false,
    playerGear: 0,
    cpuGear: 0,
    rpmValue: 0,
    playerSpeed: 0,
    cpuSpeed: 0,
    playerPosition: 0,
    cpuPosition: 0,
    score: 0,
    level: 1
  };
  
  updateDisplays();
}

// Game initialization
function startGame() {
  showScreen('game-screen');
  resetRaceState();
  startCountdown();
}

function resetRaceState() {
  // Reset positions
  elements.playerCar.style.left = '10px';
  elements.cpuCar.style.left = '10px';
  elements.playerLabel.style.left = '20px';
  elements.cpuLabel.style.left = '20px';
  
  // Reset displays
  elements.rpmIndicator.style.bottom = '0%';
  elements.gearDisplay.textContent = 'N';
  elements.speedDisplay.textContent = '0';
  elements.levelDisplay.textContent = gameState.level;
  
  // Update CPU car color based on level
  const cpuColors = ['#F44336', '#2196F3', '#FFC107'];
  elements.cpuCar.style.backgroundColor = cpuColors[gameState.level % 3];
}

function startCountdown() {
  const messages = ['Ready...', 'Set...', 'GO!'];
  let count = 0;
  
  const countdown = setInterval(() => {
    if (count < messages.length) {
      showMessage(messages[count], '#FFC107');
      count++;
    } else {
      clearInterval(countdown);
      startRace();
      setTimeout(() => showMessage(''), 1000);
    }
  }, 1000);
}

// Race management
function startRace() {
  gameState.running = true;
  gameState.startTime = Date.now();
  
  // CPU starts with a delay based on difficulty
  setTimeout(() => {
    if (gameState.running) gameState.cpuGear = 1;
  }, GAME_CONFIG.cpuDifficulty[gameState.level].reactionTime * 1000);
  
  // Start game loop
  gameState.gameInterval = setInterval(updateGame, GAME_CONFIG.updateInterval);
}

function updateGame() {
  if (!gameState.running) return;
  
  updatePlayerCar();
  updateCpuCar();
  
  // Check for finish
  if (gameState.playerPosition >= GAME_CONFIG.raceDistance || 
      gameState.cpuPosition >= GAME_CONFIG.raceDistance) {
    endRace();
  }
}

// Player car updates
function updatePlayerCar() {
  if (gameState.playerGear > 0) {
    updatePlayerRPM();
    updatePlayerSpeed();
    updatePlayerPosition();
    updateDisplays();
  }
}

function updatePlayerRPM() {
  const { acceleration, gearRatios, rpmRate } = GAME_CONFIG.carStats[gameState.carType];
  const gearRatio = gearRatios[gameState.playerGear];
  
  gameState.rpmValue += (acceleration / gearRatio) * rpmRate;
  if (gameState.rpmValue > GAME_CONFIG.maxRPM) {
    gameState.rpmValue = GAME_CONFIG.maxRPM;
  }
}

function updatePlayerSpeed() {
  const { topSpeed, gearRatios } = GAME_CONFIG.carStats[gameState.carType];
  const gearRatio = gearRatios[gameState.playerGear];
  
  gameState.playerSpeed = (gameState.rpmValue / GAME_CONFIG.maxRPM) * (topSpeed / gearRatio);
  gameState.playerSpeed *= (1 + (gameState.playerGear * 0.08));
  
  // Extra boost in first 3 levels
  if (gameState.level <= 3) {
    gameState.playerSpeed *= 1.2;
  }
}

function updatePlayerPosition() {
  gameState.playerPosition += gameState.playerSpeed / 60;
  
  // Update visual position
  const trackWidth = elements.track.offsetWidth;
  const playerScreenPos = 10 + (gameState.playerPosition / GAME_CONFIG.raceDistance) * (trackWidth - 100);
  elements.playerCar.style.left = playerScreenPos + 'px';
  elements.playerLabel.style.left = (playerScreenPos + 20) + 'px';
}

// CPU car updates
function updateCpuCar() {
  if (gameState.cpuGear > 0) {
    updateCpuSpeed();
    updateCpuPosition();
    manageCpuGearShifts();
  }
}

function updateCpuSpeed() {
  const { topSpeed, gearRatios } = GAME_CONFIG.carStats[gameState.carType];
  const difficulty = GAME_CONFIG.cpuDifficulty[gameState.level];
  const gearRatio = gearRatios[gameState.cpuGear];
  
  const cpuRPM = GAME_CONFIG.maxRPM * (0.85 + Math.random() * 0.15 * (1 - difficulty.errorMargin));
  gameState.cpuSpeed = (cpuRPM / GAME_CONFIG.maxRPM) * (topSpeed / gearRatio) * difficulty.speedMultiplier;
  
  // Dynamic balancing
  if (gameState.level <= 3 && gameState.cpuPosition > gameState.playerPosition) {
    gameState.cpuSpeed *= 0.7;
  } else if (gameState.level > 3) {
    const progressDifference = gameState.playerPosition - gameState.cpuPosition;
    if (progressDifference > GAME_CONFIG.raceDistance * 0.3) {
      gameState.cpuSpeed *= 1.2;
    }
  }
}

function updateCpuPosition() {
  gameState.cpuPosition += gameState.cpuSpeed / 60;
  
  // Update visual position
  const trackWidth = elements.track.offsetWidth;
  const cpuScreenPos = 10 + (gameState.cpuPosition / GAME_CONFIG.raceDistance) * (trackWidth - 100);
  elements.cpuCar.style.left = cpuScreenPos + 'px';
  elements.cpuLabel.style.left = (cpuScreenPos + 20) + 'px';
}

function manageCpuGearShifts() {
  const difficulty = GAME_CONFIG.cpuDifficulty[gameState.level];
  const shiftPoint = GAME_CONFIG.maxRPM * (0.9 - Math.random() * difficulty.errorMargin);
  
  if (gameState.cpuSpeed >= shiftPoint) {
    if (gameState.cpuGear < GAME_CONFIG.carStats[gameState.carType].gearRatios.length - 1) {
      gameState.cpuGear++;
      // In levels 1-3, occasionally make CPU miss shifts
      if (gameState.level <= 3 && Math.random() < 0.3) {
        gameState.cpuSpeed *= 0.6;
      }
    }
  }
}

// Gear shifting
function shiftGear() {
  if (!gameState.running) return;
  
  const currentRpmPercent = (gameState.rpmValue / GAME_CONFIG.maxRPM) * 100;
  const { shiftWindow } = GAME_CONFIG.carStats[gameState.carType];
  const targetStart = GAME_CONFIG.optimalShiftPoint - (shiftWindow / 2);
  const targetEnd = GAME_CONFIG.optimalShiftPoint + (shiftWindow / 2);
  
  if (gameState.playerGear === 0) {
    initiateFirstGear();
  } else {
    handleGearShift(currentRpmPercent, targetStart, targetEnd);
  }
}

function initiateFirstGear() {
  gameState.playerGear = 1;
  elements.gearDisplay.textContent = gameState.playerGear;
  gameState.rpmValue = 2000;
}

function handleGearShift(currentRpmPercent, targetStart, targetEnd) {
  if (currentRpmPercent >= targetStart && currentRpmPercent <= targetEnd) {
    handlePerfectShift();
  } else if (currentRpmPercent >= targetStart - 15 && currentRpmPercent <= targetEnd + 15) {
    handleGoodShift();
  } else {
    handleBadShift();
  }
  
  updateScore();
  tryNextGear();
}

function handlePerfectShift() {
  showMessage(GAME_CONFIG.messages.perfectShift, GAME_CONFIG.colors.perfect);
  gameState.score += GAME_CONFIG.scoring.perfectShift;
  gameState.playerSpeed += 30;
}

function handleGoodShift() {
  showMessage(GAME_CONFIG.messages.goodShift, GAME_CONFIG.colors.good);
  gameState.score += GAME_CONFIG.scoring.goodShift;
  gameState.playerSpeed += 15;
}

function handleBadShift() {
  showMessage(GAME_CONFIG.messages.badShift, GAME_CONFIG.colors.bad);
  gameState.playerSpeed *= gameState.level <= 3 ? 0.9 : 0.8;
}

function tryNextGear() {
  if (gameState.playerGear < GAME_CONFIG.carStats[gameState.carType].gearRatios.length - 1) {
    gameState.playerGear++;
    elements.gearDisplay.textContent = gameState.playerGear;
    gameState.rpmValue = 3000;
  }
}

// Race completion
function endRace() {
  gameState.running = false;
  clearInterval(gameState.gameInterval);
  showScreen('end-screen');
  
  const playerWins = determineWinner();
  updateFinalScore(playerWins);
  displayRaceResults(playerWins);
}

function determineWinner() {
  let playerWins = gameState.playerPosition >= GAME_CONFIG.raceDistance && 
                   (gameState.playerPosition > gameState.cpuPosition || 
                    gameState.cpuPosition < GAME_CONFIG.raceDistance);
  
  // Force win in first 3 levels if player is close
  if (gameState.level <= 3 && gameState.playerPosition >= GAME_CONFIG.raceDistance * 0.8) {
    playerWins = true;
  }
  
  return playerWins;
}

function updateFinalScore(playerWins) {
  if (playerWins) {
    const victoryMargin = (gameState.playerPosition - gameState.cpuPosition) / GAME_CONFIG.raceDistance * 100;
    const marginBonus = Math.floor(victoryMargin * GAME_CONFIG.scoring.marginMultiplier);
    gameState.score += GAME_CONFIG.scoring.raceWin + marginBonus;
    
    if (gameState.level < 5) gameState.level++;
  } else if (gameState.playerPosition >= GAME_CONFIG.raceDistance * 0.9) {
    gameState.score += GAME_CONFIG.scoring.consolationPoints;
  }
}

function displayRaceResults(playerWins) {
  elements.resultMessage.textContent = playerWins ? 
    GAME_CONFIG.messages.victory : 
    GAME_CONFIG.messages.defeat;
  elements.resultMessage.style.color = playerWins ? 
    GAME_CONFIG.colors.perfect : 
    GAME_CONFIG.colors.bad;
  elements.finalScore.textContent = `Score: ${gameState.score}`;
}

// Utility functions
function showMessage(text, color = '#ffcc00') {
  elements.message.textContent = text;
  elements.message.style.color = color;
}

function updateDisplays() {
  elements.rpmIndicator.style.bottom = (gameState.rpmValue / GAME_CONFIG.maxRPM * 100) + '%';
  elements.speedDisplay.textContent = Math.floor(gameState.playerSpeed);
  elements.scoreDisplay.textContent = gameState.score;
  elements.levelDisplay.textContent = gameState.level;
} 