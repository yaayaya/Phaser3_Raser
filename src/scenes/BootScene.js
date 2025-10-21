import Phaser from 'phaser';
import { SCENES } from '../utils/constants.js';

/**
 * 啟動場景 - 載入遊戲資源
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // 建立載入進度顯示
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, '載入中...', {
      font: '20px Arial',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px Arial',
      fill: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);
    
    // 更新進度
    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x00ffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    
    // 這裡可以載入圖片、音效等資源
    // this.load.image('player', 'assets/images/player.png');
    // this.load.audio('laser', 'assets/sounds/laser.mp3');
    
    // 暫時使用延遲來模擬載入
    this.load.json('levels', 'assets/data/levels.json');
    this.load.json('upgrades', 'assets/data/upgrades.json');
    this.load.json('powerups', 'assets/data/powerups.json');
  }

  create() {
    // 載入完成後切換到主選單
    this.scene.start(SCENES.MAIN_MENU);
  }
}
