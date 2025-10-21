# 🚀 雷射防禦遊戲 - 部署指南

## 📋 目錄
- [專案概述](#專案概述)
- [部署選項](#部署選項)
- [詳細部署步驟](#詳細部署步驟)
- [效能優化](#效能優化)
- [安全性建議](#安全性建議)
- [監控與維護](#監控與維護)

---

## 🎮 專案概述

**專案名稱：** 雷射防禦 (Laser Defense)  
**版本：** v1.2.0  
**類型：** 2D 動作 Roguelike 彈幕遊戲  
**技術棧：** Phaser 3.90 + Vite 7.1 + Vanilla JS  
**目標平台：** Web (桌面 + 手機)

---

## 🌐 部署選項

### 1️⃣ **免費靜態網站託管（推薦新手）**

#### **Vercel** ⭐⭐⭐⭐⭐
- ✅ 零配置部署
- ✅ 自動 HTTPS
- ✅ 全球 CDN
- ✅ Git 整合（自動部署）
- 💰 免費額度：100GB 流量/月

#### **Netlify** ⭐⭐⭐⭐⭐
- ✅ 拖放部署
- ✅ 持續部署
- ✅ 表單處理
- 💰 免費額度：100GB 流量/月

#### **GitHub Pages** ⭐⭐⭐⭐
- ✅ 與 GitHub 完美整合
- ✅ 免費
- ⚠️ 僅支援公開儲存庫（免費版）
- 💰 完全免費

#### **Cloudflare Pages** ⭐⭐⭐⭐⭐
- ✅ 無限流量
- ✅ 超快速度
- ✅ DDoS 防護
- 💰 完全免費

### 2️⃣ **傳統主機託管**

#### **Shared Hosting（虛擬主機）**
- Bluehost, HostGator, GoDaddy
- 💰 $3-10 USD/月
- ✅ cPanel 控制面板
- ⚠️ 效能較差

#### **VPS（虛擬私有伺服器）**
- DigitalOcean, Linode, Vultr
- 💰 $5-20 USD/月
- ✅ 完全控制
- ⚠️ 需要技術知識

### 3️⃣ **容器化部署**

#### **Docker + Cloud Run / AWS ECS**
- 適合進階用戶
- ✅ 可擴展性
- 💰 依使用量計費

---

## 📦 詳細部署步驟

### 🔷 方案 A：Vercel 部署（最推薦）

#### **步驟 1：建立 Vercel 帳號**
1. 前往 [vercel.com](https://vercel.com)
2. 使用 GitHub 帳號登入

#### **步驟 2：準備專案**
```bash
# 確保專案可以正常建置
npm run build

# 測試建置結果
npm run preview
```

#### **步驟 3：部署**

**方法 1：透過 Git（推薦）**
```bash
# 1. 將專案推送到 GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的帳號/laser-defense.git
git push -u origin main

# 2. 在 Vercel 中 Import Project
# 3. 選擇你的儲存庫
# 4. Vercel 會自動偵測 Vite 專案並配置
# 5. 點擊 Deploy
```

**方法 2：使用 Vercel CLI**
```bash
# 安裝 Vercel CLI
npm install -g vercel

# 登入
vercel login

# 部署
vercel --prod
```

#### **步驟 4：配置（可選）**
建立 `vercel.json`：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### 🔷 方案 B：Netlify 部署

#### **步驟 1：建立 Netlify 帳號**
1. 前往 [netlify.com](https://netlify.com)
2. 註冊帳號

#### **步驟 2：建立 `netlify.toml`**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### **步驟 3：部署**

**方法 1：拖放部署**
1. 執行 `npm run build`
2. 將 `dist` 資料夾拖放到 Netlify

**方法 2：Git 整合**
1. 連接 GitHub 儲存庫
2. 設定建置指令：`npm run build`
3. 發布目錄：`dist`
4. 自動部署

---

### 🔷 方案 C：GitHub Pages 部署

#### **步驟 1：修改 `vite.config.js`**
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/laser-defense/', // 改為你的儲存庫名稱
  publicDir: 'public/assets',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
```

#### **步驟 2：新增 GitHub Actions**
建立 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### **步驟 3：啟用 GitHub Pages**
1. 進入儲存庫 Settings
2. Pages → Source 選擇 `gh-pages` 分支
3. 儲存

---

### 🔷 方案 D：Cloudflare Pages 部署

#### **步驟 1：連接 Git**
1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Workers & Pages → Create application
3. 連接 GitHub 儲存庫

#### **步驟 2：設定建置**
```
Build command: npm run build
Build output directory: dist
Node version: 18
```

#### **步驟 3：環境變數（若需要）**
無需額外設定

---

### 🔷 方案 E：傳統主機部署

#### **步驟 1：建置專案**
```bash
npm run build
```

#### **步驟 2：上傳檔案**
將 `dist` 資料夾中的所有內容上傳到主機的 `public_html` 或網站根目錄

#### **步驟 3：配置 `.htaccess`（Apache）**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# 啟用 Gzip 壓縮
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript text/javascript
</IfModule>

# 快取控制
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## ⚡ 效能優化

### 1. **建置優化**

#### 更新 `vite.config.js`：
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public/assets',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'phaser': ['phaser']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### 2. **圖片優化**
- 使用 WebP 格式
- 壓縮所有圖片（TinyPNG）
- 使用 Sprite Sheet

### 3. **程式碼分割**
Vite 已自動處理，無需額外配置

### 4. **CDN 加速**
```html
<!-- 如果使用 Cloudflare，它會自動提供 CDN -->
```

### 5. **Service Worker（PWA）**
建立 `public/sw.js`：
```javascript
const CACHE_NAME = 'laser-defense-v1.2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/main.js',
  '/assets/style.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

註冊 Service Worker（在 `main.js` 中）：
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

---

## 🔒 安全性建議

### 1. **HTTP Headers**
在 `netlify.toml` 或 `vercel.json` 中設定：
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

### 2. **HTTPS 強制**
所有推薦平台都自動提供 HTTPS

### 3. **Content Security Policy**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

---

## 📊 監控與維護

### 1. **效能監控**
- Google Analytics
- Vercel Analytics（若使用 Vercel）
- Cloudflare Analytics（若使用 Cloudflare）

### 2. **錯誤追蹤**
整合 Sentry：
```bash
npm install @sentry/browser
```

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  release: "laser-defense@1.2.0"
});
```

### 3. **更新流程**
```bash
# 1. 更新版本
npm version patch  # 1.2.0 -> 1.2.1

# 2. 建置
npm run build

# 3. 部署
git add .
git commit -m "Release v1.2.1"
git push

# 4. 自動部署（若使用 Vercel/Netlify）
```

---

## 🎯 快速部署檢查清單

### 部署前
- [ ] 執行 `npm run build` 確認無錯誤
- [ ] 執行 `npm run preview` 測試建置結果
- [ ] 檢查所有資源路徑
- [ ] 測試手機版本
- [ ] 更新版本號
- [ ] 更新 README.md

### 部署後
- [ ] 測試正式網站
- [ ] 檢查所有關卡功能
- [ ] 測試升級系統
- [ ] 測試資料儲存
- [ ] 測試手機觸控
- [ ] 檢查效能（Chrome DevTools）
- [ ] 設定自訂網域（可選）

---

## 🌟 推薦部署方案

### **個人/學習專案**
**Vercel** 或 **Netlify**
- 免費
- 零配置
- 自動部署
- 全球 CDN

### **商業專案**
**Cloudflare Pages** + **Cloudflare CDN**
- 無限流量
- 最佳效能
- 免費或低成本

### **企業級**
**AWS CloudFront + S3** 或 **Google Cloud CDN**
- 企業級 SLA
- 完整控制
- 高可用性

---

## 📞 支援與資源

### 官方文件
- [Vite 部署文件](https://vitejs.dev/guide/static-deploy.html)
- [Phaser 部署指南](https://phaser.io/tutorials/deployment)

### 社群
- Phaser Discord
- Stack Overflow

---

## ✅ 完成！

選擇最適合的部署方案，按照步驟操作，你的遊戲就能上線了！

**推薦起手式：**
```bash
# 1. 建置
npm run build

# 2. 安裝 Vercel CLI
npm install -g vercel

# 3. 部署
vercel --prod
```

🎮 祝部署順利！Have fun!
