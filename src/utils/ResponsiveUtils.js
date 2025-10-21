/**
 * 響應式設計工具類
 * 處理不同裝置的螢幕適配
 */
export class ResponsiveUtils {
  constructor(game) {
    this.game = game;
    this.baseWidth = 375;
    this.baseHeight = 667;
    this.currentScale = 1;
    
    this.init();
  }
  
  init() {
    // 綁定事件監聽器
    this.bindEvents();
    
    // 立即執行一次調整
    setTimeout(() => {
      this.resize();
    }, 100);
    
    // 強制重新調整（解決某些瀏覽器的延遲問題）
    setTimeout(() => {
      this.resize();
    }, 500);
  }
  
  bindEvents() {
    // 視窗大小改變
    window.addEventListener('resize', this.debounce(() => {
      this.resize();
    }, 250));
    
    // 裝置方向改變
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.resize();
      }, 500); // 等待方向改變完成
    });
    
    // 頁面可見性改變（解決iOS背景切換問題）
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          this.resize();
        }, 100);
      }
    });
  }
  
  resize() {
    if (!this.game || !this.game.scale) return;
    
    const container = document.getElementById('game');
    if (!container) return;
    
    // 取得實際可用的螢幕尺寸
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 強制設定遊戲尺寸為螢幕尺寸
    this.game.scale.setGameSize(screenWidth, screenHeight);
    
    // 更新容器和Canvas樣式
    container.style.width = `${screenWidth}px`;
    container.style.height = `${screenHeight}px`;
    
    const canvas = container.querySelector('canvas');
    if (canvas) {
      canvas.style.width = `${screenWidth}px`;
      canvas.style.height = `${screenHeight}px`;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
    }
    
    // 記錄當前縮放比例
    this.currentScale = Math.min(screenWidth / this.baseWidth, screenHeight / this.baseHeight);
    
    // 強制刷新
    this.game.scale.refresh();
    
    // 觸發自定義事件
    this.onResize(this.currentScale, screenWidth, screenHeight);
  }
  
  // 子類可以覆寫此方法
  onResize(scale, width, height) {
    // 可以在這裡處理特定的 UI 調整
    console.log(`Game resized: scale=${scale.toFixed(2)}, size=${width}x${height}`);
  }
  
  // 防抖函式
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // 獲取當前縮放比例
  getCurrentScale() {
    return this.currentScale;
  }
  
  // 獲取裝置類型
  getDeviceType() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    
    if (minDimension < 768) {
      return 'phone';
    } else if (minDimension < 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
  
  // 檢測是否為橫屏
  isLandscape() {
    return window.innerWidth > window.innerHeight;
  }
  
  // 銷毀
  destroy() {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('orientationchange', this.resize);
    document.removeEventListener('visibilitychange', this.resize);
  }
}