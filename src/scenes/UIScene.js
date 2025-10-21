import Phaser from 'phaser';
import { SCENES, COLORS } from '../utils/constants.js';
import { formatTime, formatNumber } from '../utils/helpers.js';

/**
 * UI 覆蓋層場景
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.UI });
  }

  init(data) {
    this.gameData = data;
  }

  create() {
    const width = this.cameras.main.width;
    
    // 時間顯示
    this.timeText = this.add.text(width / 2, 20, '', {
      font: 'bold 24px Arial',
      fill: COLORS.WARNING
    });
    this.timeText.setOrigin(0.5);
    
    // HP 顯示
    this.healthText = this.add.text(20, 20, '', {
      font: 'bold 18px Arial',
      fill: COLORS.SUCCESS
    });
    
    // 代幣顯示
    this.coinsText = this.add.text(width - 20, 20, '', {
      font: 'bold 18px Arial',
      fill: COLORS.WARNING
    });
    this.coinsText.setOrigin(1, 0);
    
    // 初始化顯示
    this.updateTime(this.gameData.remainingTime);
    this.updateHealth(this.gameData.player.health, this.gameData.player.maxHealth);
    this.updateCoins(this.gameData.coins);
  }
  
  updateTime(seconds) {
    const color = seconds < 30 ? COLORS.DANGER : seconds < 60 ? COLORS.WARNING : COLORS.PRIMARY;
    this.timeText.setText(`⏰ ${formatTime(seconds)}`);
    this.timeText.setStyle({ fill: color });
  }
  
  updateHealth(current, max) {
    const percent = (current / max) * 100;
    const color = percent < 30 ? COLORS.DANGER : percent < 60 ? COLORS.WARNING : COLORS.SUCCESS;
    this.healthText.setText(`❤️ ${Math.max(0, Math.floor(current))} / ${max}`);
    this.healthText.setStyle({ fill: color });
  }
  
  updateCoins(amount) {
    this.coinsText.setText(`💰 ${formatNumber(amount)}`);
  }
}
