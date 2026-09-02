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

宿主必须提供已发布的 `@deepseek-ai/dsh-client-*` 契约集合：公开 UI 包使用 `^0.1.1-rc.2`，`@deepseek-ai/dsh-client-ui-session` 使用 `^0.1.2-alpha.2`（或保留相同公开 slot 的兼容更高版本）。本包会针对这些与 peer 完全一致的范围进行类型检查，因此 profile 使用的也是开发时验证过的宿主契约。不支持缺少 `conversation.input.dock` / `conversation.input.right` 列表 slot 或 locale 注入 props 的旧宿主。

## 运行时契约

插件的浏览器入口导出 `apply(ctx)`。它通过 `ctx.effect()` 和 `ctx.slots.inject()` 在插件生命周期内注册两个纯增量贡献——从不声明或替换宿主拥有的 slot。任务控制台以 `id: 'workbench', order: 10` 注册到 `conversation.input.dock` 列表 slot，活跃任务指示器以 `id: 'workbench', order: 0` 注册到 `conversation.input.right` 列表 slot。两者与已随宿主发布的条目（todo、queue 等）共存，并在插件停用或卸载时一起移除。

宿主 frame 及其输入区域完全由宿主拥有。会话数据、workspace 选择、草稿和工具历史始终不被触碰；插件只通过注入的 `useSession` selector hook 读取会话状态，并通过宿主的 `inputActions.setDraft` 写入草稿。

任务控制台会随当前会话展示任务阶段、草稿摘要、上下文数量和排队数量；空白会话可通过“插入任务骨架”快速建立目标/上下文/验收标准结构，草稿操作通过 `inputActions.setDraft` 完成。活跃任务指示器只展示宿主公开的运行/排队/空闲状态，不伪造执行百分比。两个组件的 token 和样式都限定在 `data-dsh-developer-workbench="true"` 标记之下。

构建会生成 `lib/client.js` 浏览器入口。它是以本包 id 注册到 ModuleLoader 的 CommonJS bundle，符合宿主 Web 客户端需要的产物；发布包的 `./client` 导出指向该文件。

## 产品边界

这是一个无状态、仅浏览器端的输入区增强插件。它的产品职责是让宿主已有的任务上下文更易阅读和开始：展示当前会话/输入状态，提供一个可选的草稿骨架，并提供草稿展开、清空确认等可逆的本地展示控制。

宿主始终是唯一事实来源，并拥有所有任务结果。本插件不创建、持久化、分配、调度、提交、停止、重试或完成任务；不编排 agent 或模型；也不管理项目、计划、任务历史、权限、工作区、文件或用户遥测。“Workbench”只是展示名称，不是第二套任务管理产品。

任何需要持久化状态、模型/工具执行、跨会话协作或新用户权限的未来能力，都必须先作为宿主公开契约设计并发布。本包只能通过已发布的 slot 与 service 组合该契约，不得建立并行的私有协议或状态存储。

## 限制

本包只改变浏览器展示。它不新增后端服务、RPC namespace、持久化格式、模型提示、工具 schema、会话事件或宿主 UI 依赖。后续 workbench 组件必须组合已发布宿主包导出的公开 slot、service、locale dictionary 与 React 契约。

## 开发

在本目录运行独立检查：

```sh
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify:bundle
pnpm pack --dry-run
```

准备好 `deepseek-harness` checkout 后，还应运行真实宿主冒烟测试：

```sh
DSH_HARNESS_DIR=/path/to/deepseek-harness pnpm run verify:host-profile
```

该测试会将本地包安装到临时 profile，在真实 Chromium 宿主会话中确认两个 workbench 标记出现，然后省略插件 overlay，确认二者均消失。它使用宿主的浏览器目录选择器测试 overlay，并在结束后移除临时 profile。

`tests/registration.client.spec.tsx` 锁定两个增量注册（dock + right，含 `id`/`order`）及其销毁行为，并断言插件从不声明宿主拥有的 seat（`root`、`details`、`tool.call.toolview`）。`tests/presentation.client.spec.tsx` 与 `tests/browser.workbench.spec.tsx` 通过注入的 `useSession` / `useInput` selector hook 渲染任务控制台和活跃任务指示器，并验证任务骨架写入草稿。套件还通过限定作用域的 CSS contract test 检查 focus-visible 和 reduced-motion 规则。

[发布清单](RELEASE.zh.md) 记录 registry prerelease 门槛、profile 安装条目、卸载验证，以及发布仍由发布负责人执行的边界。

本包刻意不加入 `deepseek-harness` pnpm workspace。有效 lockfile 不包含 `workspace:` 版本。
