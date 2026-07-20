import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'

import {
  formatTestStack,
  loadPuppeteer,
  mapDockerSolutionPath,
  toImportUrl,
  UserFacingError,
  withGeneratedTestModule,
} from '../src/local-compatibility.mjs'

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

test('converts filesystem paths to importable file URLs', () => {
  const path = resolve('test/fixtures/piscine-js/concat-str.js')

  assert.match(toImportUrl(path), /^file:/)
  assert.equal(
    toImportUrl('data:text/javascript,export default 1'),
    'data:text/javascript,export default 1',
  )
  assert.equal(toImportUrl('node:path'), 'node:path')
})

test('hides Windows generated-module URLs in failure stacks', () => {
  const generatedPath = 'C:\\Temp\\01-js-local-test-random\\generated-test.mjs'
  const error = new Error('exercise failed')
  error.stack = `Error: exercise failed\n    at ${toImportUrl(generatedPath)}:4:2`

  const stack = formatTestStack(error, generatedPath, 'concat-str')

  assert.match(stack, /at concat-str\.js:4:2/)
  assert.ok(!stack.includes('01-js-local-test-random'))
  assert.ok(!stack.includes('generated-test.mjs'))
})

test('maps single- and double-quoted Docker solution paths', () => {
  const code = [
    "readFile('/jail/student/how-2-js.js')",
    'readFile("/jail/student/index.html")',
  ].join('\n')

  const mapped = mapDockerSolutionPath(code, "C:\\Learner's Work\\piscine-js")

  assert.match(mapped, /C:\/Learner\\'s Work\/piscine-js\/how-2-js\.js/)
  assert.match(mapped, /C:\/Learner\\'s Work\/piscine-js\/index\.html/)
  assert.ok(!mapped.includes('/jail/student'))
})

test('explains the optional browser dependency when Puppeteer is absent', async () => {
  await assert.rejects(
    loadPuppeteer('skeleton-dom', async () => {
      throw new Error('not installed')
    }),
    error => {
      assert.ok(error instanceof UserFacingError)
      assert.match(error.message, /DOM tests require Puppeteer/)
      assert.match(error.message, /EXERCISE=skeleton-dom/)
      assert.match(error.message, /official Docker image/)
      return true
    },
  )
})

test('removes a generated test workspace after success', async () => {
  let generatedPath

  const result = await withGeneratedTestModule(
    'export const answer = 42',
    async path => {
      generatedPath = path
      assert.equal(await readFile(path, 'utf8'), 'export const answer = 42')
      return 'passed'
    },
  )

  assert.equal(result, 'passed')
  assert.equal(await pathExists(dirname(generatedPath)), false)
})

test('removes a generated test workspace after failure', async () => {
  let generatedPath

  await assert.rejects(
    withGeneratedTestModule('throw new Error()', async path => {
      generatedPath = path
      throw new Error('test failed')
    }),
    /test failed/,
  )

  assert.equal(await pathExists(dirname(generatedPath)), false)
})

test('isolates concurrent generated test workspaces', async () => {
  const paths = []

  await Promise.all([
    withGeneratedTestModule('export default 1', async path => {
      paths.push(path)
      assert.equal(await pathExists(path), true)
    }),
    withGeneratedTestModule('export default 2', async path => {
      paths.push(path)
      assert.equal(await pathExists(path), true)
    }),
  ])

  assert.equal(paths.length, 2)
  assert.notEqual(dirname(paths[0]), dirname(paths[1]))
  assert.equal(await pathExists(dirname(paths[0])), false)
  assert.equal(await pathExists(dirname(paths[1])), false)
})
