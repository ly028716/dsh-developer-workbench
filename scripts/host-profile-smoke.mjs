import { spawn } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const packageName = '@deepseek-ai/dsh-developer-workbench'

export function clientUrlFromOutput(output) {
  return /dsh web: (http:\/\/[^\s]+)/.exec(output)?.[1]
}

export function pluginOverlay(name = packageName) {
  return `- insert:\n    - id: developer-workbench\n      name: '${name}'\n`
}

function dshCommand(harnessDir, args) {
  const hostRequire = createRequire(join(harnessDir, 'package.json'))
  const tsxLoader = pathToFileURL(hostRequire.resolve('tsx')).href
  return [process.execPath, ['--import', tsxLoader, join(harnessDir, 'apps', 'cli', 'src', 'bin.ts'), ...args]]
}

export function isEntrypoint(argument, moduleUrl) {
  return argument !== undefined && resolve(argument) === resolve(fileURLToPath(moduleUrl))
}

export function terminationCommand(platform, pid) {
  return platform === 'win32' ? { executable: 'taskkill.exe', args: ['/pid', String(pid), '/t', '/f'] } : undefined
}

function run(cwd, args, env = process.env) {
  return new Promise((resolveRun, rejectRun) => {
    const [executable, commandArgs] = dshCommand(cwd, args)
    const child = spawn(executable, commandArgs, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] })
    let output = ''
    child.stdout.on('data', chunk => { output += chunk })
    child.stderr.on('data', chunk => { output += chunk })
    child.once('error', rejectRun)
    child.once('close', code => {
      if (code === 0) resolveRun(output)
      else rejectRun(new Error(`pnpm ${args.join(' ')} failed with ${String(code)}:\n${output}`))
    })
  })
}

function startWeb(cwd, args, env) {
  const [executable, commandArgs] = dshCommand(cwd, args)
  const child = spawn(executable, commandArgs, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] })
  const ready = new Promise((resolveReady, rejectReady) => {
    let output = ''
    const timeout = setTimeout(() => rejectReady(new Error(`dsh web did not start within 90 seconds:\n${output}`)), 90_000)
    const onData = chunk => {
      output += chunk
      const url = clientUrlFromOutput(output)
      if (url !== undefined) {
        clearTimeout(timeout)
        resolveReady(url)
      }
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.once('error', error => { clearTimeout(timeout); rejectReady(error) })
    child.once('exit', code => { clearTimeout(timeout); rejectReady(new Error(`dsh web exited early (${String(code)}):\n${output}`)) })
  })
  return { child, ready }
}

async function stop(child) {
  child.stdin?.end()
  const terminate = terminationCommand(process.platform, child.pid)
  if (terminate !== undefined) {
    await new Promise(resolveClose => {
      const killer = spawn(terminate.executable, terminate.args, { stdio: 'ignore' })
      killer.once('close', resolveClose)
      killer.once('error', resolveClose)
    })
    return
  }
  if (child.exitCode !== null) return
  const closed = new Promise(resolveClose => child.once('close', resolveClose))
  child.kill('SIGTERM')
  await Promise.race([closed, new Promise(resolveTimeout => setTimeout(resolveTimeout, 10_000))])
  if (child.exitCode === null) child.kill('SIGKILL')
}

async function connectWorkspace(page, workspace) {
  await mkdir(workspace, { recursive: true })
  const continueButton = page.getByRole('button', { name: /continue/i })
  if (await continueButton.count() > 0) await continueButton.first().click()
  const testingNotice = page.locator('[role="presentation"]').filter({ hasText: /DeepSeek Harness 0\.1 remains in testing/i })
  if (await testingNotice.count() > 0) await testingNotice.getByRole('button').last().click()
  await page.getByRole('button', { name: 'Choose workspace' }).click()
  const dialog = page.getByRole('dialog', { name: 'Select Workspace Directory' })
  await dialog.waitFor({ timeout: 15_000 })
  await dialog.getByRole('button', { name: 'Edit path' }).click()
  const input = dialog.getByRole('textbox', { name: 'Edit path' })
  await input.fill(workspace)
  await input.press('Enter')
  await dialog.getByRole('button', { name: 'Open', exact: true }).click()
  await page.locator('[data-composer-input][contenteditable="true"]').waitFor({ timeout: 15_000 })
}

async function verifySurface({ harnessDir, tempDir, enabled, browserApi, env, pickerOverlay, workbenchOverlay }) {
  const args = ['--profile', 'web', '--patch', pickerOverlay]
  if (enabled) args.push('--patch', workbenchOverlay)
  args.push('--no-open', '--port', '0')
  const { child, ready } = startWeb(harnessDir, args, env)
  let browser
  try {
    const url = await ready
    browser = await browserApi.chromium.launch({ headless: true })
    const page = await browser.newPage({ locale: 'en-US' })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    // The real host keeps live transport connections open; `networkidle`
    // never settles even after the UI is ready.
    await page.goto(url, { waitUntil: 'load' })
    if (enabled) await connectWorkspace(page, join(tempDir, 'enabled-workspace'))
    else await page.getByRole('button', { name: 'Choose workspace' }).waitFor({ timeout: 15_000 })
    const launcher = page.locator('[data-dsh-workbench-task-launcher]')
    const indicator = page.locator('[data-dsh-workbench-active-task]')
    const expected = enabled ? 1 : 0
    if (await launcher.count() !== expected || await indicator.count() !== expected || errors.length > 0) {
      throw new Error(`unexpected developer-workbench surface (enabled=${String(enabled)}): ${JSON.stringify({
        launcher: await launcher.count(), indicator: await indicator.count(), errors,
      })}`)
    }
  } finally {
    await browser?.close()
  }
  return child
}

async function main() {
  const harnessDir = process.env.DSH_HARNESS_DIR === undefined ? undefined : resolve(process.env.DSH_HARNESS_DIR)
  if (harnessDir === undefined) throw new Error('DSH_HARNESS_DIR must point to a prepared deepseek-harness checkout')
  const pickerOverlay = join(harnessDir, 'apps', 'web', 'tests', 'pin-browse-picker.overlay.yml')
  const playwrightRequire = createRequire(join(harnessDir, 'apps', 'web', 'package.json'))
  const browserApi = playwrightRequire('playwright')
  const tempDir = await mkdtemp(join(tmpdir(), 'dsh-developer-workbench-e2e-'))
  const profileHome = join(tempDir, '.dsh')
  const workbenchOverlay = join(tempDir, 'developer-workbench.overlay.yml')
  const env = { ...process.env, DSH_HOME: profileHome, DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ?? 'keyless-developer-workbench-e2e' }
  const servers = []
  try {
    await writeFile(workbenchOverlay, pluginOverlay())
    console.log('Installing local developer-workbench package into the temporary profile')
    await run(harnessDir, ['plugin', '--profile', 'web', 'add', resolve('.')], env)
    console.log('Checking enabled developer-workbench surface in the real host')
    servers.push(await verifySurface({ harnessDir, tempDir, enabled: true, browserApi, env, pickerOverlay, workbenchOverlay }))
    console.log('Checking disabled developer-workbench surface in the real host')
    servers.push(await verifySurface({ harnessDir, tempDir, enabled: false, browserApi, env, pickerOverlay, workbenchOverlay }))
    console.log('Verified enabled and disabled real-host developer-workbench profile surfaces')
  } finally {
    await Promise.all(servers.map(stop))
    await rm(tempDir, { recursive: true, force: true })
  }
}

if (isEntrypoint(process.argv[1], import.meta.url)) {
  await main()
}
