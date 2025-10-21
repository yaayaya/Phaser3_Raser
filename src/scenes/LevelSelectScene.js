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
    
    // 建立滾動容器
    this.scrollContainer = this.add.container(0, 0);
    
    // 標題（固定在頂部，不滾動）
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
      { id: 6, name: '終極審判', difficulty: '煉獄' },
      { id: 7, name: '無盡深淵', difficulty: 'nightmare' },
      { id: 8, name: '毀滅之源', difficulty: 'inferno' },
      { id: 9, name: '永恆試煉', difficulty: 'chaos' },
      { id: 10, name: '終極審判', difficulty: 'ultimate' }
    ];
    
    const startY = 80; // 從標題下方開始
    const spacing = 110;
    const cardHeight = 110;
    
    // 計算內容總高度
    const contentHeight = levels.length * spacing + cardHeight;
    const viewportHeight = height - 120; // 扣掉標題和底部按鈕的空間
    
    // 建立關卡卡片
    levels.forEach((level, index) => {
      const y = startY + index * spacing;
      this.createLevelCard(width / 2, y, level);
    });
    
    // 設定滾動功能
    this.setupScrolling(contentHeight, viewportHeight);
    
    // 返回按鈕（固定在底部）
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
      level.difficulty === '入門' ? COLORS.SUCCESS :
      level.difficulty === '挑戰' ? COLORS.WARNING :
      level.difficulty === '困難' ? COLORS.DANGER :
      level.difficulty === '極難' ? '#ff3366' :
      level.difficulty === '地獄' ? '#cc0033' :
      level.difficulty === '煉獄' ? '#990022' :
      '#660011'; // 更高難度
    
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
    
    // 加入滾動容器
    this.scrollContainer.add(container);
    
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
  
  setupScrolling(contentHeight, viewportHeight) {
    // 只有在內容超過視窗高度時才啟用滾動
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    
    if (maxScroll <= 0) {
      return; // 不需要滾動
    }
    
    // 滾動變數
    let isDragging = false;
    let startY = 0;
    let startScrollY = 0;
    
    // 觸控/滑鼠滾動
    this.input.on('pointerdown', (pointer) => {
      isDragging = true;
      startY = pointer.y;
      startScrollY = this.scrollContainer.y;
    });
    
    this.input.on('pointermove', (pointer) => {
      if (!isDragging) return;
      
      const deltaY = pointer.y - startY;
      const newScrollY = startScrollY + deltaY;
      
      // 限制滾動範圍
      this.scrollContainer.y = Phaser.Math.Clamp(newScrollY, -maxScroll, 0);
    });
    
    this.input.on('pointerup', () => {
      isDragging = false;
    });
    
    // 滾輪支援（桌面）
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      const scrollSpeed = 3;
      const newScrollY = this.scrollContainer.y - deltaY * scrollSpeed;
      this.scrollContainer.y = Phaser.Math.Clamp(newScrollY, -maxScroll, 0);
    });
    
    // 添加滾動指示器
    this.createScrollIndicators(maxScroll);
  }
  
  createScrollIndicators(maxScroll) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 滾動軌道
    const trackHeight = height - 160; // 扣掉頂部和底部空間
    const trackX = width - 15;
    const trackY = 80;
    
    const track = this.add.rectangle(trackX, trackY + trackHeight / 2, 6, trackHeight, 0x333333, 0.5);
    
    // 滾動條
    const thumbHeight = Math.max(20, (trackHeight * trackHeight) / (trackHeight + maxScroll));
    this.scrollThumb = this.add.rectangle(trackX, trackY, 10, thumbHeight, 0x666666, 0.8);
    
    // 更新滾動條位置
    this.updateScrollThumb = () => {
      if (maxScroll > 0) {
        const scrollProgress = Math.abs(this.scrollContainer.y) / maxScroll;
        const thumbY = trackY + (scrollProgress * (trackHeight - thumbHeight));
        this.scrollThumb.y = thumbY;
      }
    };
    
    // 綁定滾動更新
    this.scrollContainer.on('update', this.updateScrollThumb);
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
