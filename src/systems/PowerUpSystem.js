import PowerUp from '../entities/PowerUp.js';
import { CANVAS, GAME } from '../utils/constants.js';
import { randomInt } from '../utils/helpers.js';

/**
 * 道具系統
 */
export default class PowerUpSystem {
  constructor(scene) {
    this.scene = scene;
    this.powerUps = [];
    this.spawnTimer = null;
  }
  
  startSpawning() {
    this.spawnTimer = this.scene.time.addEvent({
      delay: GAME.POWERUP_SPAWN_INTERVAL,
      callback: () => {
        this.spawnPowerUp();
      },
      loop: true
    });
  }
  
  stopSpawning() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
  }
  
  spawnPowerUp() {
    // 暫時只生成時間道具
    const type = 'time';
    const value = 15; // 增加 15 秒
    
    // 在畫面中央區域隨機生成
    const padding = GAME.POWERUP_SPAWN_PADDING;
    const x = randomInt(padding, CANVAS.WIDTH - padding);
    const y = randomInt(padding, CANVAS.HEIGHT - padding);
    
    const powerUp = new PowerUp(this.scene, x, y, type, value);
    this.powerUps.push(powerUp);
  }
  
  update(delta) {
    // 更新所有道具
    this.powerUps = this.powerUps.filter(powerUp => powerUp.active);
    
    this.powerUps.forEach(powerUp => {
      powerUp.update();
    });
  }
  
  getAllPowerUps() {
    return this.powerUps;
  }
}
