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
    
    // 綁定方法到this，確保正確的上下文
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
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
    
    // 創建對話框背景
    this.dialogBg = this.scene.add.rectangle(
      width / 2, 
      height / 2, 
      config.width || 350, 
      config.height || 280, 
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
   * 設置遮罩層事件，完全阻止穿透
   */
  setupOverlayEvents() {
    // 創建強力的事件阻止函數
    const blockEvent = (event) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (event.preventDefault) {
        event.preventDefault();
      }
      return false;
    };
    
    // 阻止所有可能的事件類型
    const eventTypes = [
      'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout',
      'touchstart', 'touchmove', 'touchend', 'touchcancel',
      'mousedown', 'mouseup', 'mousemove', 'click'
    ];
    
    eventTypes.forEach(eventType => {
      this.overlay.on(eventType, blockEvent);
    });
    
    // 特殊處理遮罩層點擊關閉
    this.overlay.on('pointerup', this.handleOverlayClick);
  }
  
  /**
   * 處理遮罩層點擊
   */
  handleOverlayClick(event) {
    // 阻止事件傳播
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (event.preventDefault) {
      event.preventDefault();
    }
    
    // 檢查是否點擊的是遮罩層本身
    if (event.target === this.overlay) {
      if (this.isMobile) {
        // 手機版延遲關閉
        setTimeout(() => {
          this.close();
        }, 200);
      } else {
        this.close();
      }
    }
    
    return false;
  }
  
  /**
   * 處理按鈕點擊
   */
  handleButtonClick(event, callback) {
    // 強制阻止事件傳播
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (event.preventDefault) {
      event.preventDefault();
    }
    
    if (this.isMobile) {
      // 手機版延遲執行
      setTimeout(() => {
        if (callback) {
          callback();
        }
      }, 200);
    } else {
      if (callback) {
        callback();
      }
    }
    
    return false;
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
    const bg = this.scene.add.rectangle(x, y, width, height, style.bgColor || 0x00ffff, style.bgAlpha || 0.2);
    bg.setStrokeStyle(style.borderWidth || 2, style.borderColor || 0x00ffff);
    bg.setDepth(10003);
    
    // 按鈕文字
    const label = this.scene.add.text(x, y, text, {
      font: style.font || 'bold 18px Arial',
      fill: style.textColor || COLORS.PRIMARY
    });
    label.setOrigin(0.5);
    label.setDepth(10004);
    
    // 創建按鈕容器
    const button = this.scene.add.container(x, y);
    button.add([bg, label]);
    button.setSize(width, height);
    button.setInteractive({ useHandCursor: true });
    button.setDepth(10004);
    
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
      bg.setFillStyle(style.hoverBgColor || style.bgColor || 0x00ffff, style.hoverBgAlpha || 0.4);
      this.handleButtonClick(event, callback);
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
    if (!this.isOpen) return;
    
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
    this.isOpen = false;
    this.onCloseCallback = null;
  }
  
  /**
   * 檢查Modal是否開啟
   */
  get opened() {
    return this.isOpen;
  }
}