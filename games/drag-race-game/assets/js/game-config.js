// Game Constants
const GAME_CONFIG = {
  raceDistance: 400,
  maxRPM: 8000,
  optimalShiftPoint: 85, // percentage of RPM meter
  updateInterval: 33, // ~30fps
  
  // Car configurations
  carStats: {
    muscle: {
      acceleration: 18,
      topSpeed: 220,
      shiftWindow: 15,
      gearRatios: [0, 3.5, 2.5, 1.8, 1.3, 1.0],
      rpmRate: 15,
      color: '#F44336'
    },
    sport: {
      acceleration: 16,
      topSpeed: 240,
      shiftWindow: 12,
      gearRatios: [0, 3.2, 2.3, 1.6, 1.2, 0.9],
      rpmRate: 18,
      color: '#2196F3'
    },
    exotic: {
      acceleration: 20,
      topSpeed: 260,
      shiftWindow: 8,
      gearRatios: [0, 3.0, 2.1, 1.5, 1.1, 0.8],
      rpmRate: 20,
      color: '#FFC107'
    }
  },
  
  // CPU difficulty settings
  cpuDifficulty: {
    1: { errorMargin: 0.6, reactionTime: 2.0, speedMultiplier: 0.6 },
    2: { errorMargin: 0.5, reactionTime: 1.8, speedMultiplier: 0.7 },
    3: { errorMargin: 0.4, reactionTime: 1.5, speedMultiplier: 0.8 },
    4: { errorMargin: 0.3, reactionTime: 1.0, speedMultiplier: 0.95 },
    5: { errorMargin: 0.2, reactionTime: 0.5, speedMultiplier: 1.1 }
  },
  
  // Scoring system
  scoring: {
    perfectShift: 100,
    goodShift: 50,
    raceWin: 200,
    marginMultiplier: 10, // Points per percentage of victory margin
    consolationPoints: 50 // Points for close race when losing
  },
  
  // Game messages
  messages: {
    perfectShift: "PERFECT SHIFT!",
    goodShift: "Good Shift",
    badShift: "Bad Shift!",
    victory: "YOU WIN!",
    defeat: "YOU LOSE!"
  },
  
  // Colors
  colors: {
    perfect: "#4CAF50",
    good: "#FFC107",
    bad: "#F44336"
  }
}; 