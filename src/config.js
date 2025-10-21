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
  width: window.innerWidth || CANVAS.WIDTH,
  height: window.innerHeight || CANVAS.HEIGHT,
  parent: 'game',
  backgroundColor: '#0a0a0a',
  scale: {
    mode: Phaser.Scale.RESIZE,  // 使用RESIZE模式完全填滿螢幕
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth || CANVAS.WIDTH,
    height: window.innerHeight || CANVAS.HEIGHT,
    // 手機專用設定
    fullscreenTarget: 'game',
    expandParent: false,
    autoRound: false,
    // 支援動態調整
    resizeInterval: 100
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
  ],
  // 手機最佳化設定
  input: {
    touch: {
      capture: false
    }
  },
  render: {
    antialias: false,
    pixelArt: false,
    autoResize: true
  }
};

// 建立遊戲實例
const game = new Phaser.Game(config);

// 簡單的自動調整函數
function resizeGame() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  if (game.scale) {
    game.scale.setGameSize(width, height);
  }
  
  // 確保canvas填滿整個螢幕
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }
}

// 監聽視窗變化
window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', () => {
  setTimeout(resizeGame, 300);
});

// 初始化
setTimeout(resizeGame, 100);

export default game;
