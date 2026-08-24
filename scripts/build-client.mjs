import { readFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'

const root = dirname(fileURLToPath(import.meta.url))
const project = resolve(root, '..')
const clientEntry = resolve(project, 'src/client/index.ts')
const output = resolve(project, 'lib/client.js')
const packageName = '@deepseek-ai/dsh-developer-workbench'

const cssPlugin = {
  name: 'dsh-workbench-css',
  setup(build) {
    build.onResolve({ filter: /\.css$/ }, args => ({
      path: resolve(args.resolveDir, args.path),
      namespace: 'dsh-workbench-css',
    }))
    build.onLoad({ filter: /.*/, namespace: 'dsh-workbench-css' }, async args => {
      const source = await readFile(args.path, 'utf8')
      const isModule = extname(args.path) === '.css' && args.path.endsWith('.module.css')
      const classNames = isModule
        ? [...source.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)].map(match => match[1])
        : []
      const uniqueNames = [...new Set(classNames)]
      const classMap = Object.fromEntries(uniqueNames.map(name => [name, `dsw-${name}`]))
      const css = uniqueNames.reduce(
        (value, name) => value.replaceAll(`.${name}`, `.${classMap[name]}`),
        source,
      )
      const tagId = `${packageName}/${args.path.slice(project.length + 1).replaceAll('\\', '/')}`
      return {
        loader: 'js',
        contents: [
          `const css = ${JSON.stringify(css)};`,
          `const tagId = ${JSON.stringify(tagId)};`,
          'if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css="${tagId}"]`) === null) {',
          '  const tag = document.createElement("style");',
          `  tag.dataset.plugin = ${JSON.stringify(packageName)};`,
          '  tag.dataset.pluginCss = tagId;',
          '  tag.textContent = css;',
          '  document.head.appendChild(tag);',
          '}',
          `module.exports = ${JSON.stringify(classMap)};`,
        ].join('\n'),
        resolveDir: dirname(args.path),
      }
    })
  },
}

const result = await esbuild.build({
  absWorkingDir: project,
  entryPoints: [clientEntry],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  outfile: output,
  sourcemap: true,
  external: [
    '@deepseek-ai/*',
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
  ],
  plugins: [cssPlugin],
  logLevel: 'info',
})

if (result.errors.length > 0) process.exitCode = 1

const source = await readFile(output, 'utf8')
const wrapped = [
  `window.__ModuleLoader__.load({ id: ${JSON.stringify(packageName)}, factory: (require) => {`,
  '  var module = { exports: {} };',
  '  var exports = module.exports;',
  source,
  '  return module.exports;',
  '} });',
].join('\n')
await import('node:fs/promises').then(fs => fs.writeFile(output, wrapped))
