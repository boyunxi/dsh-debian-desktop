/** Resolve the distribution identity a Linux release writes into its .deb control file. */

/** Environment variable that supplies the Debian Maintainer field. */
export const LINUX_MAINTAINER_ENV: 'DSH_DESKTOP_LINUX_MAINTAINER'

/** Distribution identity a Linux release declares. */
export interface LinuxPackageSettings {
  readonly maintainer: string
}

/**
 * Resolve and validate the maintainer a Debian package declares.
 * @param env - Packaging environment.
 * @returns Debian Maintainer field.
 */
export function resolveLinuxPackageSettings(env: NodeJS.ProcessEnv): LinuxPackageSettings
