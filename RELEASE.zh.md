# 发布清单

宿主提供匹配的 `@deepseek-ai/dsh-client-*` peer 范围后，本包即可进行 registry prerelease：公开 UI 包为 `^0.1.1-rc.2`，`@deepseek-ai/dsh-client-ui-session` 为 `^0.1.2-alpha.2`，或保持契约兼容的更高版本。宿主还必须提供带 locale 注入 slot props 的 `conversation.input.dock` / `conversation.input.right` 列表 slot。

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

`pnpm run verify:bundle` 会在 ModuleLoader 兼容的 harness 中执行生成的 `lib/client.js`，验证包 id、`apply` 导出以及 `slots,locale` 注入契约。准备好 Harness checkout 后，运行 `DSH_HARNESS_DIR=/path/to/deepseek-harness pnpm run verify:host-profile`；它会证明本地包在启用的真实 profile 中出现，并在省略插件 overlay 时消失。

打包内容必须包含 `lib/client.js`、声明文件、限定作用域的 CSS 和两个 README。`package.json` 必须保持 `./client` 指向 `./lib/client.js`，并且不得包含 `workspace:` 依赖。

## Profile 安装

将发布包安装到 profile 项目，并在 `cordis.patch.yml` 的 `dsh-web-app` 条目之后插入：

```yaml
- insert:
    - id: developer-workbench
      name: '@deepseek-ai/dsh-developer-workbench'
```

profile patch 必须放在 `dsh-web-app` 之后；只安装包并不会启用浏览器贡献。启用后的页面里，任务控制台和活跃任务指示器会出现在宿主输入区域内；同时移除依赖和 patch 行后它们消失，宿主 frame 保持自身标记不变。插件从不写入 session 数据、工作区选择或工具历史，只通过公开的输入 action 写入任务草稿。

## 必填的真实宿主验证记录

增量设计由上述自动化套件覆盖（注册、销毁、渲染、任务骨架交互）；整个过程没有模型请求，也不写入宿主状态。发布前，发布负责人必须在发布 PR 或 GitHub Release 中附上以下已填写记录。仅有一次本地通过不足以替代对本次候选版本及宿主版本的留档。

```text
插件版本 / commit：
Harness 版本 / commit：
验证日期与操作人：
命令：DSH_HARNESS_DIR=<checkout> pnpm run verify:host-profile
启用 profile：通过 —— 渲染 1 个任务启动器和 1 个活动任务指示器；浏览器无错误。
禁用 profile：通过 —— 不渲染任何 workbench 标记；宿主输入区域仍可正常使用。
证据：命令日志、CI 运行链接，或附加的截图/trace。
```

任一 profile 状态失败、宿主输入区域不可用，或缺少记录/证据时，均阻止发布。

## 发布边界

创建或连接公开 Git 仓库，以及运行 `pnpm publish --tag next --access public`，均属于发布负责人操作。本工作区只准备并验证包，不推送提交，也不发布到 npm。
