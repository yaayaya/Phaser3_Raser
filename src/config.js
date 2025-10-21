import Phaser from 'phaser';
import { CANVAS, SCENES } from './utils/constants.js';
import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import UpgradeShopScene from './scenes/UpgradeShopScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import ResultScene from './scenes/ResultScene.js';

/**
 * Phaser 3 遊戲設定
 */
const config = {
  type: Phaser.AUTO,
  width: CANVAS.WIDTH,
  height: CANVAS.HEIGHT,
  parent: 'game',
  backgroundColor: '#0a0a0a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: CANVAS.WIDTH,
    height: CANVAS.HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    MainMenuScene,
    UpgradeShopScene,
    LevelSelectScene,
    GameScene,
    UIScene,
    ResultScene
  ]
};

// 建立遊戲實例
const game = new Phaser.Game(config);

export default game;
