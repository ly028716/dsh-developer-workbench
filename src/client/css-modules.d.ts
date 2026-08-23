declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.css' {}

declare module 'node:fs/promises' {
  export function readFile(path: string | URL, encoding: 'utf8'): Promise<string>
}

declare const process: {
  cwd(): string
}
