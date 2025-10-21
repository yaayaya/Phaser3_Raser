/**
 * 遊戲常數設定
 */

// 畫布設定（基礎尺寸，會動態調整）
export const CANVAS = {
  WIDTH: 375,
  HEIGHT: 667,
  ASPECT_RATIO: 9 / 16,
  // 動態取得實際螢幕尺寸
  get ACTUAL_WIDTH() {
    return window.innerWidth || this.WIDTH;
  },
  get ACTUAL_HEIGHT() {
    return window.innerHeight || this.HEIGHT;
  }
};

// 玩家設定
export const PLAYER = {
  BASE_SPEED: 180,
  BASE_ATTACK_RANGE: 180,        // 初始攻擊距離較短，鼓勵升級
  BASE_ATTACK_COUNT: 1,          // 雷射數量改為1
  BASE_ATTACK_DAMAGE: 20,        // 初始 DPS=20，需要升級才能快速清怪
  BASE_MAX_HEALTH: 3,            // 核心設定：只有3滴血
  SIZE: 24,
  COLOR: 0x00ffff
};

// 敵人設定（重新設計數值平衡 - 血量*2）
export const ENEMY = {
  BASIC: {
    SIZE: 20,
    COLOR: 0xff0000,
    BASE_SPEED: 85,
    BASE_HEALTH: 100,          // 50*2 = 100
    BASE_REWARD: 24,           // 獎勵也*2
    BASE_DAMAGE: 1,
    SHOOT_RANGE: 160,
    SHOOT_INTERVAL: 2200,
    STOP_DISTANCE: 130
  },
  FAST: {
    SIZE: 16,
    COLOR: 0xff6600,
    BASE_SPEED: 150,
    BASE_HEALTH: 70,           // 35*2 = 70
    BASE_REWARD: 36,
    BASE_DAMAGE: 1,
    SHOOT_RANGE: 150,
    SHOOT_INTERVAL: 1600,
    STOP_DISTANCE: 110
  },
  TANK: {
    SIZE: 32,
    COLOR: 0xcc0000,
    BASE_SPEED: 55,
    BASE_HEALTH: 300,          // 150*2 = 300
    BASE_REWARD: 70,
    BASE_DAMAGE: 1,
    SHOOT_RANGE: 190,
    SHOOT_INTERVAL: 2800,
    STOP_DISTANCE: 160
  },
  BOSS: {
    SIZE: 48,
    COLOR: 0xff00ff,
    BASE_SPEED: 60,
    BASE_HEALTH: 1000,         // 500*2 = 1000
    BASE_REWARD: 300,
    BASE_DAMAGE: 1,
    SHOOT_RANGE: 220,
    SHOOT_INTERVAL: 1200,
    STOP_DISTANCE: 200
  }
};

// 石頭設定（隕石 - 血量*2）
export const ASTEROID = {
  SMALL: {
    SIZE: 16,
    COLOR: 0x888888,
    BASE_SPEED: 40,
    BASE_HEALTH: 50,           // 25*2 = 50
    BASE_REWARD: 10,           // 5*2 = 10
    DAMAGE: 1
  },
  MEDIUM: {
    SIZE: 24,
    COLOR: 0x666666,
    BASE_SPEED: 30,
    BASE_HEALTH: 100,          // 50*2 = 100
    BASE_REWARD: 20,           // 10*2 = 20
    DAMAGE: 1
  },
  LARGE: {
    SIZE: 36,
    COLOR: 0x444444,
    BASE_SPEED: 20,
    BASE_HEALTH: 200,          // 100*2 = 200
    BASE_REWARD: 40,           // 20*2 = 40
    DAMAGE: 1
  }
};

// 道具設定
export const POWERUP = {
  TIME: {
    SIZE: 20,
    COLOR: 0xffff00,
    VALUE: 15,
    LIFETIME: 10,
    BLINK_START: 7
  }
};

// 武器設定
export const WEAPON = {
  LASER: {
    COLOR: 0x00ff00,
    WIDTH: 2,
    ALPHA: 0.8
  }
};

// 遊戲設定
export const GAME = {
  MAX_ENEMIES: 50,
  SPAWN_EDGE_PADDING: 50,
  COLLISION_DAMAGE_COOLDOWN: 1000,
  POWERUP_SPAWN_INTERVAL: 25000,
  POWERUP_SPAWN_PADDING: 100
};

// 升級設定（重新設計經濟系統）
export const UPGRADES = {
  MOVE_SPEED: {
    BASE_PRICE: 60,            // 價格*2
    MULTIPLIER: 1.4,           // 溫和成長
    VALUE_PER_LEVEL: 15        // 每級+15速度
  },
  ATTACK_RANGE: {
    BASE_PRICE: 100,           // 價格*2
    MULTIPLIER: 1.45,
    VALUE_PER_LEVEL: 20        // 每級+20射程
  },
  ATTACK_COUNT: {
    BASE_PRICE: 300,           // 價格*2
    MULTIPLIER: 2.2,           // 快速漲價
    VALUE_PER_LEVEL: 1         // 每級+1目標
  },
  ATTACK_DAMAGE: {
    BASE_PRICE: 80,            // 價格*2
    MULTIPLIER: 1.5,
    VALUE_PER_LEVEL: 10        // 每級+10傷害（+50% DPS）
  },
  MAX_HEALTH: {
    BASE_PRICE: 200,           // 價格*2
    MULTIPLIER: 1.6,           // 每次升級顯著提升
    VALUE_PER_LEVEL: 1         // 每級+1血量
  },
  INITIAL_TIME: {
    BASE_PRICE: 160,           // 價格*2
    MULTIPLIER: 1.5,
    VALUE_PER_LEVEL: 3         // 每級+3秒（更有價值）
  },
  COIN_MULTIPLIER: {
    BASE_PRICE: 400,           // 價格*2
    MULTIPLIER: 1.7,
    VALUE_PER_LEVEL: 15        // 每級+15%金幣（更明顯）
  }
};

// 場景鍵值
export const SCENES = {
  BOOT: 'BootScene',
  MAIN_MENU: 'MainMenuScene',
  UPGRADE_SHOP: 'UpgradeShopScene',
  LEVEL_SELECT: 'LevelSelectScene',
  GAME: 'GameScene',
  UI: 'UIScene',
  RESULT: 'ResultScene'
};

// 顏色配置
export const COLORS = {
  PRIMARY: '#00ffff',
  SECONDARY: '#ff00ff',
  SUCCESS: '#00ff00',
  DANGER: '#ff0000',
  WARNING: '#ffff00',
  BACKGROUND: '#272727ff',
  TEXT: '#ffffff',
  TEXT_DISABLED: '#666666'
};

// 虛擬搖桿設定
export const VIRTUAL_JOYSTICK = {
  BASE_RADIUS: 45,
  STICK_RADIUS: 20,
  MAX_DISTANCE: 35,
  DEAD_ZONE: 0.15,
  ALPHA: 0.7,
  POSITION: {
    X: 80,
    Y_OFFSET: 80 // 距離底部的距離
  },
  COLORS: {
    BASE: 0x333333,
    STICK: 0x00ffff,
    STROKE: 0x666666,
    DIRECTION: 0x00ffff
  }
};
