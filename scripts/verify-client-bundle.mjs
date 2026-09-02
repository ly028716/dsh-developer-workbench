import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

const packageName = '@deepseek-ai/dsh-developer-workbench'
const source = await readFile('lib/client.js', 'utf8')
let registration

const context = vm.createContext({
  window: {
    __ModuleLoader__: {
      load(value) {
        registration = value
      },
    },
  },
})

vm.runInContext(source, context, { filename: 'lib/client.js' })

if (registration?.id !== packageName || typeof registration?.factory !== 'function') {
  throw new Error(`client bundle did not register ${packageName} with ModuleLoader`)
}

const runtime = registration.factory((id) => {
  if (id === 'react') return { useState: value => [value, () => {}] }
  if (id === 'react/jsx-runtime') {
    return { Fragment: Symbol.for('react.fragment'), jsx: () => null, jsxs: () => null }
  }
  throw new Error(`unexpected external dependency in client bundle: ${id}`)
})

if (typeof runtime.apply !== 'function') throw new Error('client bundle does not export apply()')
if (!Array.isArray(runtime.inject) || runtime.inject.join(',') !== 'slots,locale') {
  throw new Error('client bundle exports an unexpected inject contract')
}

console.log(`Verified ${packageName} ModuleLoader registration and client contract`)
