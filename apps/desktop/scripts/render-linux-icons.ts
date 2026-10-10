/**
 * Render the Linux hicolor icon set from `resources/icon.svg`.
 *
 * A .deb installs application icons under /usr/share/icons/hicolor/<size>x<size>/apps, and a
 * desktop environment resolves the icon a .desktop entry names only from those standard size
 * directories. A single bitmap lands in a directory labelled with its own edge length, which no
 * icon theme looks in, so the installed application shows a generic placeholder instead of its
 * icon. electron-builder derives the directory from each source image's pixel size, so the fix is
 * to hand it one bitmap per size rather than one large bitmap.
 *
 * Each size is rasterized from the vector source separately instead of downscaling one large
 * bitmap, which keeps edges crisp at the small sizes a task bar actually uses. The committed
 * `resources/icons/linux` tree is the output; rerun `pnpm run render:linux-icons` in
 * `apps/desktop` after changing the vector source.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/** Bitmap edges the freedesktop icon theme specification defines for application icons. */
export const LINUX_ICON_SIZES = [16, 24, 32, 48, 64, 128, 256, 512] as const

/** Vector source and committed output directory of the Linux icon set. */
export const LINUX_ICON_PATHS = {
  source: fileURLToPath(new URL('../resources/icon.svg', import.meta.url)),
  output: fileURLToPath(new URL('../resources/icons/linux', import.meta.url)),
} as const

/** Coordinate space of the vector source; sharp's SVG density is scaled against it. */
const SOURCE_EDGE = 1104
const SOURCE_DENSITY = 72

/**
 * Rasterize one square PNG per requested edge from a vector source.
 * @param svg - Vector source bytes.
 * @param sizes - Bitmap edges to produce, each rendered from the vector rather than downscaled.
 * @returns Filename and bytes of every bitmap.
 */
export async function renderLinuxIconEntries(
  svg: Buffer,
  sizes: readonly number[] = LINUX_ICON_SIZES,
): Promise<Array<{ name: string; png: Buffer }>> {
  return Promise.all(sizes.map(async size => ({
    name: `${String(size)}x${String(size)}.png`,
    png: await sharp(svg, { density: SOURCE_DENSITY * size / SOURCE_EDGE }).resize(size, size).png().toBuffer(),
  })))
}

async function main(): Promise<void> {
  const entries = await renderLinuxIconEntries(await readFile(LINUX_ICON_PATHS.source))
  await mkdir(LINUX_ICON_PATHS.output, { recursive: true })
  for (const entry of entries) {
    await writeFile(join(LINUX_ICON_PATHS.output, entry.name), entry.png)
  }
  process.stdout.write(`linux icons: wrote ${String(entries.length)} bitmaps to ${LINUX_ICON_PATHS.output}\n`)
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) await main()
