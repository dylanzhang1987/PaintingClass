# 代码审核 Agent 使用说明

## 概述

已为项目配置了完整的代码审核工具链，支持实时检查、格式化和重复代码检测。

## 已配置的工具

### 1. ESLint - 代码质量检查

#### 后端 (Backend)
- 配置文件: `backend/eslint.config.mjs`
- 检查 JavaScript 语法和最佳实践
- Node.js 环境规则

#### 前端 (Frontend)
- 配置文件: `frontend/eslint.config.js`
- React 相关规则
- React Hooks 最佳实践

### 2. Prettier - 代码格式化

统一的代码格式配置：
- 配置文件: `.prettierrc` (根目录、backend、frontend)
- 规则: 单引号、2空格缩进、分号、100字符换行

### 3. JSCPD - 重复代码检测

- 配置文件: `.jscpd.json`
- 检测重复代码，最低 5 行相似
- 阈值: 10% 重复率警告

### 4. Husky - Git 预提交钩子

- 配置文件: `.husky/pre-commit`
- 提交前自动运行所有检查

## 使用方法

### 单独运行检查

#### 后端
```bash
cd backend

# 运行 ESLint 检查
npm run lint

# 运行 Prettier 格式化
npm run format

# 检查代码格式（不修改）
npm run format:check

# 运行重复代码检测
npm run check:duplicates
```

#### 前端
```bash
cd frontend

# 运行 ESLint 检查
npm run lint

# 运行 Prettier 格式化
npm run format

# 检查代码格式（不修改）
npm run format:check

# 运行重复代码检测
npm run check:duplicates
```

### 全局运行（根目录）

```bash
# 运行所有 ESLint 检查
npm run lint:all

# 格式化所有代码
npm run format:all

# 检查所有代码格式
npm run format:check:all

# 运行所有检查
npm run check:all
```

### 自动化检查

提交代码时，预提交钩子会自动运行：
1. ✅ 后端 ESLint 检查
2. ✅ 前端 ESLint 检查
3. ✅ 后端代码格式检查
4. ✅ 前端代码格式检查
5. ✅ 前端测试

如果任何检查失败，提交将被阻止。

## VS Code 集成

推荐安装以下扩展：

- **ESLint** - 实时代码检查
- **Prettier** - 代码格式化
- **EditorConfig** - 编辑器配置

在 `.vscode/settings.json` 中添加：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## 检查类型

### 代码风格与规范
- ESLint 检查：语法、最佳实践、React 规范
- Prettier 格式化：统一的代码风格

### 重复代码检测
- JSCPD 检测：相似代码片段警告
- 阈值：超过 10% 重复率时警告

### 性能问题检测
- React Hooks 依赖检查
- 不必要的重新渲染检测
- 阻塞渲染操作检测

## 常见问题

### Q: 如何跳过预提交检查？

```bash
git commit --no-verify -m "commit message"
```

### Q: 如何只检查不修改？

使用 `format:check` 而不是 `format`。

### Q: 如何修复所有 ESLint 错误？

```bash
# 后端
cd backend && npx eslint . --fix

# 前端
cd frontend && npx eslint . --fix
```

### Q: 为什么 ESLint 报错？

常见的 ESLint 错误：
- **未使用的变量**: 删除或添加下划线前缀 `_variable`
- **格式问题**: 运行 `npm run format` 自动修复
- **React Hooks 依赖**: 添加缺失的依赖到 useEffect 依赖数组

## 下一步

1. 运行 `npm run check:all` 检查当前代码状态
2. 运行 `npm run format:all` 格式化所有代码
3. 配置 VS Code 以获得最佳体验
4. 开始编写代码，享受实时检查！
