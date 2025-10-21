import Phaser from 'phaser';
import { POWERUP } from '../utils/constants.js';

/**
 * 道具類別
 */
export default class PowerUp extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type, value) {
    super(scene, x, y);
    
    this.type = type;
    this.value = value;
    this.lifetime = POWERUP[type.toUpperCase()].LIFETIME * 1000;
    this.blinkStart = POWERUP[type.toUpperCase()].BLINK_START * 1000;
    this.createdAt = Date.now();
    
    // 建立圖形
    this.createGraphics();
    
    // 加入場景
    scene.add.existing(this);
    
    // 浮動動畫
    this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 旋轉動畫
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });
  }
  
  createGraphics() {
    const config = POWERUP[this.type.toUpperCase()];
    
    // 外圈光暈
    const glow = this.scene.add.circle(0, 0, config.SIZE * 1.5, config.COLOR, 0.2);
    
    // 主體
    const body = this.scene.add.circle(0, 0, config.SIZE, config.COLOR);
    
    // 圖示
    const icon = this.scene.add.text(0, 0, this.getIcon(), {
      font: '20px Arial'
    });
    icon.setOrigin(0.5);
    
    this.add([glow, body, icon]);
  }
  
  getIcon() {
    switch (this.type) {
      case 'time': return '⏰';
      case 'health': return '❤️';
      case 'shield': return '🛡️';
      case 'damage': return '⚔️';
      default: return '✨';
    }
  }
  
  update() {
    const elapsed = Date.now() - this.createdAt;
    
    // 檢查是否超時
    if (elapsed >= this.lifetime) {
      this.destroy();
      return;
    }
    
    // 開始閃爍
    if (elapsed >= this.blinkStart) {
      const blinkSpeed = 200;
      const shouldShow = Math.floor((Date.now() % (blinkSpeed * 2)) / blinkSpeed) === 0;
      this.setAlpha(shouldShow ? 1 : 0.3);
    }
  }
}
