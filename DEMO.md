# 🎨 Developer Workbench Plugin - UI Demo

## ✅ 构建成功！

插件已成功编译为纯增量的浏览器贡献：
- **产物**: `lib/client.js`
- **依赖**: DSH Client ^0.1.1-rc.2
- **位置**: `E:\IDEWorkplaces\DeepSeekHarness\dsh-developer-workbench\`

## 📦 包含的组件

插件不替换宿主 frame，只在宿主输入区域内注册两个 list slot 贡献（与 todo / queue 等宿主条目共存）：

### 1. TaskLauncherDock（任务控制台）
```tsx
// 随会话显示于输入区上方
<section data-dsh-workbench-task-launcher="true">
  <span data-dsh-workbench-eyebrow="true">开发者任务流</span>
  <h2>准备开始任务</h2>
  <p>描述目标，并使用 @ 添加代码上下文。</p>
  <div data-dsh-workbench-task-summary="true">
    <strong>等待任务</strong>
    <span>上下文 0</span>
  </div>
  <button data-dsh-workbench-action="scaffold">插入任务骨架</button>
</section>
```

**行为**:
- 随会话显示任务阶段、草稿摘要、上下文数量和排队数量
- 空白会话提供一个“插入任务骨架”操作
- 操作通过 `inputActions.setDraft()` 填充任务草稿，发送仍由宿主 composer 负责

### 2. ActiveTaskIndicator（活跃任务指示器）
```tsx
// 在输入区右侧显示
<aside data-dsh-workbench-active-task="true" data-phase="running">
  <span data-dsh-workbench-task-indicator="true" /> {/* 状态圆点 */}
  <strong>正在执行</strong>
  <span>待处理 2 条</span>
  <span data-dsh-workbench-status-track="true" />
</aside>
```

**状态**:
- 🔵 运行中：蓝色状态点
- 🟡 队列中：琥珀色状态点 + 排队数量
- ⚪ 空闲：中性状态点
- 不展示宿主未提供的虚假完成百分比

## 🎨 CSS 设计系统

### 颜色 Token
```css
[data-dsh-developer-workbench="true"] {
  --dsw-alias-workbench-sidebar: #151922;      /* 侧边栏背景 */
  --dsw-alias-workbench-surface: #111318;      /* 表面背景 */
  --dsw-alias-workbench-elevated: #191c24;     /* elevated 背景 */
  --dsw-alias-workbench-text: #f1f4fb;         /* 主要文本 */
  --dsw-alias-workbench-muted: #aab4c8;        /* 次要文本 */
  --dsw-alias-workbench-border: #2b3241;       /* 边框 */
  --dsw-alias-workbench-accent: #79a8ff;       /* 强调色（蓝色）*/
  --dsw-alias-workbench-success: #7ec8a4;      /* 成功色（绿色）*/
  --dsw-alias-workbench-status-running: #79a8ff; /* 运行状态 */
}
```

### 响应式
```css
/* 移动端 (≤560px) */
@media (max-width: 560px) {
  [data-dsh-workbench-task-summary] {
    flex-direction: column; /* 窄屏堆叠 */
  }
}
```

### 无障碍特性
```css
/* 焦点可见 */
:focus-visible {
  outline: 2px solid var(--dsw-alias-workbench-focus);
  outline-offset: 2px;
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

## 🔍 DOM 结构预览

启用插件后，宿主 frame 不变，输入区域内新增两个贡献：

```html
<!-- 宿主渲染的 frame / conversation 内容 ... -->

<!-- conversation.input.dock 列表（空白会话时）-->
<div data-slot="conversation.input.dock">
  <!-- 宿主条目（todo、queue ...） -->
  <section data-dsh-workbench-task-launcher="true">
    ...
  </section>
</div>

<!-- conversation.input.right 列表 -->
<div data-slot="conversation.input.right">
  <aside data-dsh-workbench-active-task="true">
    ...
  </aside>
</div>
```

## 🧪 如何在浏览器中验证

### 步骤 1: 打开开发者工具
在 DSH Web 界面中按 F12 打开开发者工具

### 步骤 2: 检查 DOM 标记
在 Console 中运行：

```javascript
// 检查工作台贡献（不替换宿主 frame）
console.log('Task launcher:', document.querySelector('[data-dsh-workbench-task-launcher]'))
console.log('Active task:', document.querySelector('[data-dsh-workbench-active-task]'))
```

### 步骤 3: 检查样式
在 Elements 面板中查看应用的 CSS：
- 所有规则都以 `[data-dsh-developer-workbench="true"]` 为前缀
- 颜色来自自定义属性（CSS variables）
- 过渡动画符合 `prefers-reduced-motion` 设置

## 🎯 关键交互

1. **任务控制台**
   - “插入任务骨架” → 通过 `inputActions.setDraft()` 填充目标、上下文和验收标准
   - 草稿存在时可清空，实际发送仍由宿主 composer 处理

2. **活跃任务指示器**
   - 随会话 `running` / `queue.length` 状态实时切换文案与状态轨道

## 🚀 下一步

要在实际环境中看到这些效果：

1. **完整 DSH 环境**（推荐）
   ```bash
   # 需要完整的 deepseek-harness 仓库
   cd E:\IDEWorkplaces\GitHub\deepseek-harness
   pnpm dsh web
   ```

2. **或者查看源代码**
   - 打开 `lib/client.js` 查看编译后的代码
   - 打开 `src/client/*.tsx` 查看 React 组件
   - 打开 `src/client/workbench.css` 查看样式

---

**版本**: 0.1.0-rc.0  
**依赖**: DSH Client ^0.1.1-rc.2
