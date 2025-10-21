import Phaser from 'phaser';
import { PLAYER, CANVAS } from '../utils/constants.js';
import { clamp } from '../utils/helpers.js';

/**
 * 玩家類別
 */
export default class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y, upgrades) {
    super(scene, x, y);
    
    // 套用升級
    this.moveSpeed = PLAYER.BASE_SPEED + (upgrades.moveSpeed || 0) * 15;
    this.attackRange = PLAYER.BASE_ATTACK_RANGE + (upgrades.attackRange || 0) * 25;
    this.attackCount = PLAYER.BASE_ATTACK_COUNT + (upgrades.attackCount || 0);
    this.attackDamage = PLAYER.BASE_ATTACK_DAMAGE + (upgrades.attackDamage || 0) * 8;
    this.maxHealth = PLAYER.BASE_MAX_HEALTH + (upgrades.maxHealth || 0) * 1;
    this.health = this.maxHealth;
    this.size = PLAYER.SIZE;
    
    // 建立玩家圖形
    this.createGraphics();
    
    // 加入場景
    scene.add.existing(this);
  }
  
  createGraphics() {
    // 主體
    const body = this.scene.add.circle(0, 0, this.size / 2, PLAYER.COLOR);
    
    // 方向指示器
    const indicator = this.scene.add.triangle(
      this.size / 2, 0,
      0, -6, 10, 0, 0, 6,
      PLAYER.COLOR
    );
    
    this.add([body, indicator]);
    
    // 攻擊範圍圈（半透明，調試用）
    if (false) { // 設為 true 可顯示攻擊範圍
      const rangeCircle = this.scene.add.circle(0, 0, this.attackRange, 0x00ff00, 0.1);
      rangeCircle.setStrokeStyle(1, 0x00ff00, 0.3);
      this.add(rangeCircle);
    }
  }
  
  update(delta, movement) {
    // 移動
    const speed = this.moveSpeed * (delta / 1000);
    
    if (movement.x !== 0 || movement.y !== 0) {
      // 正規化移動向量
      const length = Math.sqrt(movement.x * movement.x + movement.y * movement.y);
      const normalizedX = movement.x / length;
      const normalizedY = movement.y / length;
      
      this.x += normalizedX * speed;
      this.y += normalizedY * speed;
      
      // 限制在畫布範圍內
      this.x = clamp(this.x, this.size, CANVAS.WIDTH - this.size);
      this.y = clamp(this.y, this.size, CANVAS.HEIGHT - this.size);
      
      // 更新方向
      this.rotation = Math.atan2(normalizedY, normalizedX);
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
    
    // 視覺回饋
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }
  
  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
  }
}
