# 启用 profile 示例

本示例通过 profile overlay 启用 `@deepseek-ai/dsh-developer-workbench`。overlay 在随附的 `dsh-web-app` 组合层之后增加一个浏览器插件条目，不替换 host frame、session store、workspace service 或工具契约。

## 安装

在仓库根目录构建独立包，然后将生成的 tarball 安装到本示例：

```sh
pnpm run build
pnpm pack
pnpm --dir examples/profile-on add --save-dev ../../deepseek-ai-dsh-developer-workbench-0.1.0-rc.0.tgz
```

profile 项目必须解析与 dsh Web 版本匹配的已发布 `@deepseek-ai/dsh-client-*` peer 包。lockfile 不得包含 `workspace:` 版本。

## 启用

在 `dsh-web-app` profile 层之后应用 `cordis.patch.yml`。启用的浏览器包会贡献可选 frame 和子展示 entry，其标记为 `data-dsh-developer-workbench="true"`。

## 禁用与卸载

删除 overlay 条目，或执行 `dsh plugin --profile <name> remove @deepseek-ai/dsh-developer-workbench`，然后重新加载 Web profile。host 的 `shell.frame` 与子展示 fallback 会重新渲染；session 历史、工作区选择、草稿和工具历史仍由 dsh 拥有。

## 证据

旁边的快照记录确定性的空白、运行中、详情打开、详情关闭和卸载状态。快照只包含 DOM 标记、文案、上下文值和 CSS token 值，不需要模型密钥或网络请求。
