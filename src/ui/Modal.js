import { COLORS } from '../utils/constants.js';

/**
 * 通用Modal對話框類
 * 專門處理事件隔離，防止點擊穿透
 */
export default class Modal {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.elements = [];
    this.onCloseCallback = null;
    
    // 標記是否為手機設備
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Modal設定完成
  }
  
  /**
   * 創建Modal基礎結構
   */
  create(config = {}) {
    if (this.isOpen) {
      this.close();
    }
    
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // 創建容器來管理所有Modal元素
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(10000); // 設置非常高的深度
    
    // 創建全屏遮罩
    this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, config.overlayAlpha || 0.85);
    this.overlay.setInteractive();
    this.overlay.setDepth(10001);
    
    // 完全阻止所有事件穿透
    this.setupOverlayEvents();
    
    // 儲存對話框尺寸供事件處理使用
    this.dialogWidth = config.width || 350;
    this.dialogHeight = config.height || 280;
    
    // 創建對話框背景
    this.dialogBg = this.scene.add.rectangle(
      width / 2, 
      height / 2, 
      this.dialogWidth, 
      this.dialogHeight, 
      config.bgColor || 0x1a1a2e
    );
    this.dialogBg.setStrokeStyle(config.borderWidth || 2, config.borderColor || 0x00ffff);
    this.dialogBg.setDepth(10002);
    
    // 將基礎元素添加到容器
    this.container.add([this.overlay, this.dialogBg]);
    this.elements.push(this.overlay, this.dialogBg);
    
    this.isOpen = true;
    return this;
  }
  
  /**
   * 設置遮罩層事件，只有點擊對話框外部才關閉
   */
  setupOverlayEvents() {
    // 只處理點擊事件來關閉Modal，但需檢查點擊位置
    this.overlay.on('pointerup', (event) => {
      console.log('Overlay clicked, checking position');
      
      // 檢查點擊位置是否在對話框範圍外
      if (this.dialogBg && this.dialogWidth && this.dialogHeight) {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;
        
        const dialogBounds = {
          left: centerX - this.dialogWidth / 2,
          right: centerX + this.dialogWidth / 2,
          top: centerY - this.dialogHeight / 2,
          bottom: centerY + this.dialogHeight / 2
        };
        
        const clickX = event.x;
        const clickY = event.y;
        
        // 只有點擊對話框外部區域才關閉
        if (clickX < dialogBounds.left || clickX > dialogBounds.right ||
            clickY < dialogBounds.top || clickY > dialogBounds.bottom) {
          console.log('Overlay clicked outside dialog, closing modal');
          this.close();
        } else {
          console.log('Clicked inside dialog, keeping modal open');
        }
      } else {
        // 如果沒有對話框背景，直接關閉
        this.close();
      }
    });
    
    // 阻止其他事件穿透
    const blockEvents = ['pointerdown', 'pointermove'];
    blockEvents.forEach(eventType => {
      this.overlay.on(eventType, (event) => {
        // Phaser 3 中透過 setInteractive 來阻止事件穿透
      });
    });
  }
  

  

  
  /**
   * 添加文字元素
   */
  addText(x, y, text, style = {}) {
    const textObj = this.scene.add.text(x, y, text, {
      font: style.font || '20px Arial',
      fill: style.fill || COLORS.TEXT,
      align: style.align || 'center',
      ...style
    });
    textObj.setOrigin(style.originX || 0.5, style.originY || 0.5);
    textObj.setDepth(10003);
    
    this.container.add(textObj);
    this.elements.push(textObj);
    
    return textObj;
  }
  
  /**
   * 添加按鈕
   */
  addButton(x, y, text, callback, style = {}) {
    const width = style.width || 120;
    const height = style.height || 40;
    
    // 按鈕背景
    const bg = this.scene.add.rectangle(0, 0, width, height, style.bgColor || 0x00ffff, style.bgAlpha || 0.2);
    bg.setStrokeStyle(style.borderWidth || 2, style.borderColor || 0x00ffff);
    
    // 按鈕文字
    const label = this.scene.add.text(0, 0, text, {
      font: style.font || 'bold 18px Arial',
      fill: style.textColor || COLORS.PRIMARY
    });
    label.setOrigin(0.5);
    
    // 創建按鈕容器
    const button = this.scene.add.container(x, y);
    button.add([bg, label]);
    button.setSize(width, height);
    button.setInteractive({ useHandCursor: true });
    
    // 按鈕事件
    button.on('pointerover', () => {
      bg.setFillStyle(style.hoverBgColor || style.bgColor || 0x00ffff, style.hoverBgAlpha || 0.4);
    });
    
    button.on('pointerout', () => {
      bg.setFillStyle(style.bgColor || 0x00ffff, style.bgAlpha || 0.2);
    });
    
    button.on('pointerdown', () => {
      bg.setFillStyle(style.pressBgColor || style.bgColor || 0x00ffff, style.pressBgAlpha || 0.6);
    });
    
    button.on('pointerup', (event) => {
      console.log('Modal button clicked:', text);
      // Phaser 3 中透過 setInteractive 來阻止事件穿透到 overlay
      bg.setFillStyle(style.hoverBgColor || style.bgColor || 0x00ffff, style.hoverBgAlpha || 0.4);
      
      if (callback) {
        callback();
      }
    });
    
    this.container.add(button);
    this.elements.push(button, bg, label);
    
    return button;
  }
  
  /**
   * 設置關閉回調
   */
  onClose(callback) {
    this.onCloseCallback = callback;
    return this;
  }
  
  /**
   * 關閉Modal
   */
  close() {
    console.log('Modal.close() called, isOpen:', this.isOpen);
    
    if (!this.isOpen) {
      console.log('Modal already closed');
      return;
    }
    
    // 立即設為關閉狀態防止重複調用
    this.isOpen = false;
    
    // 執行關閉回調
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
    
    // 清理所有元素
    this.elements.forEach(element => {
      if (element && element.destroy) {
        element.destroy();
      }
    });
    
    if (this.container && this.container.destroy) {
      this.container.destroy();
    }
    
    // 重置狀態
    this.elements = [];
    this.container = null;
    this.overlay = null;
    this.dialogBg = null;
    this.dialogWidth = null;
    this.dialogHeight = null;
    this.onCloseCallback = null;
    
    console.log('Modal closed successfully');
  }
  
  /**
   * 檢查Modal是否開啟
   */
  get opened() {
    return this.isOpen;
  }
}