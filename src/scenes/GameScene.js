import Phaser from 'phaser';
import { SCENES, CANVAS, PLAYER, GAME, VIRTUAL_JOYSTICK } from '../utils/constants.js';
import { getGameData, updateCoins, unlockLevel, completeLevel, getSetting } from '../utils/storage.js';
import Player from '../entities/Player.js';
import EnemyManager from '../systems/EnemyManager.js';
import WeaponSystem from '../systems/WeaponSystem.js';
import PowerUpSystem from '../systems/PowerUpSystem.js';
import AsteroidManager from '../systems/AsteroidManager.js';
import VirtualJoystick from '../ui/VirtualJoystick.js';

/**
 * 主遊戲場景
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  init(data) {
    this.levelId = data.levelId || 1;
    this.gameData = getGameData();
    
    // 初始化子彈陣列
    this.bullets = [];
  }

  create() {
    // 初始化遊戲狀態
    this.isGameOver = false;
    this.isPaused = false;
    this.coinsEarned = 0;
    this.enemiesKilled = 0;
    this.powerUpsCollected = 0;
    this.startTime = Date.now();
    
    // 取得關卡設定（暫時使用固定值）
    this.levelConfig = this.getLevelConfig();
    
    // 初始化時間
    const initialTimeBonus = this.gameData.upgrades.initialTime * 5;
    this.remainingTime = this.levelConfig.baseTime + initialTimeBonus;
    
    // 建立玩家
    this.player = new Player(this, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2, this.gameData.upgrades);
    
    // 建立敵人管理器
    this.enemyManager = new EnemyManager(this, this.levelConfig);
    
    // 建立武器系統
    this.weaponSystem = new WeaponSystem(this, this.player, this.gameData.upgrades);
    
    // 建立道具系統
    this.powerUpSystem = new PowerUpSystem(this);
    
    // 建立隕石管理器（傳入關卡的隕石設定）
    this.asteroidManager = new AsteroidManager(this, this.levelConfig.asteroids);
    
    // 啟動 UI 場景
    this.scene.launch(SCENES.UI, {
      remainingTime: this.remainingTime,
      player: this.player,
      coins: this.coinsEarned
    });
    
    // 設定鍵盤輸入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey('W'),
      down: this.input.keyboard.addKey('S'),
      left: this.input.keyboard.addKey('A'),
      right: this.input.keyboard.addKey('D')
    };
    
    // 建立虛擬搖桿（手機設備）
    this.setupVirtualJoystick();
    
    // 開始生成敵人
    this.enemyManager.startSpawning();
    
    // 開始生成道具
    this.powerUpSystem.startSpawning();
    
    // 開始生成隕石（使用關卡設定的參數）
    this.asteroidManager.startSpawning();
    
    // Boss 生成計時器
    this.time.delayedCall(this.levelConfig.bossSpawnTime * 1000, () => {
      this.enemyManager.spawnBoss();
    });
  }
  
  // 敵人射擊回調
  onEnemyShoot(bullet) {
    this.bullets.push(bullet);
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;
    
    // 更新時間
    this.remainingTime -= delta / 1000;
    if (this.remainingTime <= 0) {
      this.remainingTime = 0;
      this.gameOver(false, '時間到！');
      return;
    }
    
    // 更新玩家
    const movement = this.getMovementInput();
    this.player.update(delta, movement);
    
    // 檢查玩家生命值
    if (this.player.health <= 0) {
      this.gameOver(false, 'HP 歸 0！');
      return;
    }
    
    // 更新敵人
    this.enemyManager.update(delta);
    
    // 更新隕石
    this.asteroidManager.update(delta);
    
    // 更新子彈
    this.updateBullets(delta);
    
    // 處理玩家與敵人碰撞（移除，因為敵人不再接近）
    // this.handlePlayerEnemyCollision();
    
    // 處理玩家與隕石碰撞
    this.handlePlayerAsteroidCollision();
    
    // 處理玩家與子彈碰撞
    this.handlePlayerBulletCollision();
    
    // 更新武器系統（目標包含敵人和隕石）
    const enemies = this.enemyManager.getEnemiesInRange(
      this.player.x,
      this.player.y,
      this.player.attackRange
    );
    const asteroids = this.asteroidManager.getAllAsteroids().filter(asteroid => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        asteroid.x, asteroid.y
      );
      return distance <= this.player.attackRange;
    });
    const targets = [...enemies, ...asteroids];
    this.weaponSystem.update(delta, targets);
    
    // 更新道具系統
    this.powerUpSystem.update(delta);
    
    // 處理玩家拾取道具
    this.handlePowerUpCollection();
    
    // 檢查 Boss 是否被擊敗
    if (this.enemyManager.isBossDefeated()) {
      this.gameOver(true, '勝利！');
      return;
    }
    
    // 更新 UI
    this.updateUI();
  }
  
  getMovementInput() {
    const movement = { x: 0, y: 0 };
    
    // 鍵盤輸入
    if (this.cursors.left.isDown || this.wasd.left.isDown) movement.x = -1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) movement.x = 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) movement.y = -1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) movement.y = 1;
    
    // 虛擬搖桿輸入
    if (this.virtualJoystick && this.virtualJoystick.isActive()) {
      const joystickDirection = this.virtualJoystick.getDirection();
      const force = this.virtualJoystick.getForce();
      movement.x = joystickDirection.x * force;
      movement.y = joystickDirection.y * force;
    }
    
    return movement;
  }
  
  setupVirtualJoystick() {
    // 檢測是否為觸控裝置
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
      // 取得UI顯示設定
      const showJoystickUI = getSetting('showVirtualJoystick', false);
      
      // 建立虛擬搖桿
      this.virtualJoystick = new VirtualJoystick(this, 0, 0, {
        baseRadius: showJoystickUI ? 45 : 0,
        stickRadius: showJoystickUI ? 20 : 0,
        maxDistance: 999,
        deadZone: 0.05,
        alpha: showJoystickUI ? 0.7 : 0,
        showUI: showJoystickUI
      });
      
      // 設定全螢幕觸控
      this.input.on('pointerdown', (pointer) => {
        this.virtualJoystick.startDrag(pointer);
      });
      
      // 如果開啟UI，在左下角顯示搖桿
      if (showJoystickUI) {
        const joystickX = 80;
        const joystickY = CANVAS.ACTUAL_HEIGHT - 80;
        this.virtualJoystick.setPosition(joystickX, joystickY);
        this.virtualJoystick.setVisible(true);
      }
    }
  }
  
  
  handlePlayerEnemyCollision() {
    const enemies = this.enemyManager.getAllEnemies();
    const now = Date.now();
    
    enemies.forEach(enemy => {
      if (!enemy.active) return;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      
      const minDistance = (this.player.size + enemy.size) / 2;
      
      if (distance < minDistance) {
        // 檢查冷卻時間
        if (!this.player.lastDamageTime || now - this.player.lastDamageTime > GAME.COLLISION_DAMAGE_COOLDOWN) {
          this.player.takeDamage(enemy.damage);
          this.player.lastDamageTime = now;
          
          // 視覺回饋
          this.cameras.main.shake(100, 0.005);
        }
      }
    });
  }
  
  handlePowerUpCollection() {
    const powerUps = this.powerUpSystem.getAllPowerUps();
    
    powerUps.forEach(powerUp => {
      if (!powerUp.active) return;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        powerUp.x, powerUp.y
      );
      
      if (distance < 40) {
        // 拾取道具
        if (powerUp.type === 'time') {
          this.remainingTime += powerUp.value;
          this.powerUpsCollected++;
        }
        powerUp.destroy();
      }
    });
  }
  
  onEnemyKilled(enemy) {
    this.coinsEarned += enemy.reward;
    this.enemiesKilled++;
  }
  
  onAsteroidDestroyed(asteroid) {
    this.coinsEarned += asteroid.reward;
    this.enemiesKilled++; // 計入擊殺數
  }
  
  updateBullets(delta) {
    // 更新所有子彈
    this.bullets = this.bullets.filter(bullet => bullet.active);
    this.bullets.forEach(bullet => bullet.update(delta));
  }
  
  handlePlayerAsteroidCollision() {
    const asteroids = this.asteroidManager.getAllAsteroids();
    const now = Date.now();
    
    asteroids.forEach(asteroid => {
      if (!asteroid.active) return;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        asteroid.x, asteroid.y
      );
      
      const minDistance = (this.player.size + asteroid.size) / 2;
      
      if (distance < minDistance) {
        // 檢查冷却時間
        if (!this.player.lastDamageTime || now - this.player.lastDamageTime > GAME.COLLISION_DAMAGE_COOLDOWN) {
          this.player.takeDamage(asteroid.damage);
          this.player.lastDamageTime = now;
          
          // 視覺回饋 - 增強震動
          this.cameras.main.shake(150, 0.008);
        }
      }
    });
  }
  
  handlePlayerBulletCollision() {
    const now = Date.now();
    
    this.bullets.forEach(bullet => {
      if (!bullet.active) return;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        bullet.x, bullet.y
      );
      
      const minDistance = (this.player.size + bullet.size) / 2;
      
      if (distance < minDistance) {
        // 檢查冷却時間
        if (!this.player.lastDamageTime || now - this.player.lastDamageTime > GAME.COLLISION_DAMAGE_COOLDOWN) {
          this.player.takeDamage(bullet.damage);
          this.player.lastDamageTime = now;
          
          // 視覺回饋 - 增強震動
          this.cameras.main.shake(150, 0.008);
          
          // 銷毀子彈
          bullet.destroy();
        }
      }
    });
  }
  
  updateUI() {
    const uiScene = this.scene.get(SCENES.UI);
    if (uiScene) {
      uiScene.updateTime(this.remainingTime);
      uiScene.updateHealth(this.player.health, this.player.maxHealth);
      uiScene.updateCoins(this.coinsEarned);
    }
  }
  
  gameOver(isVictory, message) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    
    // 停止生成
    this.enemyManager.stopSpawning();
    this.powerUpSystem.stopSpawning();
    this.asteroidManager.stopSpawning();
    
    // 計算遊戲時間
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    
    // 計算結算資料
    const resultData = {
      isVictory,
      message,
      levelId: this.levelId,
      elapsedTime,
      remainingTime: this.remainingTime,
      coinsEarned: this.coinsEarned,
      enemiesKilled: this.enemiesKilled,
      powerUpsCollected: this.powerUpsCollected,
      upgrades: this.gameData.upgrades,
      levelConfig: this.levelConfig
    };
    
    // 儲存獎勵
    if (isVictory) {
      // 勝利時計算完整獎勵（基礎 + 通關 + 時間）
      const baseReward = this.coinsEarned;
      const completionReward = this.levelConfig.rewards.completion;
      const timeReward = Math.floor(this.remainingTime * this.levelConfig.rewards.timeBonus);
      const subtotal = baseReward + completionReward + timeReward;
      
      const coinMultiplier = this.gameData.upgrades.coinMultiplier || 0;
      const multiplier = 1 + (coinMultiplier * 0.1);
      const finalReward = Math.floor(subtotal * multiplier);
      
      // 儲存最終獎勵
      updateCoins(finalReward);
      completeLevel(this.levelId, elapsedTime);
      unlockLevel(this.levelId + 1);
    } else {
      // 失敗時只儲存基礎獎勵（擊殺敵人獲得的代幣）
      if (this.coinsEarned > 0) {
        updateCoins(this.coinsEarned);
      }
    }
    
    // 切換到結算場景
    this.time.delayedCall(1000, () => {
      this.scene.stop(SCENES.UI);
      this.scene.start(SCENES.RESULT, resultData);
    });
  }
  
  getLevelConfig() {
    // 暫時使用固定關卡設定
    const configs = {
      1: {
        baseTime: 30,
        bossSpawnTime: 15,
        enemies: [
          {
            type: 'basic',
            spawnRate: 2500,
            speed: 80,
            health: 40,
            reward: 8,
            damage: 1
          }
        ],
        rewards: {
          completion: 50,
          timeBonus: 2
        }
      },
      2: {
        baseTime: 30,
        bossSpawnTime: 15,
        enemies: [
          {
            type: 'basic',
            spawnRate: 2000,
            speed: 90,
            health: 50,
            reward: 10,
            damage: 1
          },
          {
            type: 'fast',
            spawnRate: 3500,
            speed: 140,
            health: 30,
            reward: 15,
            damage: 1
          }
        ],
        rewards: {
          completion: 80,
          timeBonus: 3
        }
      },
      3: {
        baseTime: 30,
        bossSpawnTime: 15,
        enemies: [
          {
            type: 'basic',
            spawnRate: 1800,
            speed: 100,
            health: 60,
            reward: 12,
            damage: 1
          },
          {
            type: 'tank',
            spawnRate: 4500,
            speed: 50,
            health: 150,
            reward: 25,
            damage: 1
          }
        ],
        rewards: {
          completion: 120,
          timeBonus: 4
        }
      }
    };
    
    return configs[this.levelId] || configs[1];
  }
}
