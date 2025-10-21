import Phaser from 'phaser';
import { SCENES, COLORS } from '../utils/constants.js';
import { getGameData } from '../utils/storage.js';

/**
 * 關卡選擇場景
 */
export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.LEVEL_SELECT });
  }

  create() {
    this.gameData = getGameData();
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 標題
    const title = this.add.text(width / 2, 40, '選擇關卡', {
      font: 'bold 32px Arial',
      fill: COLORS.PRIMARY
    });
    title.setOrigin(0.5);
    
    // 關卡資料
    const levels = [
      { id: 1, name: '初始試煉', difficulty: '入門' },
      { id: 2, name: '隕石風暴', difficulty: '挑戰' },
      { id: 3, name: '終極挑戰', difficulty: '困難' },
      { id: 4, name: '深淵試煉', difficulty: '極難' },
      { id: 5, name: '終極毀滅', difficulty: '地獄' },
      { id: 6, name: '終極審判', difficulty: '煉獄' }
    ];
    
    const startY = 120;
    const spacing = 110;
    
    levels.forEach((level, index) => {
      const y = startY + index * spacing;
      this.createLevelCard(width / 2, y, level);
    });
    
    // 返回按鈕
    this.createBackButton();
  }
  
  createLevelCard(x, y, level) {
    const isUnlocked = this.gameData.levels.unlocked.includes(level.id);
    const isCompleted = this.gameData.levels.completed.includes(level.id);
    const bestTime = this.gameData.levels.bestTimes[level.id];
    
    const container = this.add.container(x, y);
    
    // 卡片背景
    const bg = this.add.rectangle(0, 0, 340, 110, isUnlocked ? 0x1a1a2e : 0x2a2a2a);
    bg.setStrokeStyle(2, isUnlocked ? 0x00ffff : 0x666666);
    
    // 關卡編號
    const numberBg = this.add.circle(-140, 0, 35, isCompleted ? 0x00ff00 : 0x00ffff, 0.3);
    const number = this.add.text(-140, 0, level.id.toString(), {
      font: 'bold 28px Arial',
      fill: isCompleted ? COLORS.SUCCESS : COLORS.PRIMARY
    });
    number.setOrigin(0.5);
    
    // 關卡名稱
    const name = this.add.text(-90, -25, level.name, {
      font: 'bold 20px Arial',
      fill: isUnlocked ? COLORS.TEXT : COLORS.TEXT_DISABLED
    });
    
    // 難度
    const difficultyColor = 
      level.difficulty === '簡單' ? COLORS.SUCCESS :
      level.difficulty === '普通' ? COLORS.WARNING :
      COLORS.DANGER;
    
    const difficulty = this.add.text(-90, 10, `難度: ${level.difficulty}`, {
      font: '16px Arial',
      fill: difficultyColor
    });
    
    // 最佳成績
    if (bestTime) {
      const mins = Math.floor(bestTime / 60);
      const secs = Math.floor(bestTime % 60);
      const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
      const bestTimeText = this.add.text(220, 0, `⭐ 最佳: ${timeStr}`, {
        font: '16px Arial',
        fill: COLORS.WARNING
      });
      bestTimeText.setOrigin(1, 0.5);
      container.add(bestTimeText);
    }
    
    // 鎖定狀態
    if (!isUnlocked) {
      const lockIcon = this.add.text(250, 0, '🔒', {
        font: '32px Arial'
      });
      lockIcon.setOrigin(0.5);
      container.add(lockIcon);
    }
    
    container.add([bg, numberBg, number, name, difficulty]);
    
    // 如果解鎖，可以點擊
    if (isUnlocked) {
      container.setSize(340, 110);
      container.setInteractive({ useHandCursor: true });
      
      container.on('pointerover', () => {
        bg.setFillStyle(0x2a2a3e);
        bg.setStrokeStyle(3, 0x00ff00);
      });
      
      container.on('pointerout', () => {
        bg.setFillStyle(0x1a1a2e);
        bg.setStrokeStyle(2, 0x00ffff);
      });
      
      container.on('pointerup', () => {
        this.startLevel(level.id);
      });
    }
  }
  
  startLevel(levelId) {
    this.scene.start(SCENES.GAME, { levelId });
  }
  
  createBackButton() {
    const height = this.cameras.main.height;
    
    const backBtn = this.add.text(60, height - 40, '← 返回主選單', {
      font: 'bold 20px Arial',
      fill: COLORS.PRIMARY
    });
    backBtn.setInteractive({ useHandCursor: true });
    
    backBtn.on('pointerover', () => {
      backBtn.setStyle({ fill: COLORS.SECONDARY });
    });
    
    backBtn.on('pointerout', () => {
      backBtn.setStyle({ fill: COLORS.PRIMARY });
    });
    
    backBtn.on('pointerup', () => {
      this.scene.start(SCENES.MAIN_MENU);
    });
  }
}
