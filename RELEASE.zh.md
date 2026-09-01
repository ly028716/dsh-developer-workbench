# 发布清单

宿主发布版本为 `^0.1.1-rc.2`（或兼容的更高版本）的 `@deepseek-ai/dsh-client-*` peer 包后，本包即可进行 registry prerelease。宿主还必须提供带 locale 注入 slot props 的 `conversation.input.dock` / `conversation.input.right` 列表 slot。

## 本地验证

在本仓库运行：

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify:bundle
pnpm pack --dry-run
```

`pnpm run test` 覆盖增量契约。`tests/registration.client.spec.tsx` 锁定两个 dock 注册（名称、`id`、`order`、locale）及其销毁行为，并断言插件从不声明宿主拥有的 seat（`root`、`details`、`tool.call.toolview`）。`tests/presentation.client.spec.tsx` 与 `tests/browser.workbench.spec.tsx` 通过注入的 `useSession` / `useInput` hook 渲染任务控制台和活跃任务指示器，并验证任务骨架写入 `inputActions.setDraft`。

`pnpm run verify:bundle` 会在 ModuleLoader 兼容的 harness 中执行生成的 `lib/client.js`，验证包 id、`apply` 导出以及 `slots,locale` 注入契约。发布前仍需在真实 profile 中重载页面进行最终验证。

打包内容必须包含 `lib/client.js`、声明文件、限定作用域的 CSS 和两个 README。`package.json` 必须保持 `./client` 指向 `./lib/client.js`，并且不得包含 `workspace:` 依赖。

## Profile 安装

将发布包安装到 profile 项目，并在 `cordis.patch.yml` 的 `dsh-web-app` 条目之后插入：

```yaml
- insert:
    - id: developer-workbench
      name: '@deepseek-ai/dsh-developer-workbench'
```

profile patch 必须放在 `dsh-web-app` 之后；只安装包并不会启用浏览器贡献。启用后的页面里，任务控制台和活跃任务指示器会出现在宿主输入区域内；同时移除依赖和 patch 行后它们消失，宿主 frame 保持自身标记不变。插件从不写入 session 数据、工作区选择或工具历史，只通过公开的输入 action 写入任务草稿。

## 已记录验证

增量设计由上述自动化套件覆盖（注册、销毁、渲染、任务骨架交互）；整个过程没有模型请求，也不写入宿主状态。手动 profile 重载在启用/移除后确认两个 dock 标记出现/消失，宿主 frame 保持不变。

## 发布边界

创建或连接公开 Git 仓库，以及运行 `pnpm publish --tag next --access public`，均属于发布负责人操作。本工作区只准备并验证包，不推送提交，也不发布到 npm。
