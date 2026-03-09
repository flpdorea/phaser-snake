const THEMES = {
    modern: {
        name: 'Modern',
        unlockScore: 0,
        snake: 0x00d9ff,
        snakeHead: 0x00b8d9,
        food: 0xff6b35,
        grid: 0x2a2a4e,
        background: '#1a1a2e',
        obstacle: 0x666666,
        accent: '#00d9ff'
    },
    retro: {
        name: 'Retro',
        unlockScore: 100,
        snake: 0x00ff00,
        snakeHead: 0x00cc00,
        food: 0xffff00,
        grid: 0x003300,
        background: '#000000',
        obstacle: 0x006600,
        accent: '#00ff00'
    },
    neon: {
        name: 'Neon',
        unlockScore: 250,
        snake: 0xff00ff,
        snakeHead: 0xcc00cc,
        food: 0x00ffff,
        grid: 0x1a0033,
        background: '#0d001a',
        obstacle: 0x6600aa,
        accent: '#ff00ff'
    },
    nature: {
        name: 'Nature',
        unlockScore: 500,
        snake: 0x8b4513,
        snakeHead: 0x654321,
        food: 0x228b22,
        grid: 0x3d2914,
        background: '#1a0f05',
        obstacle: 0x5c4033,
        accent: '#228b22'
    },
    cyberpunk: {
        name: 'Cyberpunk',
        unlockScore: 1000,
        snake: 0xffff00,
        snakeHead: 0xcccc00,
        food: 0x00ffff,
        grid: 0x1a1a00,
        background: '#0a0a00',
        obstacle: 0x666600,
        accent: '#ffff00'
    }
};

function getUnlockedThemes(highScore) {
    return Object.entries(THEMES)
        .filter(([key, theme]) => highScore >= theme.unlockScore)
        .map(([key]) => key);
}

function getCurrentTheme() {
    return localStorage.getItem('snakeTheme') || 'modern';
}

function setCurrentTheme(themeKey) {
    localStorage.setItem('snakeTheme', themeKey);
}

function getHighScore(mode = 'classic') {
    return parseInt(localStorage.getItem('snakeHighScore_' + mode) || '0');
}

function setHighScore(score, mode = 'classic') {
    const current = getHighScore(mode);
    if (score > current) {
        localStorage.setItem('snakeHighScore_' + mode, score.toString());
        return true;
    }
    return false;
}

function getAllHighScores() {
    return {
        classic: getHighScore('classic'),
        timeattack: getHighScore('timeattack'),
        survival: getHighScore('survival')
    };
}

function getSavedLevel() {
    return parseInt(localStorage.getItem('snakeLevel') || '1');
}

function setSavedLevel(level) {
    localStorage.setItem('snakeLevel', level.toString());
}
