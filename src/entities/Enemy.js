import Phaser from 'phaser';
import { ENEMY } from '../utils/constants.js';
import Bullet from './Bullet.js';

/**
 * 敵人基礎類別
 */
export default class Enemy extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type, config) {
    super(scene, x, y);
    
    this.type = type;
    this.config = config;
    this.speed = config.speed || ENEMY[type.toUpperCase()].BASE_SPEED;
    this.maxHealth = config.health || ENEMY[type.toUpperCase()].BASE_HEALTH;
    this.health = this.maxHealth;
    this.reward = config.reward || ENEMY[type.toUpperCase()].BASE_REWARD;
    this.damage = config.damage || ENEMY[type.toUpperCase()].BASE_DAMAGE;
    this.size = ENEMY[type.toUpperCase()].SIZE;
    this.color = ENEMY[type.toUpperCase()].COLOR;
    this.isBoss = type === 'boss';
    
    // 射擊相關
    this.shootRange = ENEMY[type.toUpperCase()].SHOOT_RANGE;
    this.shootInterval = ENEMY[type.toUpperCase()].SHOOT_INTERVAL;
    this.stopDistance = ENEMY[type.toUpperCase()].STOP_DISTANCE;
    this.lastShootTime = 0;
    
    // 隨機移動系統
    this.targetPosition = { x: this.x, y: this.y };
    this.moveTimer = 0;
    this.moveDuration = Phaser.Math.Between(2000, 5000); // 2-5秒切換目標點
    this.setRandomTarget();
    
    // 建立圖形
    this.createGraphics();
    
    // 加入場景
    scene.add.existing(this);
  }
  
  createGraphics() {
    // 主體
    this.body = this.scene.add.circle(0, 0, this.size / 2, this.color);
    this.add(this.body);
    
    // Boss 有特殊標記
    if (this.isBoss) {
      const crown = this.scene.add.text(0, 0, '👑', {
        font: `${this.size}px Arial`
      });
      crown.setOrigin(0.5);
      this.add(crown);
    }
    
    // 生命值條（不加入 Container，獨立管理）
    this.healthBarBg = this.scene.add.rectangle(this.x, this.y - this.size / 2 - 10, this.size, 4, 0x000000);
    this.healthBar = this.scene.add.rectangle(this.x, this.y - this.size / 2 - 10, this.size, 4, 0x00ff00);
    this.healthBarBg.setVisible(false);
    this.healthBar.setVisible(false);
    this.healthBarBg.setDepth(this.depth + 1);
    this.healthBar.setDepth(this.depth + 2);
    
    // 記錄是否受到過傷害
    this.hasTakenDamage = false;
  }
  
  setRandomTarget() {
    // 設定隨機目標點（在畫面範圍內）
    const margin = 50;
    this.targetPosition = {
      x: Phaser.Math.Between(margin, this.scene.cameras.main.width - margin),
      y: Phaser.Math.Between(margin, this.scene.cameras.main.height - margin)
    };
  }
  
  update(delta, playerX, playerY) {
    if (!this.active) return;
    
    // 更新移動計時器
    this.moveTimer += delta;
    if (this.moveTimer >= this.moveDuration) {
      this.moveTimer = 0;
      this.moveDuration = Phaser.Math.Between(2000, 5000);
      this.setRandomTarget();
    }
    
    // 計算到目標點的距離和角度
    const distanceToTarget = Phaser.Math.Distance.Between(this.x, this.y, this.targetPosition.x, this.targetPosition.y);
    const angleToTarget = Math.atan2(this.targetPosition.y - this.y, this.targetPosition.x - this.x);
    
    // 移動到目標點（保持一定距離）
    if (distanceToTarget > 30) {
      const speed = this.speed * (delta / 1000);
      this.x += Math.cos(angleToTarget) * speed;
      this.y += Math.sin(angleToTarget) * speed;
    }
    
    // 計算到玩家的距離
    const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    
    // 在射擊範圍內時發射子彈
    if (distanceToPlayer <= this.shootRange) {
      this.tryShoot(playerX, playerY);
    }
    
    // 手動同步血量條位置（固定在上方，不旋轉）
    if (this.healthBarBg && this.healthBar) {
      this.healthBarBg.setPosition(this.x, this.y - this.size / 2 - 10);
      this.healthBar.setPosition(this.x, this.y - this.size / 2 - 10);
    }
    
    // 更新生命值條
    this.updateHealthBar();
  }
  
  tryShoot(targetX, targetY) {
    const now = Date.now();
    if (now - this.lastShootTime >= this.shootInterval) {
      this.shoot(targetX, targetY);
      this.lastShootTime = now;
    }
  }
  
  shoot(targetX, targetY) {
    // 建立子彈
    const bullet = new Bullet(this.scene, this.x, this.y, targetX, targetY, this.damage);
    
    // 通知場景有新子彈
    if (this.scene.onEnemyShoot) {
      this.scene.onEnemyShoot(bullet);
    }
    
    // 視覺回饋
    this.scene.tweens.add({
      targets: this.body,
      scale: 1.2,
      duration: 100,
      yoyo: true
    });
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
    
    // 根據血量改變顏色
    if (percent > 0.6) {
      this.healthBar.setFillStyle(0x00ff00);
    } else if (percent > 0.3) {
      this.healthBar.setFillStyle(0xffff00);
    } else {
      this.healthBar.setFillStyle(0xff0000);
    }
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
    
    // 通知場景敵人死亡
    if (this.scene.onEnemyKilled) {
      this.scene.onEnemyKilled(this);
    }
  }
}
