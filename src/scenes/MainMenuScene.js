import Phaser from 'phaser';
import { SCENES, COLORS } from '../utils/constants.js';
import { getGameData, resetGameData, getSetting, updateSetting } from '../utils/storage.js';
import { formatNumber } from '../utils/helpers.js';

/**
 * 主選單場景
 */
export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MAIN_MENU });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 標題
    const title = this.add.text(width / 2, 100, '雷射防禦', {
      font: 'bold 48px Arial',
      fill: COLORS.PRIMARY,
      stroke: COLORS.BACKGROUND,
      strokeThickness: 6
    });
    title.setOrigin(0.5);
    
    const subtitle = this.add.text(width / 2, 160, 'LASER DEFENSE', {
      font: '24px Arial',
      fill: COLORS.SECONDARY,
      stroke: COLORS.BACKGROUND,
      strokeThickness: 4
    });
    subtitle.setOrigin(0.5);
    
    // 顯示代幣數量
    const gameData = getGameData();
    const coinsText = this.add.text(width / 2, 210, `代幣: ${formatNumber(gameData.coins)}`, {
      font: '20px Arial',
      fill: COLORS.WARNING
    });
    coinsText.setOrigin(0.5);
    
    // 按鈕
    this.createButton(width / 2, 280, '開始遊戲', () => {
      this.scene.start(SCENES.LEVEL_SELECT);
    });
    
    this.createButton(width / 2, 350, '升級商店', () => {
      this.scene.start(SCENES.UPGRADE_SHOP);
    });
    
    this.createButton(width / 2, 420, '遊戲設定', () => {
      this.showSettings();
    });
    
    this.createButton(width / 2, 490, '遊戲說明', () => {
      this.showGameInfo();
    });
    
    // 重置按鈕（小字體，放在下方）
    this.createResetButton(width / 2, 560);
    
    // 版本資訊
    const versionText = this.add.text(width - 10, height - 10, 'v1.2.0', {
      font: '14px Arial',
      fill: COLORS.TEXT_DISABLED
    });
    versionText.setOrigin(1, 1);
    
    // 確保所有固定UI元素在最上層
    this.children.bringToTop(title);
    this.children.bringToTop(subtitle);
    this.children.bringToTop(coinsText);
    this.children.bringToTop(versionText);
  }
  
  createButton(x, y, text, callback) {
    const button = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 250, 55, 0x00ffff, 0.2);
    bg.setStrokeStyle(2, 0x00ffff);
    
    const label = this.add.text(0, 0, text, {
      font: 'bold 20px Arial',
      fill: COLORS.PRIMARY
    });
    label.setOrigin(0.5);
    
    button.add([bg, label]);
    button.setSize(250, 55);
    button.setInteractive({ useHandCursor: true });
    
    button.on('pointerover', () => {
      bg.setFillStyle(0x00ffff, 0.4);
    });
    
    button.on('pointerout', () => {
      bg.setFillStyle(0x00ffff, 0.2);
    });
    
    button.on('pointerdown', () => {
      bg.setFillStyle(0x00ffff, 0.6);
    });
    
    button.on('pointerup', (event) => {
      // 只在正常按鈕點擊時執行callback，不阻止事件傳播
      bg.setFillStyle(0x00ffff, 0.4);
      callback();
    });
    
    return button;
  }
  
  createResetButton(x, y) {
    const button = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 250, 45, 0xff3333, 0.15);
    bg.setStrokeStyle(2, 0xff3333);
    
    const label = this.add.text(0, 0, '🗑️ 重置遊戲資料', {
      font: '16px Arial',
      fill: '#ff6666'
    });
    label.setOrigin(0.5);
    
    button.add([bg, label]);
    button.setSize(250, 45);
    button.setInteractive({ useHandCursor: true });
    
    button.on('pointerover', () => {
      bg.setFillStyle(0xff3333, 0.3);
      label.setStyle({ fill: '#ff3333' });
    });
    
    button.on('pointerout', () => {
      bg.setFillStyle(0xff3333, 0.15);
      label.setStyle({ fill: '#ff6666' });
    });
    
    button.on('pointerdown', () => {
      bg.setFillStyle(0xff3333, 0.5);
    });
    
    button.on('pointerup', (event) => {
      // 只在正常按鈕點擊時執行，不阻止事件傳播
      bg.setFillStyle(0xff3333, 0.3);
      this.showResetConfirmation();
    });
    
    return button;
  }
  
  showResetConfirmation() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 遮罩層 - 阻止所有點擊事件穿透
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    overlay.setInteractive();
    overlay.setDepth(500); // 設定適當深度
    
    // 阻止所有滑鼠事件穿透
    overlay.on('pointerdown', (event) => {
      event.stopPropagation();
    });
    overlay.on('pointermove', (event) => {
      event.stopPropagation();
    });
    overlay.on('pointerover', (event) => {
      event.stopPropagation();
    });
    overlay.on('pointerout', (event) => {
      event.stopPropagation();
    });
    
    // 對話框
    const dialogBox = this.add.rectangle(width / 2, height / 2, 320, 240, 0x1a1a2e);
    dialogBox.setStrokeStyle(3, 0xff3333);
    dialogBox.setDepth(600); // 設定在遮罩層之上
    
    // 警告圖示
    const warningIcon = this.add.text(width / 2, height / 2 - 80, '⚠️', {
      font: '48px Arial'
    });
    warningIcon.setOrigin(0.5);
    warningIcon.setDepth(700);
    
    // 標題
    const title = this.add.text(width / 2, height / 2 - 30, '確認重置遊戲？', {
      font: 'bold 24px Arial',
      fill: '#ff3333'
    });
    title.setOrigin(0.5);
    title.setDepth(700);
    
    // 說明文字
    const description = this.add.text(width / 2, height / 2 + 10, '將清除所有進度、代幣與升級\n此操作無法復原！', {
      font: '16px Arial',
      fill: COLORS.TEXT,
      align: 'center'
    });
    description.setOrigin(0.5);
    description.setDepth(700);
    
    // 確認按鈕
    const confirmBtn = this.add.text(width / 2 - 70, height / 2 + 70, '確認重置', {
      font: 'bold 18px Arial',
      fill: '#ff3333'
    });
    confirmBtn.setOrigin(0.5);
    confirmBtn.setInteractive({ useHandCursor: true });
    confirmBtn.setPadding(12, 8);
    
    const confirmBg = this.add.rectangle(width / 2 - 70, height / 2 + 70, 120, 40, 0xff3333, 0.2);
    confirmBg.setStrokeStyle(2, 0xff3333);
    confirmBg.setDepth(650);
    confirmBtn.setDepth(700);
    
    confirmBtn.on('pointerover', () => {
      confirmBg.setFillStyle(0xff3333, 0.4);
    });
    
    confirmBtn.on('pointerout', () => {
      confirmBg.setFillStyle(0xff3333, 0.2);
    });
    
    confirmBtn.on('pointerup', (event) => {
      // 只在確認重置時阻止事件冒泡
      if (event.target === confirmBtn || event.target === confirmBtn.canvas) {
        event.stopPropagation();
      }
      
      // 執行重置
      resetGameData();
      
      // 清除對話框
      overlay.destroy();
      dialogBox.destroy();
      warningIcon.destroy();
      title.destroy();
      description.destroy();
      confirmBtn.destroy();
      confirmBg.destroy();
      cancelBtn.destroy();
      cancelBg.destroy();
      
      // 重新載入場景以更新顯示
      this.scene.restart();
    });
    
    // 取消按鈕
    const cancelBtn = this.add.text(width / 2 + 70, height / 2 + 70, '取消', {
      font: 'bold 18px Arial',
      fill: COLORS.PRIMARY
    });
    cancelBtn.setOrigin(0.5);
    cancelBtn.setInteractive({ useHandCursor: true });
    cancelBtn.setPadding(12, 8);
    
    const cancelBg = this.add.rectangle(width / 2 + 70, height / 2 + 70, 100, 40, 0x00ffff, 0.2);
    cancelBg.setStrokeStyle(2, 0x00ffff);
    cancelBg.setDepth(650);
    cancelBtn.setDepth(700);
    
    cancelBtn.on('pointerover', () => {
      cancelBg.setFillStyle(0x00ffff, 0.4);
    });
    
    cancelBtn.on('pointerout', () => {
      cancelBg.setFillStyle(0x00ffff, 0.2);
    });
    
    cancelBtn.on('pointerup', (event) => {
      // 只在對話框取消時阻止事件冒泡
      if (event.target === cancelBtn || event.target === cancelBtn.canvas) {
        event.stopPropagation();
      }
      
      overlay.destroy();
      dialogBox.destroy();
      warningIcon.destroy();
      title.destroy();
      description.destroy();
      confirmBtn.destroy();
      confirmBg.destroy();
      cancelBtn.destroy();
      cancelBg.destroy();
    });
    
    // 遮罩層事件處理 - 完全阻止事件穿透
    overlay.on('pointerup', (event) => {
      // 無論如何都要阻止事件傳播
      event.stopPropagation();
      
      // 如果點擊的是遮罩層本身，關閉對話框
      if (event.target === overlay || event.target === overlay.canvas) {
        overlay.destroy();
        dialogBox.destroy();
        warningIcon.destroy();
        title.destroy();
        description.destroy();
        confirmBtn.destroy();
        confirmBg.destroy();
        cancelBtn.destroy();
        cancelBg.destroy();
      }
    });
    
    // 確保按鈕在背景之上
    this.children.bringToTop(confirmBtn);
    this.children.bringToTop(cancelBtn);
  }
  
  showSettings() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 遮罩層 - 阻止所有點擊事件穿透
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setInteractive();
    overlay.setDepth(500); // 設定適當深度
    
    // 阻止所有滑鼠事件穿透
    overlay.on('pointerdown', (event) => {
      event.stopPropagation();
    });
    overlay.on('pointermove', (event) => {
      event.stopPropagation();
    });
    overlay.on('pointerover', (event) => {
      event.stopPropagation();
    });
    overlay.on('pointerout', (event) => {
      event.stopPropagation();
    });
    
    // 設定對話框
    const dialogBox = this.add.rectangle(width / 2, height / 2, 350, 280, 0x1a1a2e);
    dialogBox.setStrokeStyle(2, 0x00ffff);
    dialogBox.setDepth(600); // 設定在遮罩層之上
    
    // 標題
    const title = this.add.text(width / 2, height / 2 - 110, '遊戲設定', {
      font: 'bold 28px Arial',
      fill: COLORS.PRIMARY
    });
    title.setOrigin(0.5);
    title.setDepth(700);
    
    // 虛擬搖桿UI設定
    const showJoystickUI = getSetting('showVirtualJoystick', false);
    
    const joystickLabel = this.add.text(width / 2 - 120, height / 2 - 50, '虛擬搖桿UI：', {
      font: '20px Arial',
      fill: COLORS.TEXT
    });
    joystickLabel.setOrigin(0, 0.5);
    joystickLabel.setDepth(700);
    
    // 開關按鈕
    const toggleButton = this.add.rectangle(width / 2 + 80, height / 2 - 50, 80, 35, 
      showJoystickUI ? 0x00ff00 : 0x666666);
    toggleButton.setStrokeStyle(2, showJoystickUI ? 0x00ffff : 0x999999);
    toggleButton.setInteractive({ useHandCursor: true });
    toggleButton.setDepth(700);
    
    const toggleText = this.add.text(width / 2 + 80, height / 2 - 50, 
      showJoystickUI ? '開啟' : '關閉', {
      font: 'bold 16px Arial',
      fill: COLORS.TEXT
    });
    toggleText.setOrigin(0.5);
    toggleText.setDepth(700);
    
    // 設定說明
    const description = this.add.text(width / 2, height / 2 - 10, 
      '顯示虛擬搖桿的外觀（底座和搖桿頭）\n關閉後仍可使用觸控操作', {
      font: '14px Arial',
      fill: COLORS.TEXT_DISABLED,
      align: 'center'
    });
    description.setOrigin(0.5);
    description.setDepth(700);
    
    // 開關事件
    toggleButton.on('pointerover', () => {
      toggleButton.setStrokeStyle(3, 0x00ffff);
    });
    
    toggleButton.on('pointerout', () => {
      const isOn = getSetting('showVirtualJoystick', false);
      toggleButton.setStrokeStyle(2, isOn ? 0x00ffff : 0x999999);
    });
    
    toggleButton.on('pointerup', (event) => {
      // 只在開關切換時阻止事件冒泡
      if (event.target === toggleButton || event.target === toggleButton.canvas) {
        event.stopPropagation();
      }
      
      const currentSetting = getSetting('showVirtualJoystick', false);
      const newSetting = !currentSetting;
      
      // 更新設定
      updateSetting('showVirtualJoystick', newSetting);
      
      // 更新UI
      toggleButton.setFillStyle(newSetting ? 0x00ff00 : 0x666666);
      toggleButton.setStrokeStyle(2, newSetting ? 0x00ffff : 0x999999);
      toggleText.setText(newSetting ? '開啟' : '關閉');
    });
    
    // 關閉按鈕
    const closeBtn = this.add.text(width / 2, height / 2 + 90, '[ 關閉 ]', {
      font: 'bold 20px Arial',
      fill: COLORS.PRIMARY
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.setDepth(700);
    
    closeBtn.on('pointerover', () => {
      closeBtn.setStyle({ fill: COLORS.SECONDARY });
    });
    
    closeBtn.on('pointerout', () => {
      closeBtn.setStyle({ fill: COLORS.PRIMARY });
    });
    
    closeBtn.on('pointerup', (event) => {
      // 只在對話框關閉時阻止事件冒泡
      if (event.target === closeBtn || event.target === closeBtn.canvas) {
        event.stopPropagation();
      }
      
      overlay.destroy();
      dialogBox.destroy();
      title.destroy();
      joystickLabel.destroy();
      toggleButton.destroy();
      toggleText.destroy();
      description.destroy();
      closeBtn.destroy();
    });
    
    // 遮罩層事件處理 - 完全阻止事件穿透
    overlay.on('pointerup', (event) => {
      // 無論如何都要阻止事件傳播
      event.stopPropagation();
      
      // 如果點擊的是遮罩層本身，關閉對話框
      if (event.target === overlay || event.target === overlay.canvas) {
        overlay.destroy();
        dialogBox.destroy();
        title.destroy();
        joystickLabel.destroy();
        toggleButton.destroy();
        toggleText.destroy();
        description.destroy();
        closeBtn.destroy();
      }
    });
  }
  
  showGameInfo() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 遮罩層 - 阻止所有點擊事件穿透
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setInteractive();
    overlay.setDepth(500); // 設定適當深度
    
    // 阻止所有滑鼠事件穿透
    overlay.on('pointerdown', (event) => {
      event.stopPropagation();
    });
    overlay.on('pointermove', (event) => {
      event.stopPropagation();
    });
    overlay.on('pointerover', (event) => {
      event.stopPropagation();
    });
    overlay.on('pointerout', (event) => {
      event.stopPropagation();
    });
    
    const infoBox = this.add.rectangle(width / 2, height / 2, 800, 500, 0x1a1a2e);
    infoBox.setStrokeStyle(2, 0x00ffff);
    infoBox.setDepth(600); // 設定在遮罩層之上
    
    const title = this.add.text(width / 2, height / 2 - 200, '遊戲說明', {
      font: 'bold 32px Arial',
      fill: COLORS.PRIMARY
    });
    title.setOrigin(0.5);
    title.setDepth(700);
    
    const info = [
      '🎮 操作方式:',
      '  • 桌面: WASD 或方向鍵移動',
      '  • 手機: 觸控拖曳操作',
      '',
      '⚔️ 遊戲目標:',
      '  • 擊敗關卡 BOSS 即可過關',
      '  • 時間歸零或 HP 歸 0 則失敗',
      '',
      '💎 升級系統:',
      '  • 擊敗敵人獲得代幣',
      '  • 在升級商店強化角色能力'
    ];
    
    const infoText = this.add.text(width / 2, height / 2 - 80, info.join('\n'), {
      font: '18px Arial',
      fill: COLORS.TEXT,
      align: 'left',
      lineSpacing: 8
    });
    infoText.setOrigin(0.5);
    infoText.setDepth(700);
    
    const closeBtn = this.add.text(width / 2, height / 2 + 180, '[ 關閉 ]', {
      font: 'bold 24px Arial',
      fill: COLORS.PRIMARY
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.setDepth(700);
    
    closeBtn.on('pointerover', () => {
      closeBtn.setStyle({ fill: COLORS.SECONDARY });
    });
    
    closeBtn.on('pointerout', () => {
      closeBtn.setStyle({ fill: COLORS.PRIMARY });
    });
    
    closeBtn.on('pointerup', (event) => {
      // 只在對話框關閉時阻止事件冒泡
      if (event.target === closeBtn || event.target === closeBtn.canvas) {
        event.stopPropagation();
      }
      
      overlay.destroy();
      infoBox.destroy();
      title.destroy();
      infoText.destroy();
      closeBtn.destroy();
    });
    
    // 遮罩層事件處理 - 完全阻止事件穿透
    overlay.on('pointerup', (event) => {
      // 無論如何都要阻止事件傳播
      event.stopPropagation();
      
      // 如果點擊的是遮罩層本身，關閉對話框
      if (event.target === overlay || event.target === overlay.canvas) {
        overlay.destroy();
        infoBox.destroy();
        title.destroy();
        infoText.destroy();
        closeBtn.destroy();
      }
    });
  }
}
