import Phaser from 'phaser';

/**
 * 子彈類別（敵人發射的）
 */
export default class Bullet extends Phaser.GameObjects.Container {
  constructor(scene, x, y, targetX, targetY, damage = 1) {
    super(scene, x, y);
    
    this.damage = damage;
    this.speed = 200;
    this.size = 8;
    
    // 計算方向
    const angle = Math.atan2(targetY - y, targetX - x);
    this.velocityX = Math.cos(angle) * this.speed;
    this.velocityY = Math.sin(angle) * this.speed;
    
    // 建立圖形
    this.createGraphics();
    
    // 加入場景
    scene.add.existing(this);
    
    // 3秒後自動銷毀
    scene.time.delayedCall(3000, () => {
      if (this.active) this.destroy();
    });
  }
  
  createGraphics() {
    // 子彈本體（紅色圓形）
    const circle = this.scene.add.circle(0, 0, this.size / 2, 0xff3333);
    this.add(circle);
    
    // 發光效果
    const glow = this.scene.add.circle(0, 0, this.size, 0xff6666, 0.3);
    this.add(glow);
  }
  
  update(delta) {
    if (!this.active) return;
    
    // 移動子彈
    const speed = (delta / 1000);
    this.x += this.velocityX * speed;
    this.y += this.velocityY * speed;
    
    // 超出邊界則銷毀
    if (this.x < -50 || this.x > this.scene.cameras.main.width + 50 ||
        this.y < -50 || this.y > this.scene.cameras.main.height + 50) {
      this.destroy();
    }
  }
}
