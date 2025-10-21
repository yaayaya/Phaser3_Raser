/**
 * 輔助函式
 */

/**
 * 計算兩點距離
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 計算兩點角度
 */
export function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * 格式化時間顯示（秒 -> MM:SS）
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 格式化數字（千分位）
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 計算升級價格
 */
export function calculateUpgradePrice(basePrice, currentLevel, multiplier) {
  return Math.floor(basePrice * Math.pow(multiplier, currentLevel));
}

/**
 * 在畫布邊緣隨機生成位置
 */
export function getRandomSpawnPosition(canvasWidth, canvasHeight, padding = 50) {
  const edge = Math.floor(Math.random() * 4); // 0=上, 1=右, 2=下, 3=左
  
  switch(edge) {
    case 0: // 上方
      return { 
        x: Math.random() * canvasWidth, 
        y: -padding,
        angle: Math.PI / 2
      };
    case 1: // 右方
      return { 
        x: canvasWidth + padding, 
        y: Math.random() * canvasHeight,
        angle: Math.PI
      };
    case 2: // 下方
      return { 
        x: Math.random() * canvasWidth, 
        y: canvasHeight + padding,
        angle: -Math.PI / 2
      };
    case 3: // 左方
      return { 
        x: -padding, 
        y: Math.random() * canvasHeight,
        angle: 0
      };
  }
}

/**
 * 限制數值範圍
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 隨機整數
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 隨機浮點數
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 隨機選擇陣列元素
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}
