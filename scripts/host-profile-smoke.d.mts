export const packageName: '@deepseek-ai/dsh-developer-workbench'
export function clientUrlFromOutput(output: string): string | undefined
export function pluginOverlay(name?: string): string
export function isEntrypoint(argument: string | undefined, moduleUrl: string): boolean
export function terminationCommand(platform: NodeJS.Platform, pid: number): { executable: string; args: string[] } | undefined
