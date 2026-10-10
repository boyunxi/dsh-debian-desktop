/** Package terminal launch scripts that reuse the installed Electron runtime. */

import { chmodSync, copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Copy the platform launcher into the application's public command directory.
 *
 * The launcher resolves the Electron executable from the installed layout, which differs per
 * platform, so each one ships its own script and is installed under the shared name `dsh`.
 * @param destination - Physical runtime/cli directory prepared for the application.
 * @param platform - Target Desktop operating system.
 */
export function prepareDesktopCli(destination: string, platform: 'darwin' | 'win32' | 'linux'): void {
  const source = platform === 'win32' ? 'dsh.cmd' : platform === 'darwin' ? 'dsh' : 'dsh-linux'
  const command = join(destination, 'bin', platform === 'win32' ? source : 'dsh')
  mkdirSync(join(destination, 'bin'), { recursive: true })
  copyFileSync(join(import.meta.dirname, '..', 'cli', source), command)
  // Every platform but Windows launches the command through a shell script, which needs the
  // executable bit that the repository does not record.
  if (platform !== 'win32') chmodSync(command, 0o755)
}
