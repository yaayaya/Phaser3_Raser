import Phaser from 'phaser';
import { ENEMY, CANVAS } from '../utils/constants.js';
import Bullet from './Bullet.js';

/**
 * BOSS 類別 - 有多種攻擊模式
 */
export default class Boss extends Phaser.GameObjects.Container {
  constructor(scene, x, y, bossType = 1) {
    super(scene, x, y);
    
    this.bossType = bossType;
    this.type = 'boss';
    this.speed = 40;
    this.maxHealth = 500 + (bossType * 300);
    this.health = this.maxHealth;
    this.reward = 200 + (bossType * 100);
    this.damage = 1;
    this.size = 60;
    this.color = 0xff00ff;
    this.isBoss = true;
    
    // 攻擊模式
    this.attackMode = 0;
    this.attackModeTimer = 0;
    this.attackModeDuration = 5000; // 每5秒切換模式
    this.lastAttackTime = 0;
    
    // 根據 Boss 類型設定攻擊間隔
    this.attackInterval = 800 - (bossType * 100); // Boss 2 和 3 攻擊更快
    
    // 隨機移動系統
    this.targetPosition = { x: CANVAS.WIDTH / 2, y: CANVAS.HEIGHT * 0.25 };
    this.moveTimer = 0;
    this.moveDuration = Phaser.Math.Between(3000, 6000); // 3-6秒切換目標點
    this.isUltimateBoss = (bossType >= 4); // Boss 4+ 是終極Boss
    
    // 建立圖形
    this.createGraphics();
    
    // 加入場景
    scene.add.existing(this);
    
    // 記錄是否受到過傷害
    this.hasTakenDamage = false;
  }
  
  createGraphics() {
    // 主體
    this.body = this.scene.add.circle(0, 0, this.size / 2, this.color);
    this.add(this.body);
    
    // Boss 標記
    const crown = this.scene.add.text(0, 0, '👑', {
      font: `${this.size}px Arial`
    });
    crown.setOrigin(0.5);
    this.add(crown);
    
    // 生命值條（不加入 Container，獨立管理）
    this.healthBarBg = this.scene.add.rectangle(this.x, this.y - this.size / 2 - 15, this.size * 2, 6, 0x000000);
    this.healthBar = this.scene.add.rectangle(this.x, this.y - this.size / 2 - 15, this.size * 2, 6, 0xff00ff);
    this.healthBarBg.setVisible(false);
    this.healthBar.setVisible(false);
    this.healthBarBg.setDepth(this.depth + 1);
    this.healthBar.setDepth(this.depth + 2);
  }
  
  setRandomTarget() {
    // Boss在畫面上半部隨機移動
    const margin = this.size * 2;
    this.targetPosition = {
      x: Phaser.Math.Between(margin, CANVAS.WIDTH - margin),
      y: Phaser.Math.Between(margin, CANVAS.HEIGHT * 0.4)
    };
  }
  
  update(delta, playerX, playerY) {
    if (!this.active) return;
    
    // 更新移動計時器
    this.moveTimer += delta;
    if (this.moveTimer >= this.moveDuration) {
      this.moveTimer = 0;
      this.moveDuration = Phaser.Math.Between(3000, 6000);
      this.setRandomTarget();
    }
    
    // 移動到目標點
    const distanceToTarget = Phaser.Math.Distance.Between(this.x, this.y, this.targetPosition.x, this.targetPosition.y);
    if (distanceToTarget > 10) {
      const angleToTarget = Math.atan2(this.targetPosition.y - this.y, this.targetPosition.x - this.x);
      const moveSpeed = this.speed * (delta / 1000);
      this.x += Math.cos(angleToTarget) * moveSpeed;
      this.y += Math.sin(angleToTarget) * moveSpeed;
    }
    
    // 限制在畫面內
    this.x = Phaser.Math.Clamp(this.x, this.size, CANVAS.WIDTH - this.size);
    this.y = Phaser.Math.Clamp(this.y, this.size, CANVAS.HEIGHT * 0.5);
    
    // 更新攻擊模式
    this.attackModeTimer += delta;
    if (this.attackModeTimer >= this.attackModeDuration) {
      this.attackModeTimer = 0;
      this.attackMode = (this.attackMode + 1) % this.getMaxAttackModes();
      // 模式切換視覺效果
      this.scene.tweens.add({
        targets: this.body,
        scale: 1.3,
        duration: 200,
        yoyo: true
      });
    }
    
    // 執行攻擊
    this.tryAttack(playerX, playerY);
    
    // 手動同步血量條位置（固定在上方，不旋轉）
    if (this.healthBarBg && this.healthBar) {
      this.healthBarBg.setPosition(this.x, this.y - this.size / 2 - 15);
      this.healthBar.setPosition(this.x, this.y - this.size / 2 - 15);
    }
    
    // 更新生命值條
    this.updateHealthBar();
  }
  
  getMaxAttackModes() {
    // Boss 1: 2種模式, Boss 2: 3種模式, Boss 3: 4種模式
    return 1 + this.bossType;
  }
  
  tryAttack(targetX, targetY) {
    const now = Date.now();
    if (now - this.lastAttackTime >= this.attackInterval) {
      this.executeAttack(targetX, targetY);
      this.lastAttackTime = now;
    }
  }
  
  executeAttack(targetX, targetY) {
    // 終極Boss使用特殊攻擊模式
    if (this.isUltimateBoss) {
      this.ultimateAttack(targetX, targetY);
      return;
    }
    
    switch (this.attackMode) {
      case 0:
        this.attackStraight(targetX, targetY);
        break;
      case 1:
        this.attackSpread(targetX, targetY);
        break;
      case 2:
        this.attackCircle();
        break;
      case 3:
        this.attackWave(targetX, targetY);
        break;
    }
  }
  
  // 終極Boss攻擊：超大量子彈
  ultimateAttack(targetX, targetY) {
    // 隨機選擇攻擊模式
    const mode = Phaser.Math.Between(0, 3);
    
    switch(mode) {
      case 0: // 超密集螺旋
        for (let i = 0; i < 24; i++) {
          const angle = (i / 24) * Math.PI * 2 + (Date.now() / 500);
          const tx = this.x + Math.cos(angle) * 600;
          const ty = this.y + Math.sin(angle) * 600;
          const bullet = new Bullet(this.scene, this.x, this.y, tx, ty, this.damage);
          if (this.scene.onEnemyShoot) this.scene.onEnemyShoot(bullet);
        }
        break;
        
      case 1: // 多重散彈
        for (let ring = 0; ring < 3; ring++) {
          this.scene.time.delayedCall(ring * 150, () => {
            if (!this.active) return;
            for (let i = 0; i < 12; i++) {
              const baseAngle = Math.atan2(targetY - this.y, targetX - this.x);
              const spread = (i - 5.5) * (Math.PI / 12);
              const angle = baseAngle + spread;
              const tx = this.x + Math.cos(angle) * 700;
              const ty = this.y + Math.sin(angle) * 700;
              const bullet = new Bullet(this.scene, this.x, this.y, tx, ty, this.damage);
              if (this.scene.onEnemyShoot) this.scene.onEnemyShoot(bullet);
            }
          });
        }
        break;
        
      case 2: // 十字加對角
        const directions = 8;
        for (let i = 0; i < directions; i++) {
          const angle = (i / directions) * Math.PI * 2;
          for (let j = 0; j < 5; j++) {
            this.scene.time.delayedCall(j * 100, () => {
              if (!this.active) return;
              const tx = this.x + Math.cos(angle) * 800;
              const ty = this.y + Math.sin(angle) * 800;
              const bullet = new Bullet(this.scene, this.x, this.y, tx, ty, this.damage);
              if (this.scene.onEnemyShoot) this.scene.onEnemyShoot(bullet);
            });
          }
        }
        break;
        
      case 3: // 隨機暴雨
        for (let i = 0; i < 30; i++) {
          this.scene.time.delayedCall(i * 50, () => {
            if (!this.active) return;
            const randomAngle = Math.random() * Math.PI * 2;
            const tx = this.x + Math.cos(randomAngle) * 700;
            const ty = this.y + Math.sin(randomAngle) * 700;
            const bullet = new Bullet(this.scene, this.x, this.y, tx, ty, this.damage);
            if (this.scene.onEnemyShoot) this.scene.onEnemyShoot(bullet);
          });
        }
        break;
    }
  }
  
  // 模式 0: 直線射擊
  attackStraight(targetX, targetY) {
    const bullet = new Bullet(this.scene, this.x, this.y, targetX, targetY, this.damage);
    if (this.scene.onEnemyShoot) {
      this.scene.onEnemyShoot(bullet);
    }
  }
  
  // 模式 1: 散彈射擊
  attackSpread(targetX, targetY) {
    const spreadCount = 3 + this.bossType; // Boss 1: 4發, Boss 2: 5發, Boss 3: 6發
    const spreadAngle = Math.PI / 6;
    const baseAngle = Math.atan2(targetY - this.y, targetX - this.x);
    
    for (let i = 0; i < spreadCount; i++) {
      const angle = baseAngle + (i - (spreadCount - 1) / 2) * spreadAngle / (spreadCount - 1);
      const tx = this.x + Math.cos(angle) * 500;
      const ty = this.y + Math.sin(angle) * 500;
      
      const bullet = new Bullet(this.scene, this.x, this.y, tx, ty, this.damage);
      if (this.scene.onEnemyShoot) {
        this.scene.onEnemyShoot(bullet);
      }
    }
  }
  
  // 模式 2: 圓形射擊
  attackCircle() {
    const bulletCount = 8 + (this.bossType * 2); // Boss 2: 12發, Boss 3: 14發
    for (let i = 0; i < bulletCount; i++) {
      const angle = (i / bulletCount) * Math.PI * 2;
      const tx = this.x + Math.cos(angle) * 500;
      const ty = this.y + Math.sin(angle) * 500;
      
      const bullet = new Bullet(this.scene, this.x, this.y, tx, ty, this.damage);
      if (this.scene.onEnemyShoot) {
        this.scene.onEnemyShoot(bullet);
      }
    }
  }
  
  // 模式 3: 波浪射擊 (只有 Boss 3 有)
  attackWave(targetX, targetY) {
    const waveCount = 5;
    const baseAngle = Math.atan2(targetY - this.y, targetX - this.x);
    
    for (let i = 0; i < waveCount; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        if (!this.active) return;
        const offset = Math.sin(i * 0.5) * 0.5;
        const angle = baseAngle + offset;
        const tx = this.x + Math.cos(angle) * 500;
        const ty = this.y + Math.sin(angle) * 500;
        
        const bullet = new Bullet(this.scene, this.x, this.y, tx, ty, this.damage);
        if (this.scene.onEnemyShoot) {
          this.scene.onEnemyShoot(bullet);
        }
      });
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
    
    // 受傷時畫面震動
    this.scene.cameras.main.shake(80, 0.004);
  }
  
  updateHealthBar() {
    if (!this.hasTakenDamage) return;
    
    const percent = this.health / this.maxHealth;
    this.healthBar.width = (this.size * 2) * percent;
    
    // 根據血量改變顏色
    if (percent > 0.6) {
      this.healthBar.setFillStyle(0xff00ff);
    } else if (percent > 0.3) {
      this.healthBar.setFillStyle(0xff6600);
    } else {
      this.healthBar.setFillStyle(0xff0000);
    }
  }
  
  die() {
    // 死亡動畫
    this.scene.cameras.main.shake(500, 0.02);
    
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 1.5,
      duration: 500,
      onComplete: () => {
        // 清理血量條
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBar) this.healthBar.destroy();
        this.destroy();
      }
    });
    
    // 通知場景 Boss 死亡
    if (this.scene.onEnemyKilled) {
      this.scene.onEnemyKilled(this);
    }
  }
}
