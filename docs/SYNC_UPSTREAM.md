# Upstream 仓库同步指南

本指南说明如何将 upstream (上游) 仓库 [HisMax/RedInk](https://github.com/HisMax/RedInk) 的更新同步到你的 Fork 仓库。

---

## 📖 概念说明

- **Upstream (上游)**：原始项目仓库 `HisMax/RedInk`
- **Origin (远程)**：你 Fork 的仓库 `your-username/RedInk`
- **Local (本地)**：你电脑上的项目副本

```
upstream (HisMax/RedInk)
    ↓  同步更新
origin (your-username/RedInk)
    ↓  clone/pull/push
local (你的电脑)
```

---

## 🔧 一次性配置

### 1. 添加 upstream 远程仓库

在本地项目目录执行：

```bash
# 添加 upstream
git remote add upstream https://github.com/HisMax/RedInk.git

# 验证配置
git remote -v
```

**预期输出**：
```
origin    https://github.com/your-username/RedInk.git (fetch)
origin    https://github.com/your-username/RedInk.git (push)
upstream  https://github.com/HisMax/RedInk.git (fetch)
upstream  https://github.com/HisMax/RedInk.git (push)
```

---

## 🔄 手动同步 upstream 更新

### 步骤 1: 拉取 upstream 更新

```bash
# 拉取 upstream 所有分支
git fetch upstream

# 查看 upstream/main 有哪些新提交
git log HEAD..upstream/main --oneline
```

### 步骤 2: 合并 upstream 更新

**方法 A: 直接合并（推荐）**

```bash
# 确保在 main 分支
git checkout main

# 合并 upstream/main
git merge upstream/main

# 推送到你的 origin
git push origin main
```

**方法 B: Rebase（保持历史线性）**

```bash
# 确保在 main 分支
git checkout main

# Rebase 到 upstream/main
git rebase upstream/main

# 强制推送（⚠️ 慎用）
git push origin main --force-with-lease
```

### 步骤 3: 解决冲突（如果有）

如果出现冲突：

```bash
# 查看冲突文件
git status

# 手动编辑冲突文件，解决冲突标记
# <<<<<<< HEAD
# your changes
# =======
# upstream changes
# >>>>>>> upstream/main

# 标记冲突已解决
git add <conflict-file>

# 完成合并
git merge --continue  # 如果使用 merge
# 或
git rebase --continue  # 如果使用 rebase
```

### 步骤 4: 验证同步

```bash
# 查看合并后的历史
git log --oneline --graph --all -10

# 确认本地和 origin 一致
git push origin main
```

---

## ⚡ 快速同步脚本

### Linux/macOS

创建 `scripts/sync-upstream.sh`：

```bash
#!/bin/bash

echo "🔄 开始同步 upstream 仓库..."

# 拉取 upstream
echo "📥 拉取 upstream/main..."
git fetch upstream

# 检查是否有新提交
NEW_COMMITS=$(git log HEAD..upstream/main --oneline)

if [ -z "$NEW_COMMITS" ]; then
  echo "✅ 已是最新版本，无需同步"
  exit 0
fi

echo "📝 upstream/main 有以下新提交:"
echo "$NEW_COMMITS"

# 合并更新
echo "🔀 合并 upstream/main..."
git checkout main
git merge upstream/main

# 检查合并状态
if [ $? -eq 0 ]; then
  echo "✅ 合并成功"

  # 推送到 origin
  echo "📤 推送到 origin/main..."
  git push origin main

  echo "🎉 同步完成！"
else
  echo "❌ 合并失败，请手动解决冲突"
  exit 1
fi
```

使用：

```bash
chmod +x scripts/sync-upstream.sh
./scripts/sync-upstream.sh
```

### Windows (PowerShell)

创建 `scripts/sync-upstream.ps1`：

```powershell
Write-Host "🔄 开始同步 upstream 仓库..." -ForegroundColor Cyan

# 拉取 upstream
Write-Host "📥 拉取 upstream/main..." -ForegroundColor Yellow
git fetch upstream

# 检查是否有新提交
$newCommits = git log HEAD..upstream/main --oneline

if (-not $newCommits) {
    Write-Host "✅ 已是最新版本，无需同步" -ForegroundColor Green
    exit 0
}

Write-Host "📝 upstream/main 有以下新提交:" -ForegroundColor Yellow
Write-Host $newCommits

# 合并更新
Write-Host "🔀 合并 upstream/main..." -ForegroundColor Yellow
git checkout main
git merge upstream/main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 合并成功" -ForegroundColor Green

    # 推送到 origin
    Write-Host "📤 推送到 origin/main..." -ForegroundColor Yellow
    git push origin main

    Write-Host "🎉 同步完成！" -ForegroundColor Green
} else {
    Write-Host "❌ 合并失败，请手动解决冲突" -ForegroundColor Red
    exit 1
}
```

使用：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\sync-upstream.ps1
```

---

## 🤖 GitHub Actions 自动同步

本项目已配置 GitHub Actions，每周自动同步 upstream 更新。

### 配置文件 `.github/workflows/sync-upstream.yml`

```yaml
name: Sync Upstream

on:
  schedule:
    # 每周日 00:00 UTC 运行
    - cron: '0 0 * * 0'
  workflow_dispatch:  # 允许手动触发

jobs:
  sync:
    runs:on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 获取完整历史
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Add upstream
        run: |
          git remote add upstream https://github.com/HisMax/RedInk.git
          git fetch upstream

      - name: Merge upstream
        run: |
          git checkout main
          git merge upstream/main --no-edit

      - name: Push changes
        run: |
          git push origin main
```

### 手动触发同步

1. 访问你的 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择 **Sync Upstream** workflow
4. 点击 **Run workflow**
5. 等待同步完成

---

## 📋 同步注意事项

### ⚠️ 重要提醒

1. **备份本地修改**: 同步前确保本地修改已提交或 stash
2. **冲突处理**: 如果有冲突，需要手动解决
3. **自定义代码**: 如果你修改了原项目代码，合并时需要谨慎
4. **环境变量**: 同步后检查环境变量配置是否需要更新

### 🔀 处理自定义修改

如果你在 Fork 中添加了自定义功能：

**方法 1: 使用分支管理**

```bash
# 创建功能分支
git checkout -b custom-features

# 在功能分支开发
# ...

# 同步时切回 main
git checkout main
git merge upstream/main

# 将功能分支 rebase 到最新 main
git checkout custom-features
git rebase main
```

**方法 2: Cherry-pick 特定提交**

```bash
# 只同步特定的 upstream 提交
git fetch upstream
git cherry-pick <commit-hash>
```

---

## 📝 同步后的验证

同步完成后，建议执行以下检查：

### 1. 检查代码差异

```bash
# 查看与 upstream/main 的差异
git diff upstream/main

# 查看文件变更统计
git diff --stat upstream/main
```

### 2. 测试本地应用

```bash
# 安装新依赖（如果有）
cd frontend && npm install
cd ../backendjs && npm install

# 运行测试（如果有）
npm test

# 启动开发服务器
npm run dev
```

### 3. 检查部署配置

- ✅ Vercel 环境变量是否需要更新
- ✅ Railway 环境变量是否需要更新
- ✅ 配置文件是否有新增或修改

---

## 🆘 常见问题

### 问题 1: upstream 远程已存在

**错误信息**:
```
fatal: remote upstream already exists
```

**解决方案**:
```bash
# 移除旧的 upstream
git remote remove upstream

# 重新添加
git remote add upstream https://github.com/HisMax/RedInk.git
```

### 问题 2: 合并冲突

**症状**: `git merge upstream/main` 报告冲突

**解决方案**:
1. 查看冲突文件: `git status`
2. 编辑冲突文件，选择保留哪些代码
3. 标记为已解决: `git add <file>`
4. 完成合并: `git merge --continue`

### 问题 3: 推送被拒绝

**错误信息**:
```
error: failed to push some refs
```

**解决方案**:
```bash
# 先拉取 origin 更新
git pull origin main --rebase

# 再推送
git push origin main
```

---

## 📚 相关资源

- [Git 官方文档 - 远程仓库](https://git-scm.com/book/zh/v2/Git-%E5%9F%BA%E7%A1%80-%E8%BF%9C%E7%A8%8B%E4%BB%93%E5%BA%93%E7%9A%84%E4%BD%BF%E7%94%A8)
- [GitHub Docs - 同步 Fork](https://docs.github.com/zh/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork)
- [原项目仓库](https://github.com/HisMax/RedInk)

---

## 📞 需要帮助？

如果遇到同步问题：

1. 查看 [GitHub Issues](https://github.com/your-username/RedInk/issues)
2. 参考 [Git 冲突解决指南](https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E5%88%86%E6%94%AF%E7%9A%84%E6%96%B0%E5%BB%BA%E4%B8%8E%E5%90%88%E5%B9%B6)
3. 提交 Issue 描述具体问题
