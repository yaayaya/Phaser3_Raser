import Phaser from 'phaser';
import { SCENES, COLORS } from '../utils/constants.js';
import { formatTime, formatNumber } from '../utils/helpers.js';
import { getGameData } from '../utils/storage.js';

/**
 * 結算場景
 */
export default class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.RESULT });
  }

  init(data) {
    this.resultData = data;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 半透明背景
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    
    // 結算面板
    const panelWidth = 340;
    const panelHeight = 520;
    const panel = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x1a1a2e);
    panel.setStrokeStyle(3, this.resultData.isVictory ? 0x00ff00 : 0xff0000);
    
    // 標題
    const titleColor = this.resultData.isVictory ? COLORS.SUCCESS : COLORS.DANGER;
    const titleText = this.resultData.isVictory ? '🎉 勝利！' : '💀 失敗';
    const title = this.add.text(width / 2, height / 2 - 220, titleText, {
      font: 'bold 36px Arial',
      fill: titleColor
    });
    title.setOrigin(0.5);
    
    // 訊息
    const message = this.add.text(width / 2, height / 2 - 170, this.resultData.message, {
      font: '18px Arial',
      fill: COLORS.TEXT
    });
    message.setOrigin(0.5);
    
    // 統計資訊
    const stats = [
      `關卡時間: ${formatTime(this.resultData.elapsedTime)}`,
      `剩餘時間: ${formatTime(this.resultData.remainingTime)}`,
      `擊敗敵人: ${this.resultData.enemiesKilled}`,
      `拾取道具: ${this.resultData.powerUpsCollected}`
    ];
    
    const statsText = this.add.text(width / 2, height / 2 - 130, stats.join('\n'), {
      font: '16px Arial',
      fill: COLORS.TEXT,
      align: 'center',
      lineSpacing: 10
    });
    statsText.setOrigin(0.5, 0);
    
    // 獎勵計算（只有勝利才顯示）
    if (this.resultData.isVictory) {
      this.showRewardCalculation(width, height);
    } else {
      // 失敗時顯示獲得的代幣
      const failCoins = this.add.text(width / 2, height / 2 + 30, `獲得代幣: ${formatNumber(this.resultData.coinsEarned)}`, {
        font: 'bold 20px Arial',
        fill: COLORS.WARNING
      });
      failCoins.setOrigin(0.5);
    }
    
    // 按鈕
    this.createButtons(width, height);
  }
  
  showRewardCalculation(width, height) {
    const baseReward = this.resultData.coinsEarned;
    const completionReward = this.resultData.levelConfig.rewards.completion;
    const timeReward = Math.floor(this.resultData.remainingTime * this.resultData.levelConfig.rewards.timeBonus);
    const subtotal = baseReward + completionReward + timeReward;
    
    const coinMultiplier = this.resultData.upgrades.coinMultiplier || 0;
    const multiplier = 1 + (coinMultiplier * 0.1);
    const finalReward = Math.floor(subtotal * multiplier);
    
    const rewards = [
      { label: '基礎獎勵', value: baseReward, color: COLORS.TEXT },
      { label: '通關獎勵', value: completionReward, color: COLORS.SUCCESS },
      { label: '時間獎勵', value: timeReward, color: COLORS.WARNING },
      { label: '小計', value: subtotal, color: COLORS.PRIMARY },
      { label: `倍率加成 (×${multiplier.toFixed(1)})`, value: '', color: COLORS.SECONDARY },
      { label: '總計', value: finalReward, color: COLORS.WARNING, isFinal: true }
    ];
    
    let yOffset = -20;
    rewards.forEach((reward, index) => {
      const y = height / 2 + yOffset;
      
      const label = this.add.text(width / 2 - 150, y, reward.label, {
        font: reward.isFinal ? 'bold 18px Arial' : '14px Arial',
        fill: reward.color
      });
      
      if (reward.value !== '') {
        const value = this.add.text(width / 2 + 150, y, formatNumber(reward.value), {
          font: reward.isFinal ? 'bold 20px Arial' : '14px Arial',
          fill: reward.color
        });
        value.setOrigin(1, 0);
      }
      
      yOffset += reward.isFinal ? 50 : 30;
      
      // 在小計後加分隔線
      if (reward.label === '小計') {
        const line = this.add.rectangle(width / 2, y + 15, 300, 2, 0x666666);
        yOffset += 10;
      }
    });
  }
  
  createButtons(width, height) {
    const buttonY = height / 2 + 220;
    
    if (this.resultData.isVictory) {
      // 勝利：下一關 / 返回主選單
      this.createButton(width / 2 - 80, buttonY, '下一關', () => {
        const gameData = getGameData();
        const nextLevel = this.resultData.levelId + 1;
        if (gameData.levels.unlocked.includes(nextLevel)) {
          this.scene.start(SCENES.GAME, { levelId: nextLevel });
        } else {
          this.scene.start(SCENES.LEVEL_SELECT);
        }
      });
      
      this.createButton(width / 2 + 80, buttonY, '返回主選單', () => {
        this.scene.start(SCENES.MAIN_MENU);
      });
    } else {
      // 失敗：重試 / 返回主選單
      this.createButton(width / 2 - 80, buttonY, '重試', () => {
        this.scene.start(SCENES.GAME, { levelId: this.resultData.levelId });
      });
      
      this.createButton(width / 2 + 80, buttonY, '返回主選單', () => {
        this.scene.start(SCENES.MAIN_MENU);
      });
    }
  }
  
  createButton(x, y, text, callback) {
    const button = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 140, 45, 0x00ffff, 0.2);
    bg.setStrokeStyle(2, 0x00ffff);
    
    const label = this.add.text(0, 0, text, {
      font: 'bold 16px Arial',
      fill: COLORS.PRIMARY
    });
    label.setOrigin(0.5);
    
    button.add([bg, label]);
    button.setSize(140, 45);
    button.setInteractive({ useHandCursor: true });
    
    button.on('pointerover', () => {
      bg.setFillStyle(0x00ffff, 0.4);
    });
    
    button.on('pointerout', () => {
      bg.setFillStyle(0x00ffff, 0.2);
    });
    
    button.on('pointerup', () => {
      callback();
    });
    
    return button;
  }
}
