/** Resolve the distribution identity a Linux release writes into its .deb control file. */

/** Environment variable that supplies the Debian Maintainer field. */
export const LINUX_MAINTAINER_ENV = 'DSH_DESKTOP_LINUX_MAINTAINER'

/**
 * Resolve and validate the maintainer a Debian package declares.
 *
 * dpkg requires a bug-report address, and electron-builder fails the build when the field is
 * absent, so this rejects the value here rather than at the end of a packaging run. The
 * "Name <email>" shape is what Debian policy specifies for the field.
 * @param {NodeJS.ProcessEnv} env - Packaging environment.
 * @returns {{ maintainer: string }} Debian Maintainer field.
 */
export function resolveLinuxPackageSettings(env) {
  const maintainer = env[LINUX_MAINTAINER_ENV]?.trim() ?? ''
  if (maintainer === '') {
    throw new Error(`desktop release environment: ${LINUX_MAINTAINER_ENV} must be set to a non-empty value`)
  }
  if (!/^[^<>]+ <[^<>\s@]+@[^<>\s]+>$/u.test(maintainer)) {
    throw new Error(`desktop release environment: ${LINUX_MAINTAINER_ENV} must read "Name <email>"`)
  }
  return { maintainer }
}
