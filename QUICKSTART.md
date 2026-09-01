# 🚀 Developer Workbench Plugin - Quick Start

## 项目状态 ✅

- **构建状态**: 通过
- **浏览器包**: `lib/client.js`
- **兼容性**: 纯增量，复用宿主 `conversation.input.dock` / `conversation.input.right` 列表 slot
- **测试**: vitest 套件（注册契约 + 渲染 + DOM 交互）

## 核心组件

### 1. TaskLauncherDock（任务启动器）
空白会话的起始任务
- 位置: `conversation.input.dock`（`id: 'workbench', order: 10`）
- 仅空白且空闲的会话显示，提供 3 个预设任务按钮
- 点击后通过 `inputActions.setDraft()` 填充输入框草稿

### 2. ActiveTaskIndicator（活跃任务指示器）
活动任务状态指示器
- 位置: `conversation.input.right`（`id: 'workbench', order: 0`）
- 通过注入的 `useSession` selector 读取运行/排队状态
- 展示状态圆点、文案与进度条

> 插件是纯增量的：它从不声明或替换宿主 slot（`root`、`details`、`tool.call.toolview` 等）。

## 快速测试

### 方式 1: 运行测试套件
```bash
cd E:\IDEWorkplaces\DeepSeekHarness\dsh-developer-workbench
pnpm install
pnpm run typecheck
pnpm run test
```

### 方式 2: 集成到 DSH
```bash
# 1. 打包插件
cd E:\IDEWorkplaces\DeepSeekHarness\dsh-developer-workbench
pnpm pack

# 2. 在 profile 项目中安装
cd <your-profile-project>
pnpm add ../dsh-developer-workbench/deepseek-ai-dsh-developer-workbench-0.1.0-rc.0.tgz

# 3. 添加到 cordis.patch.yml
# 在 dsh-web-app 行之后添加:
# - id: developer-workbench
#   name: '@deepseek-ai/dsh-developer-workbench'

# 4. 启动 web 服务
dsh web
```

## 验证方法

在浏览器控制台中运行：

```javascript
// 检查插件贡献标记
document.querySelector('[data-dsh-workbench-task-launcher]')
document.querySelector('[data-dsh-workbench-active-task]')
```

空白会话中任务启动器应出现；点击按钮后草稿被填充。宿主 frame 标记保持不变。

## 关键文件

- `src/client/index.ts` - 插件入口，注册两个增量 dock 贡献
- `src/client/TaskLauncherDock.tsx` - 任务启动器
- `src/client/ActiveTaskIndicator.tsx` - 活跃任务指示器
- `src/client/locales.ts` - 国际化字典（中英双语）
- `src/client/workbench.css` - 全局样式（作用域化到 `data-dsh-developer-workbench="true"`）
- `lib/client.js` - 编译后的浏览器包

## 设计特点

✅ 纯增量：只注册现有宿主列表 slot，不替换 frame  
✅ 完整 TypeScript 类型支持  
✅ 无障碍支持（ARIA、focus-visible）  
✅ 深色主题配色系统  
✅ 减少动画偏好支持

## 下一步

查看详细文档：
- `INTEGRATION.md` - 完整集成指南
- `README.md` - 项目概述
- `RELEASE.md` - 发布清单

---

**版本**: 0.1.0-rc.0  
**依赖**: DSH Client ^0.1.1-rc.2
