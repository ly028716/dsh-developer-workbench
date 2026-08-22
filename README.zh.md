# @deepseek-ai/dsh-developer-workbench

[English](README.md) | 中文

`@deepseek-ai/dsh-developer-workbench` 是可选的 DeepSeek Harness 浏览器展示插件。它在主 `deepseek-harness` workspace 之外独立开发和发布，依赖必须来自 npm registry；本包不得使用 `workspace:` 版本，也不得导入宿主私有源码。

## 安装

将本包安装到组装 Web 应用的 profile 项目中：

```sh
pnpm add @deepseek-ai/dsh-developer-workbench
```

在 profile overlay 中把插件行放在 Web 应用行之后启用它：

```yaml
plugins:
  - package: '@deepseek-ai/dsh-bundle-web-app'
  - package: '@deepseek-ai/dsh-developer-workbench'
```

宿主必须提供与 `0.1.0-rc.7` 兼容的已发布 `@deepseek-ai/dsh-client-*` 包。本包把这些宿主侧包声明为 peer dependencies，因此 profile 拥有精确的宿主版本。

## 运行时契约

插件的浏览器入口导出 `apply(ctx)`。当前骨架保持 `apply(ctx)` 为空；Task 4 会通过 `ctx.effect()` 和 `ctx.slots.register()` 注册高优先级 `shell.frame` chain 条目。该 effect 拥有的 disposer 就是移除契约：停用或卸载插件会移除它的注册，随后宿主拥有的 `shell.frame` fallback 会重新渲染默认 frame。

默认回退保证属于宿主。当本插件缺失、停用、销毁，或没有被 chain 选中时，内置 frame 仍然可选，并且会话数据、workspace 选择、草稿和工具历史仍由宿主拥有。

## 限制

本包只改变浏览器展示。它不新增后端服务、RPC namespace、持久化格式、模型提示、工具 schema、会话事件或宿主 UI 依赖。后续 workbench 组件必须组合已发布宿主包导出的公开 slot、service、locale dictionary 与 React 契约。

## 开发

在本目录运行独立检查：

```sh
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run pack
```

本包刻意不加入 `deepseek-harness` pnpm workspace。有效 lockfile 不包含 `workspace:` 版本。
