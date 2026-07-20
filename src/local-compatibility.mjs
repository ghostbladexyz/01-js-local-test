import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const GENERATED_TEST_PREFIX = '01-js-local-test-'

let puppeteer

export class UserFacingError extends Error {}

/**
 * Converts filesystem paths before dynamic import. POSIX accepts plain absolute
 * paths, but Windows drive letters are parsed as URL schemes by Node's loader.
 */
export function toImportUrl(value) {
  return value.startsWith('file:')
    || value.startsWith('data:')
    || value.startsWith('node:')
    ? value
    : pathToFileURL(value).href
}

/**
 * Replaces internal module locations with the stable exercise filename users
 * recognize. The import URL replacement is essential on Windows, where Node's
 * ESM stack uses file URLs rather than drive-letter filesystem paths.
 */
export function formatTestStack(error, modulePath, exercise) {
  return error.stack
    .split(toImportUrl(modulePath)).join(`${exercise}.js`)
    .split(modulePath).join(`${exercise}.js`)
}

/**
 * Rewrites the Docker-only student mount used by a few upstream tests. Keeping
 * this compatibility patch outside the vendored runner makes upstream refreshes
 * easier to review and keeps path quoting policy in one place.
 */
export function mapDockerSolutionPath(code, solutionDirectory) {
  const escapedDirectory = solutionDirectory
    .split('\\').join('/')
    .split("'").join("\\'")

  return code
    .split("'/jail/student").join(`'${escapedDirectory}`)
    .split('"/jail/student').join(`"${escapedDirectory}`)
}

/**
 * Loads the optional browser dependency only for DOM exercises. Regular local
 * runs remain dependency-free, while the error keeps the official Docker route
 * visible to users who do not want a local browser installation.
 */
export async function loadPuppeteer(
  exercise,
  importModule = specifier => import(specifier),
) {
  if (puppeteer) return puppeteer

  try {
    puppeteer = (await importModule('puppeteer')).default
    return puppeteer
  } catch {
    throw new UserFacingError([
      'DOM tests require Puppeteer and Chrome/Chromium.',
      'Install puppeteer in this repo, or use the official Docker image:',
      `docker run --rm -e EXERCISE=${exercise} `
        + '-v "$PWD:/jail/student:ro" ghcr.io/01-edu/test-js:latest',
    ].join('\n'))
  }
}

/**
 * Materializes generated test code in an isolated workspace for the duration
 * of one local run. A unique directory prevents same-exercise collisions, and
 * the finally block removes it after both successful and failed executions.
 */
export async function withGeneratedTestModule(source, runModule) {
  const workspace = await mkdtemp(join(tmpdir(), GENERATED_TEST_PREFIX))
  const modulePath = join(workspace, 'generated-test.mjs')

  try {
    await writeFile(modulePath, source)
    return await runModule(modulePath)
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
}
