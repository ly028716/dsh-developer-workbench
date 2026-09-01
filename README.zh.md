# @deepseek-ai/dsh-developer-workbench

[English](README.md) | 中文

`@deepseek-ai/dsh-developer-workbench` 是可选的 DeepSeek Harness 浏览器展示插件。它在主 `deepseek-harness` workspace 之外独立开发和发布，依赖必须来自 npm registry；本包不得使用 `workspace:` 版本，也不得导入宿主私有源码。

## 安装

将本包安装到组装 Web 应用的 profile 项目中：

```sh
pnpm add @deepseek-ai/dsh-developer-workbench
```

在 profile 的 `cordis.patch.yml` 中把以下精确行放在 `dsh-web-app` 行之后启用它：

```yaml
- insert:
    - id: developer-workbench
      name: '@deepseek-ai/dsh-developer-workbench'
```

宿主必须提供版本为 `^0.1.1-rc.2`（或保留相同公开 slot 的更高版本）的已发布 `@deepseek-ai/dsh-client-*` 契约集合。本包把这些宿主侧包声明为 peer dependencies，因此 profile 拥有精确的宿主版本。不支持缺少 `conversation.input.dock` / `conversation.input.right` 列表 slot 或 locale 注入 props 的旧宿主。

## 运行时契约

插件的浏览器入口导出 `apply(ctx)`。它通过 `ctx.effect()` 和 `ctx.slots.inject()` 在插件生命周期内注册两个纯增量贡献——从不声明或替换宿主拥有的 slot。任务控制台以 `id: 'workbench', order: 10` 注册到 `conversation.input.dock` 列表 slot，活跃任务指示器以 `id: 'workbench', order: 0` 注册到 `conversation.input.right` 列表 slot。两者与已随宿主发布的条目（todo、queue 等）共存，并在插件停用或卸载时一起移除。

宿主 frame 及其输入区域完全由宿主拥有。会话数据、workspace 选择、草稿和工具历史始终不被触碰；插件只通过注入的 `useSession` selector hook 读取会话状态，并通过宿主的 `inputActions.setDraft` 写入草稿。

任务控制台会随当前会话展示任务阶段、草稿摘要、上下文数量和排队数量；空白会话可通过“插入任务骨架”快速建立目标/上下文/验收标准结构，草稿操作通过 `inputActions.setDraft` 完成。活跃任务指示器只展示宿主公开的运行/排队/空闲状态，不伪造执行百分比。两个组件的 token 和样式都限定在 `data-dsh-developer-workbench="true"` 标记之下。

构建会生成 `lib/client.js` 浏览器入口。它是以本包 id 注册到 ModuleLoader 的 CommonJS bundle，符合宿主 Web 客户端需要的产物；发布包的 `./client` 导出指向该文件。

## 限制

本包只改变浏览器展示。它不新增后端服务、RPC namespace、持久化格式、模型提示、工具 schema、会话事件或宿主 UI 依赖。后续 workbench 组件必须组合已发布宿主包导出的公开 slot、service、locale dictionary 与 React 契约。

## 开发

在本目录运行独立检查：

```sh
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
pnpm pack --dry-run
```

`tests/registration.client.spec.tsx` 锁定两个增量注册（dock + right，含 `id`/`order`）及其销毁行为，并断言插件从不声明宿主拥有的 seat（`root`、`details`、`tool.call.toolview`）。`tests/presentation.client.spec.tsx` 与 `tests/browser.workbench.spec.tsx` 通过注入的 `useSession` / `useInput` selector hook 渲染任务控制台和活跃任务指示器，并验证任务骨架写入草稿。套件还通过限定作用域的 CSS contract test 检查 focus-visible 和 reduced-motion 规则。

[发布清单](RELEASE.zh.md) 记录 registry prerelease 门槛、profile 安装条目、卸载验证，以及发布仍由发布负责人执行的边界。

本包刻意不加入 `deepseek-harness` pnpm workspace。有效 lockfile 不包含 `workspace:` 版本。
