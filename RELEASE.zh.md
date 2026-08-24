# 发布清单

宿主发布匹配的 `@deepseek-ai/dsh-client-*` peer 包后，本包即可进行 registry prerelease。

## 本地验证

在本仓库运行：

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run test
pnpm run build
pnpm pack --dry-run
```

打包内容必须包含 `lib/client.js`、声明文件、限定作用域的 CSS 和两个 README。`package.json` 必须保持 `./client` 指向 `./lib/client.js`，并且不得包含 `workspace:` 依赖。

## Profile 安装

将发布包安装到 profile 项目，并在 `cordis.patch.yml` 的 `dsh-web-app` 条目之后插入：

```yaml
- insert:
    - id: developer-workbench
      name: '@deepseek-ai/dsh-developer-workbench'
```

使用 `node examples/profile-on/verify-host-cli.mjs on` 验证宿主组装。卸载时执行 `dsh plugin --profile <name> remove @deepseek-ai/dsh-developer-workbench`，删除 overlay 条目，重新加载 profile，再使用 `off` 参数运行校验脚本。宿主 frame 与子展示 fallback 必须恢复，且不得改变 session 数据、工作区选择、草稿或工具历史。

## 已记录验证

2026-08-24，在隔离的临时 `DSH_HOME` 中通过源码宿主 CLI 安装插件，使用 overlay 加载，然后移除依赖和 overlay 条目完成卸载。插件启用时宿主 CLI 能报告该条目，移除后不再报告。浏览器重新加载结果为：

```text
enabled:  status=200 workbench=1 default=0 errors=0
disabled: status=200 workbench=0 default=1 errors=0
```

整个生命周期没有模型请求，也没有写入 session、工作区、草稿或工具历史状态；这些表面始终由宿主拥有的 fallback 负责。

## 发布边界

创建或连接公开 Git 仓库，以及运行 `pnpm publish --tag next --access public`，均属于发布负责人操作。本工作区只准备并验证包，不推送提交，也不发布到 npm。
