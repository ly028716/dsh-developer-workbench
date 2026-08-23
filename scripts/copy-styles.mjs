import { cp, mkdir } from 'node:fs/promises'

await mkdir('lib/client', { recursive: true })

for (const file of ['WorkbenchFrame.module.css', 'workbench.css']) {
  await cp(`src/client/${file}`, `lib/client/${file}`)
}
