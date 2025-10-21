# 🚀 快速部署指南

## 最簡單的方式：使用 Vercel（1 分鐘部署）

### 步驟 1：安裝 Vercel CLI
```bash
npm install -g vercel
```

### 步驟 2：登入
```bash
vercel login
```

### 步驟 3：部署
```bash
# 測試建置
npm run build

# 部署到生產環境
vercel --prod
```

完成！🎉

---

## 其他平台

### Netlify
1. 拖放 `dist` 資料夾到 [netlify.com](https://netlify.com)
2. 完成！

### GitHub Pages
```bash
git add .
git commit -m "Deploy"
git push
```
GitHub Actions 會自動部署

---

## 需要協助？
查看完整文件：[DEPLOYMENT.md](./DEPLOYMENT.md)
