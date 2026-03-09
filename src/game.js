const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 680,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: [MenuScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);
