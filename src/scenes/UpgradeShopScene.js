import Phaser from 'phaser';
import { SCENES, COLORS, UPGRADES, PLAYER } from '../utils/constants.js';
import { getGameData, updateUpgrade, updateCoins, saveGameData } from '../utils/storage.js';
import { calculateUpgradePrice, formatNumber } from '../utils/helpers.js';

/**
 * 升級商店場景
 */
export default class UpgradeShopScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.UPGRADE_SHOP });
  }

  create() {
    this.gameData = getGameData();
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 標題
    const title = this.add.text(width / 2, 40, '升級商店', {
      font: 'bold 32px Arial',
      fill: COLORS.PRIMARY
    });
    title.setOrigin(0.5);
    
    // 代幣顯示
    this.coinsText = this.add.text(width / 2, 80, `💰 代幣: ${formatNumber(this.gameData.coins)}`, {
      font: 'bold 20px Arial',
      fill: COLORS.WARNING
    });
    this.coinsText.setOrigin(0.5);
    
    // 升級卡片
    this.createUpgradeCards();
    
    // 返回按鈕
    this.createBackButton();
  }
  
  createUpgradeCards() {
    const upgradeConfigs = [
      { id: 'moveSpeed', name: '移動速度', desc: '提升玩家移動速度', icon: '🏃', config: UPGRADES.MOVE_SPEED },
      { id: 'attackRange', name: '攻擊範圍', desc: '增加武器鎖定距離', icon: '🎯', config: UPGRADES.ATTACK_RANGE },
      { id: 'attackCount', name: '攻擊數量', desc: '同時攻擊多個目標', icon: '⚡', config: UPGRADES.ATTACK_COUNT },
      { id: 'attackDamage', name: '攻擊傷害', desc: '提升每秒傷害值', icon: '⚔️', config: UPGRADES.ATTACK_DAMAGE },
      { id: 'maxHealth', name: '最大生命值', desc: '增加 HP 上限', icon: '❤️', config: UPGRADES.MAX_HEALTH },
      { id: 'initialTime', name: '初始時間', desc: '關卡開始時有更多時間', icon: '⏰', config: UPGRADES.INITIAL_TIME },
      { id: 'coinMultiplier', name: '貨幣倍率', desc: '增加關卡結算時的獎勵', icon: '💎', config: UPGRADES.COIN_MULTIPLIER }
    ];
    
    const width = this.cameras.main.width;
    const startX = width / 2;
    const startY = 130;
    const cardWidth = width - 40;  // 使用螢幕寬度-40避免破版
    const cardHeight = 110;  // 稍微增加高度
    const spacingX = 0;
    const spacingY = 120;
    const cols = 1;
    
    // 建立可滾動容器
    this.scrollContainer = this.add.container(0, 0);
    
    upgradeConfigs.forEach((upgrade, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = startX;
      const y = startY + row * spacingY;
      
      this.createUpgradeCard(x, y, cardWidth, cardHeight, upgrade);
    });
    
    // 設定滾動
    const totalHeight = upgradeConfigs.length * spacingY;
    const maxScroll = Math.max(0, totalHeight - (this.cameras.main.height - 180));
    
    // 滑鼠滾輪
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (maxScroll > 0) {
        this.scrollContainer.y = Phaser.Math.Clamp(
          this.scrollContainer.y - deltaY * 0.5,
          -maxScroll,
          0
        );
      }
    });
    
    // 觸控滾動
    let touchStartY = 0;
    let containerStartY = 0;
    let isDragging = false;
    
    this.input.on('pointerdown', (pointer) => {
      touchStartY = pointer.y;
      containerStartY = this.scrollContainer.y;
      isDragging = false;
    });
    
    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown && maxScroll > 0) {
        const deltaY = pointer.y - touchStartY;
        if (Math.abs(deltaY) > 5) {
          isDragging = true;
          this.scrollContainer.y = Phaser.Math.Clamp(
            containerStartY + deltaY,
            -maxScroll,
            0
          );
        }
      }
    });
    
    this.input.on('pointerup', () => {
      // 如果只是點擊而非拖曳，才觸發按鈕事件
      this.isDragging = isDragging;
      setTimeout(() => { this.isDragging = false; }, 100);
    });
  }
  
  createUpgradeCard(x, y, width, height, upgrade) {
    const container = this.add.container(x, y);
    const currentLevel = this.gameData.upgrades[upgrade.id] || 0;
    const maxLevel = 10;
    const price = calculateUpgradePrice(upgrade.config.BASE_PRICE, currentLevel, upgrade.config.MULTIPLIER);
    const canAfford = this.gameData.coins >= price;
    const isMaxLevel = currentLevel >= maxLevel;
    
    // 卡片背景
    const bg = this.add.rectangle(0, 0, width, height, isMaxLevel ? 0x2a2a2a : 0x1a1a2e);
    bg.setStrokeStyle(2, canAfford && !isMaxLevel ? 0x00ffff : 0x666666);
    
    // 圖示
    const icon = this.add.text(-width / 2 + 20, -height / 2 + 25, upgrade.icon, {
      font: '28px Arial'
    });
    
    // 名稱
    const name = this.add.text(-width / 2 + 60, -height / 2 + 15, upgrade.name, {
      font: 'bold 16px Arial',
      fill: COLORS.PRIMARY
    });
    
    // 描述
    const desc = this.add.text(-width / 2 + 60, -height / 2 + 38, upgrade.desc, {
      font: '11px Arial',
      fill: COLORS.TEXT_DISABLED,
      wordWrap: { width: width - 70 }
    });
    
    // 所需代幣（在描述下方）
    if (!isMaxLevel) {
      const costLabel = this.add.text(-width / 2 + 60, -height / 2 + 58, `所需: ${formatNumber(price)} 代幣`, {
        font: 'bold 12px Arial',
        fill: canAfford ? COLORS.WARNING : COLORS.DANGER
      });
      container.add(costLabel);
    }
    
    // 等級與效果
    const valuePerLevel = upgrade.config.VALUE_PER_LEVEL;
    const effectText = currentLevel > 0 ? ` (+${currentLevel * valuePerLevel})` : '';
    const level = this.add.text(-width / 2 + 15, height / 2 - 25, `Lv.${currentLevel}/${maxLevel}${effectText}`, {
      font: '13px Arial',
      fill: COLORS.TEXT
    });
    
    // 價格/升級按鈕
    if (isMaxLevel) {
      const maxText = this.add.text(width / 2 - 15, height / 2 - 25, '★ 已滿級', {
        font: 'bold 14px Arial',
        fill: COLORS.SUCCESS
      });
      maxText.setOrigin(1, 0);
      container.add(maxText);
    } else {
      const priceBtn = this.add.text(width / 2 - 15, height / 2 - 25, `升級 💎`, {
        font: 'bold 15px Arial',
        fill: canAfford ? COLORS.SUCCESS : COLORS.TEXT_DISABLED
      });
      priceBtn.setOrigin(1, 0);
      
      container.add(priceBtn);
      
      // 如果能購買，設定互動
      if (canAfford) {
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        
        container.on('pointerover', () => {
          bg.setStrokeStyle(3, 0x00ff00);
        });
        
        container.on('pointerout', () => {
          bg.setStrokeStyle(2, 0x00ffff);
        });
        
        container.on('pointerup', () => {
          // 只有不是拖曳時才觸發購買
          if (!this.isDragging) {
            this.purchaseUpgrade(upgrade.id, price, currentLevel + 1);
          }
        });
      }
    }
    
    container.add([bg, icon, name, desc, level]);
    
    // 加入滾動容器
    this.scrollContainer.add(container);
  }
  
  purchaseUpgrade(upgradeId, price, newLevel) {
    // 扣除代幣
    this.gameData.coins -= price;
    updateCoins(-price);
    
    // 更新升級等級
    this.gameData.upgrades[upgradeId] = newLevel;
    updateUpgrade(upgradeId, newLevel);
    
    // 重新建立場景
    this.scene.restart();
  }
  
  createBackButton() {
    const width = this.cameras.main.width;
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
