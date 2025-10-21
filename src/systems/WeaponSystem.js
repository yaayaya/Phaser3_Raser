import { WEAPON, CANVAS } from '../utils/constants.js';

/**
 * 武器系統
 */
export default class WeaponSystem {
  constructor(scene, player, upgrades) {
    this.scene = scene;
    this.player = player;
    this.upgrades = upgrades;
    this.laserGraphics = scene.add.graphics();
    this.currentTargets = [];
  }
  
  update(delta, enemiesInRange) {
    // 清除之前的雷射
    this.laserGraphics.clear();
    
    if (enemiesInRange.length === 0) {
      this.currentTargets = [];
      return;
    }
    
    // 依距離排序
    enemiesInRange.sort((a, b) => {
      const distA = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, a.x, a.y
      );
      const distB = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, b.x, b.y
      );
      return distA - distB;
    });
    
    // 選取最近的 N 個目標
    const maxTargets = this.player.attackCount;
    this.currentTargets = enemiesInRange.slice(0, maxTargets);
    
    // 對每個目標造成傷害並繪製雷射
    const damagePerFrame = this.player.attackDamage / 60; // 每秒傷害 / 60 FPS
    
    this.currentTargets.forEach(target => {
      if (!target.active) return;
      
      // 造成傷害
      target.takeDamage(damagePerFrame);
      
      // 繪製雷射
      this.drawLaser(this.player.x, this.player.y, target.x, target.y);
    });
  }
  
  drawLaser(x1, y1, x2, y2) {
    // 限制雷射終點在螢幕範圍內
    let endX = x2;
    let endY = y2;
    
    // 計算方向向量
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      // 檢查是否超出範圍，如果超出則計算交點
      let maxDist = distance;
      
      // 檢查左邊界
      if (endX < 0) {
        const t = -x1 / dirX;
        maxDist = Math.min(maxDist, t);
      }
      // 檢查右邊界
      if (endX > CANVAS.WIDTH) {
        const t = (CANVAS.WIDTH - x1) / dirX;
        maxDist = Math.min(maxDist, t);
      }
      // 檢查上邊界
      if (endY < 0) {
        const t = -y1 / dirY;
        maxDist = Math.min(maxDist, t);
      }
      // 檢查下邊界
      if (endY > CANVAS.HEIGHT) {
        const t = (CANVAS.HEIGHT - y1) / dirY;
        maxDist = Math.min(maxDist, t);
      }
      
      // 計算最終終點
      endX = x1 + dirX * maxDist;
      endY = y1 + dirY * maxDist;
    }
    
    this.laserGraphics.lineStyle(WEAPON.LASER.WIDTH, WEAPON.LASER.COLOR, WEAPON.LASER.ALPHA);
    this.laserGraphics.beginPath();
    this.laserGraphics.moveTo(x1, y1);
    this.laserGraphics.lineTo(endX, endY);
    this.laserGraphics.strokePath();
    
    // 雷射起點光暈
    this.laserGraphics.fillStyle(WEAPON.LASER.COLOR, 0.3);
    this.laserGraphics.fillCircle(x1, y1, 5);
    
    // 雷射終點光暈
    this.laserGraphics.fillStyle(WEAPON.LASER.COLOR, 0.5);
    this.laserGraphics.fillCircle(endX, endY, 8);
  }
  
  destroy() {
    this.laserGraphics.destroy();
  }
}
