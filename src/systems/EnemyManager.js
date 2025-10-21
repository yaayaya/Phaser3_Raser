import Enemy from '../entities/Enemy.js';
import Boss from '../entities/Boss.js';
import { getRandomSpawnPosition } from '../utils/helpers.js';
import { CANVAS, GAME } from '../utils/constants.js';

/**
 * 敵人管理系統
 */
export default class EnemyManager {
  constructor(scene, levelConfig) {
    this.scene = scene;
    this.levelConfig = levelConfig;
    this.enemies = [];
    this.spawnTimers = [];
    this.boss = null;
    this.bossDefeated = false;
  }
  
  startSpawning() {
    // 為每種敵人類型建立生成計時器
    this.levelConfig.enemies.forEach(enemyConfig => {
      const timer = this.scene.time.addEvent({
        delay: enemyConfig.spawnRate,
        callback: () => {
          if (this.enemies.length < GAME.MAX_ENEMIES) {
            this.spawnEnemy(enemyConfig);
          }
        },
        loop: true
      });
      this.spawnTimers.push(timer);
    });
  }
  
  stopSpawning() {
    this.spawnTimers.forEach(timer => timer.destroy());
    this.spawnTimers = [];
  }
  
  spawnEnemy(config) {
    const pos = getRandomSpawnPosition(CANVAS.WIDTH, CANVAS.HEIGHT, GAME.SPAWN_EDGE_PADDING);
    
    // 檢查是否為 Boss 類型敵人（關卡6會將Boss當小怪生成）
    if (config.type && config.type.includes('pattern-boss')) {
      const bossType = config.bossType || 3;
      const enemy = new Boss(this.scene, pos.x, pos.y, bossType);
      // 覆蓋血量和獎勵
      enemy.maxHealth = config.health || enemy.maxHealth;
      enemy.health = enemy.maxHealth;
      enemy.reward = config.reward || enemy.reward;
      this.enemies.push(enemy);
    } else {
      const enemy = new Enemy(this.scene, pos.x, pos.y, config.type, config);
      this.enemies.push(enemy);
    }
  }
  
  spawnBoss() {
    if (this.boss) return;
    
    // 檢查是否使用新的 Boss 類型
    const bossConfig = this.levelConfig.boss || {};
    const bossType = bossConfig.bossType || 1;
    
    if (bossConfig.type && (bossConfig.type.includes('pattern-boss') || bossConfig.type.includes('ultimate-boss'))) {
      // 使用 Pattern Boss 或終極 Boss
      this.boss = new Boss(this.scene, CANVAS.WIDTH / 2, -100, bossType);
      // 覆蓋配置
      if (bossConfig.health) {
        this.boss.maxHealth = bossConfig.health;
        this.boss.health = bossConfig.health;
      }
      if (bossConfig.reward) this.boss.reward = bossConfig.reward;
      if (bossConfig.speed) this.boss.speed = bossConfig.speed;
    } else {
      // 使用舊的普通 Boss
      const oldBossConfig = {
        type: 'boss',
        speed: bossConfig.speed || 50,
        health: bossConfig.health || 400,
        reward: bossConfig.reward || 100,
        damage: bossConfig.damage || 1
      };
      this.boss = new Enemy(this.scene, CANVAS.WIDTH / 2, -100, 'boss', oldBossConfig);
    }
    
    this.enemies.push(this.boss);
    
    // Boss 出現特效
    this.scene.cameras.main.shake(300, 0.01);
  }
  
  update(delta) {
    // 更新所有敵人
    this.enemies = this.enemies.filter(enemy => enemy.active);
    
    this.enemies.forEach(enemy => {
      if (this.scene.player) {
        enemy.update(delta, this.scene.player.x, this.scene.player.y);
      }
    });
    
    // 檢查 Boss 狀態
    if (this.boss && !this.boss.active) {
      this.bossDefeated = true;
    }
  }
  
  getEnemiesInRange(x, y, range) {
    return this.enemies.filter(enemy => {
      if (!enemy.active) return false;
      const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      return distance <= range;
    });
  }
  
  getAllEnemies() {
    return this.enemies;
  }
  
  isBossDefeated() {
    return this.bossDefeated;
  }
}
