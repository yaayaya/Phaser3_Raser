/**
 * LocalStorage 資料管理
 */

const STORAGE_KEY = 'laserDefenseGameData';

/**
 * 取得遊戲資料
 */
export function getGameData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load game data:', error);
  }
  
  // 回傳預設資料
  return {
    coins: 0,
    upgrades: {
      moveSpeed: 0,
      attackRange: 0,
      attackCount: 0,
      attackDamage: 0,
      maxHealth: 0,
      initialTime: 0,
      coinMultiplier: 0
    },
    levels: {
      unlocked: [1],
      completed: [],
      bestTimes: {}
    }
  };
}

/**
 * 儲存遊戲資料
 */
export function saveGameData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save game data:', error);
    return false;
  }
}

/**
 * 更新代幣數量
 */
export function updateCoins(amount) {
  const data = getGameData();
  data.coins += amount;
  saveGameData(data);
  return data.coins;
}

/**
 * 更新升級等級
 */
export function updateUpgrade(upgradeId, level) {
  const data = getGameData();
  data.upgrades[upgradeId] = level;
  saveGameData(data);
  return data.upgrades;
}

/**
 * 解鎖關卡
 */
export function unlockLevel(levelId) {
  const data = getGameData();
  if (!data.levels.unlocked.includes(levelId)) {
    data.levels.unlocked.push(levelId);
    saveGameData(data);
  }
  return data.levels.unlocked;
}

/**
 * 標記關卡完成
 */
export function completeLevel(levelId, time) {
  const data = getGameData();
  if (!data.levels.completed.includes(levelId)) {
    data.levels.completed.push(levelId);
  }
  
  // 更新最佳時間
  if (!data.levels.bestTimes[levelId] || time < data.levels.bestTimes[levelId]) {
    data.levels.bestTimes[levelId] = time;
  }
  
  saveGameData(data);
  return data.levels;
}

/**
 * 重置遊戲資料
 */
export function resetGameData() {
  localStorage.removeItem(STORAGE_KEY);
  return getGameData();
}
