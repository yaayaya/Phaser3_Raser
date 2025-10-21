import Asteroid from '../entities/Asteroid.js';
import { CANVAS } from '../utils/constants.js';

/**
 * 隕石管理系統
 */
export default class AsteroidManager {
  constructor(scene, asteroidConfig) {
    this.scene = scene;
    this.asteroids = [];
    this.spawnTimer = null;
    
    // 隕石設定（如果沒有設定則使用預設值）
    this.config = asteroidConfig || {
      spawnInterval: 1500,
      initialCount: 6,
      sizeRatio: { small: 4, medium: 2, large: 1 }
    };
  }
  
  startSpawning() {
    // 使用關卡設定的生成間隔
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.config.spawnInterval,
      callback: () => this.spawnRandomAsteroid(),
      loop: true
    });
    
    // 立即生成初始數量的隕石
    for (let i = 0; i < this.config.initialCount; i++) {
      this.scene.time.delayedCall(i * 300, () => this.spawnRandomAsteroid());
    }
  }
  
  stopSpawning() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
  }
  
  spawnRandomAsteroid() {
    // 根據關卡設定的比例生成隕石
    const sizes = [];
    const ratio = this.config.sizeRatio;
    
    // 根據比例建立大小陣列
    for (let i = 0; i < ratio.small; i++) sizes.push('small');
    for (let i = 0; i < ratio.medium; i++) sizes.push('medium');
    for (let i = 0; i < ratio.large; i++) sizes.push('large');
    
    const size = Phaser.Utils.Array.GetRandom(sizes);
    
    // 從邊緣隨機生成（速度減半）
    const edge = Phaser.Math.Between(0, 3);
    let x, y, velocityX, velocityY;
    
    switch (edge) {
      case 0: // 上
        x = Phaser.Math.Between(0, CANVAS.WIDTH);
        y = -50;
        velocityX = Phaser.Math.Between(-25, 25);
        velocityY = Phaser.Math.Between(25, 60);
        break;
      case 1: // 右
        x = CANVAS.WIDTH + 50;
        y = Phaser.Math.Between(0, CANVAS.HEIGHT);
        velocityX = Phaser.Math.Between(-60, -25);
        velocityY = Phaser.Math.Between(-25, 25);
        break;
      case 2: // 下
        x = Phaser.Math.Between(0, CANVAS.WIDTH);
        y = CANVAS.HEIGHT + 50;
        velocityX = Phaser.Math.Between(-25, 25);
        velocityY = Phaser.Math.Between(-60, -25);
        break;
      case 3: // 左
        x = -50;
        y = Phaser.Math.Between(0, CANVAS.HEIGHT);
        velocityX = Phaser.Math.Between(25, 60);
        velocityY = Phaser.Math.Between(-25, 25);
        break;
    }
    
    const asteroid = new Asteroid(this.scene, x, y, size, velocityX, velocityY);
    this.asteroids.push(asteroid);
  }
  
  update(delta) {
    // 更新所有隕石
    this.asteroids = this.asteroids.filter(asteroid => asteroid.active);
    
    this.asteroids.forEach(asteroid => {
      asteroid.update(delta);
    });
  }
  
  getAllAsteroids() {
    return this.asteroids;
  }
}
