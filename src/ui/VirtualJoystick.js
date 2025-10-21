import Phaser from 'phaser';

/**
 * 虛擬搖桿類別
 * 提供觸控裝置的方向控制功能
 */
export default class VirtualJoystick extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y);
    
    // 設定參數
    this.baseRadius = config.baseRadius || 60;
    this.stickRadius = config.stickRadius || 25;
    this.maxDistance = config.maxDistance || 40;
    this.deadZone = config.deadZone || 0.1;
    this.alpha = config.alpha || 0.6;
    
    // 搖桿狀態
    this.isDragging = false;
    this.direction = { x: 0, y: 0 };
    this.force = 0;
    
    // 建立搖桿圖形
    this.createJoystick();
    
    // 設定互動
    this.setupInteraction();
    
    // 預設隱藏
    this.setVisible(false);
    
    // 加入場景
    scene.add.existing(this);
  }
  
  createJoystick() {
    // 隱形搖桿 - 不建立任何視覺元素
    // 搖桿底座 - 隱藏
    this.base = this.scene.add.circle(0, 0, this.baseRadius, 0x333333, 0);
    this.base.setVisible(false);
    
    // 搖桿頭 - 隱藏
    this.stick = this.scene.add.circle(0, 0, this.stickRadius, 0x00ffff, 0);
    this.stick.setVisible(false);
    
    // 方向指示器 - 隱藏
    this.directionLine = this.scene.add.line(0, 0, 0, 0, 0, 0, 0x00ffff, 0);
    this.directionLine.setVisible(false);
    
    // 加入容器（但都是隱藏的）
    this.add([this.base, this.stick, this.directionLine]);
  }
  
  setupInteraction() {
    // 儲存事件處理函式以便清理
    this.pointerMoveHandler = (pointer) => {
      if (this.isDragging && pointer.isDown) {
        this.updateDrag(pointer);
      }
    };
    
    this.pointerUpHandler = () => {
      this.endDrag();
    };
    
    // 全域觸控移動
    this.scene.input.on('pointermove', this.pointerMoveHandler);
    
    // 觸控結束
    this.scene.input.on('pointerup', this.pointerUpHandler);
  }
  
  startDrag(pointer) {
    this.isDragging = true;
    
    // 記錄觸控起始點作為虛擬搖桿中心
    const worldPos = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    this.startX = worldPos.x;
    this.startY = worldPos.y;
    
    // 重置方向
    this.direction.x = 0;
    this.direction.y = 0;
    this.force = 0;
  }
  
  updateDrag(pointer) {
    if (!this.isDragging) return;
    
    // 計算相對於觸控起始點的距離和方向
    const worldPos = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const dx = worldPos.x - this.startX;
    const dy = worldPos.y - this.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) { // 最小移動距離
      // 計算正規化方向
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;
      
      // 計算力度（距離越遠力度越大，但限制最大值）
      const force = Math.min(distance / 50, 1.0); // 50像素為滿力度
      
      this.direction.x = normalizedX;
      this.direction.y = normalizedY;
      this.force = force;
    } else {
      this.direction.x = 0;
      this.direction.y = 0;
      this.force = 0;
    }
  }
  
  endDrag() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // 重置方向
    this.direction.x = 0;
    this.direction.y = 0;
    this.force = 0;
  }
  
  /**
   * 取得當前方向向量（已正規化）
   */
  getDirection() {
    return {
      x: this.direction.x,
      y: this.direction.y
    };
  }
  
  /**
   * 取得當前力度 (0-1)
   */
  getForce() {
    return this.force;
  }
  
  /**
   * 是否正在使用搖桿
   */
  isActive() {
    return this.isDragging && this.force > 0.05;
  }
  
  /**
   * 銷毀搖桿
   */
  destroy() {
    // 移除全域事件監聽器
    if (this.scene && this.scene.input) {
      this.scene.input.off('pointermove', this.pointerMoveHandler);
      this.scene.input.off('pointerup', this.pointerUpHandler);
    }
    
    super.destroy();
  }
}