// Level configurations
const levelConfigs = {
    park: {
        name: "PARK",
        background: "#006400",
        treeCount: 15,
        pondCount: 5,
        pondSize: 150,
        victimCount: 15,
        requiredVictims: 15,
        enemyTypes: [
            { type: 'wolf', count: 2, size: 32, speed: 2 },
            { type: 'raccoon', count: 3, size: 24, speed: 1.5 }
        ]
    },
    desert: {
        name: "DESERT",
        background: "#D2691E",
        treeCount: 8,
        pondCount: 3,
        pondSize: 150,
        victimCount: 15,
        requiredVictims: 15,
        enemyTypes: [
            { type: 'wolf', count: 3, size: 32, speed: 2.5 },
            { type: 'raccoon', count: 2, size: 24, speed: 2 }
        ]
    },
    moon: {
        name: "MOON",
        background: "#2F4F4F",
        treeCount: 10,
        pondCount: 4,
        pondSize: 150,
        victimCount: 15,
        requiredVictims: 15,
        enemyTypes: [
            { type: 'wolf', count: 2, size: 32, speed: 2 },
            { type: 'raccoon', count: 3, size: 24, speed: 1.5 }
        ]
    },
    lava: {
        name: "LAVA",
        background: "#8B0000",
        treeCount: 8,
        pondCount: 3,
        pondSize: 150,
        victimCount: 15,
        requiredVictims: 15,
        enemyTypes: [
            { type: 'wolf', count: 3, size: 32, speed: 2.5 },
            { type: 'raccoon', count: 2, size: 24, speed: 2 }
        ]
    },
    sky: {
        name: "SKY",
        background: "#87CEEB",
        treeCount: 12,
        pondCount: 4,
        pondSize: 150,
        victimCount: 15,
        requiredVictims: 15,
        enemyTypes: [
            { type: 'wolf', count: 3, size: 32, speed: 2.5 },
            { type: 'raccoon', count: 2, size: 24, speed: 2 }
        ]
    }
};

// Get configuration for a specific level
function getLevelConfig(levelName) {
    return levelConfigs[levelName.toLowerCase()] || levelConfigs.park;
}

// Get the next level in sequence
function getNextLevel(currentLevel) {
    const levelOrder = ['park', 'desert', 'moon', 'lava', 'sky'];
    const currentIndex = levelOrder.indexOf(currentLevel.toLowerCase());
    if (currentIndex === -1 || currentIndex === levelOrder.length - 1) {
        return null; // No next level
    }
    return levelOrder[currentIndex + 1];
}

// Helper function to check if level exists
function levelExists(levelName) {
    return !!levelConfigs[levelName.toLowerCase()];
}

// Helper function to check if level is complete
function isLevelComplete(levelName, victimsEaten) {
    return victimsEaten >= getLevelConfig(levelName).requiredVictims;
} 