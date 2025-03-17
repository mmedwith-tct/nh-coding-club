// Level configurations
const levels = {
    park: {
        name: "PARK",
        background: "#003300",
        treeCount: 15,
        pondCount: 5,
        pondSize: 150,
        victimCount: 5,
        requiredVictims: 5,
        enemyTypes: [
            { type: 'wolf', count: 2, size: 32, speed: 2 },
            { type: 'raccoon', count: 3, size: 24, speed: 1.5 }
        ]
    },
    desert: {
        name: "DESERT",
        background: "#8B4513",
        treeCount: 8,
        pondCount: 3,
        pondSize: 100,
        victimCount: 5,
        requiredVictims: 5,
        enemyTypes: [
            { type: 'wolf', count: 3, size: 32, speed: 2.5 },
            { type: 'raccoon', count: 2, size: 24, speed: 2 }
        ]
    },
    forest: {
        name: "FOREST",
        background: "#006400",
        treeCount: 20,
        pondCount: 4,
        pondSize: 120,
        victimCount: 5,
        requiredVictims: 5,
        enemyTypes: [
            { type: 'wolf', count: 4, size: 32, speed: 2.2 },
            { type: 'raccoon', count: 3, size: 24, speed: 1.8 }
        ]
    }
};

// Get configuration for a specific level
function getLevelConfig(levelName) {
    return levels[levelName] || levels.park;
}

// Get the next level in sequence
function getNextLevel(currentLevel) {
    const levelOrder = ['park', 'desert', 'forest'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    return currentIndex < levelOrder.length - 1 ? levelOrder[currentIndex + 1] : null;
}

// Helper function to check if level exists
function levelExists(levelName) {
    return !!levels[levelName];
}

// Helper function to check if level is complete
function isLevelComplete(levelName, victimsEaten) {
    return victimsEaten >= getLevelConfig(levelName).requiredVictims;
} 