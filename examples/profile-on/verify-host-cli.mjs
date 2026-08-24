import { spawnSync } from 'node:child_process';

const expected = process.argv[2] ?? 'on';
if (expected !== 'on' && expected !== 'off') {
  throw new Error('usage: node verify-host-cli.mjs <on|off>');
}

const profile = process.env.DSH_PROFILE ?? 'web';
const cli = process.env.DSH_CLI ?? 'dsh';
const cliArgs = (process.env.DSH_CLI_ARGS ?? '').trim();
const cwd = process.env.DSH_CLI_CWD ?? process.cwd();
const args = ['--profile', profile, '--dump-config'];
const result = spawnSync(cli, [...(cliArgs ? cliArgs.split(/\s+/u) : []), ...args], {
  cwd,
  encoding: 'utf8',
  shell: process.platform === 'win32' && /\.(?:cmd|bat)$/iu.test(cli),
});

if (result.error) throw result.error;
if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const output = `${result.stdout}\n${result.stderr}`;
const enabled = /id:\s*developer-workbench\b/u.test(output)
  && /name:\s*['"]?@deepseek-ai\/dsh-developer-workbench/u.test(output);
const actual = enabled ? 'on' : 'off';
if (actual !== expected) {
  console.error(`profile ${profile}: expected ${expected}, observed ${actual}`);
  process.exit(1);
}
console.log(`profile ${profile}: ${actual} (host CLI --dump-config)`);
