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

插件的浏览器入口导出 `apply(ctx)`。它通过 `ctx.effect()` 和 `ctx.slots.inject()` 在插件生命周期内注册一个高优先级 `shell.frame` chain 条目。`WorkbenchFrame` 使用宿主公开的 sidebar、conversation、details 与 overlay 子区域回调，样式限定在 frame 标记之下。停用或卸载插件会销毁该注册，随后宿主拥有的 `shell.frame` fallback 会重新渲染默认 frame。

默认回退保证属于宿主。当本插件缺失、停用、销毁，或没有被 chain 选中时，内置 frame 仍然可选，并且会话数据、workspace 选择、草稿和工具历史仍由宿主拥有。

插件还会通过公开契约贡献四个更高优先级的展示项：空白会话任务启动器、活跃任务条、详情上下文表面，以及 `tool.call.presentation` wrapper。这些项只消费宿主 owner props，保留宿主输入操作、会话投影、工具卡片、详情操作、Inspect 操作和文件回调。销毁插件会一起移除四项贡献，因此所有宿主 fallback 都会重新可选。

[`examples/profile-on`](examples/profile-on/README.zh.md) fixture 包含 overlay 与确定性的 profile-on/profile-off 证据。将打包 tarball 安装到该 profile 项目，在 `dsh-web-app` 之后应用 overlay；删除依赖或 overlay 即可恢复宿主 fallback。

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
