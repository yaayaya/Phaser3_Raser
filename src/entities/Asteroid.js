import Phaser from 'phaser';
import { ASTEROID } from '../utils/constants.js';

/**
 * 隕石類別
 */
export default class Asteroid extends Phaser.GameObjects.Container {
  constructor(scene, x, y, size = 'small', velocityX = 0, velocityY = 0) {
    super(scene, x, y);
    
    this.asteroidSize = size;
    this.config = ASTEROID[size.toUpperCase()];
    this.maxHealth = this.config.BASE_HEALTH;
    this.health = this.maxHealth;
    this.reward = this.config.BASE_REWARD;
    this.damage = 1; // 隕石碰撞傷害固定為 1
    this.size = this.config.SIZE;
    this.color = this.config.COLOR;
    
    // 隕石速度
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    
    // 旋轉速度
    this.rotationSpeed = Phaser.Math.FloatBetween(-2, 2);
    
    // 建立圖形
    this.createGraphics();
    
    // 加入場景
    scene.add.existing(this);
  }
  
  createGraphics() {
    // 主體（多邊形模擬不規則隕石）
    const points = [];
    const sides = 8;
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const radius = (this.size / 2) * Phaser.Math.FloatBetween(0.8, 1.2);
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
    
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(this.color);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fill();
    
    // 轉換為紋理
    graphics.generateTexture('asteroid_' + this.id, this.size, this.size);
    graphics.destroy();
    
    // 建立精靈
    this.body = this.scene.add.sprite(0, 0, 'asteroid_' + this.id);
    this.add(this.body);
    
    // 生命值條（不加入 Container，獨立管理）
    this.healthBarBg = this.scene.add.rectangle(this.x, this.y - this.size / 2 - 10, this.size, 4, 0x000000);
    this.healthBar = this.scene.add.rectangle(this.x, this.y - this.size / 2 - 10, this.size, 4, 0x888888);
    this.healthBarBg.setVisible(false);
    this.healthBar.setVisible(false);
    this.healthBarBg.setDepth(this.depth + 1);
    this.healthBar.setDepth(this.depth + 2);
    
    // 記錄是否受到過傷害
    this.hasTakenDamage = false;
  }
  
  update(delta) {
    if (!this.active) return;
    
    // 移動
    const speed = (delta / 1000);
    this.x += this.velocityX * speed;
    this.y += this.velocityY * speed;
    
    // 旋轉
    this.rotation += this.rotationSpeed * speed;
    
    // 手動同步血量條位置（固定在上方，不旋轉）
    if (this.healthBarBg && this.healthBar) {
      this.healthBarBg.setPosition(this.x, this.y - this.size / 2 - 10);
      this.healthBar.setPosition(this.x, this.y - this.size / 2 - 10);
    }
    
    // 更新生命值條
    this.updateHealthBar();
    
    // 超出邊界則銷毀
    const margin = 100;
    if (this.x < -margin || this.x > this.scene.cameras.main.width + margin ||
        this.y < -margin || this.y > this.scene.cameras.main.height + margin) {
      this.destroy();
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    
    // 第一次受傷時顯示血量條
    if (!this.hasTakenDamage) {
      this.hasTakenDamage = true;
      this.healthBarBg.setVisible(true);
      this.healthBar.setVisible(true);
    }
    
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
    
    // 視覺回饋
    this.scene.tweens.add({
      targets: this.body,
      alpha: 0.5,
      duration: 50,
      yoyo: true
    });
  }
  
  updateHealthBar() {
    const percent = this.health / this.maxHealth;
    this.healthBar.width = this.size * percent;
  }
  
  die() {
    // 死亡動畫
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.5,
      duration: 200,
      onComplete: () => {
        // 清理血量條
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBar) this.healthBar.destroy();
        this.destroy();
      }
    });
    
    // 通知場景隕石被摧毀
    if (this.scene.onAsteroidDestroyed) {
      this.scene.onAsteroidDestroyed(this);
    }
  }
}
