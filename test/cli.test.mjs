import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

import { runCommand } from '../src/cli.mjs'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

function createRuntime(outcome = {}) {
  const calls = []
  const errors = []

  return {
    calls,
    errors,
    cwd: outcome.cwd ?? resolve(projectRoot, 'test/fixtures/piscine-js'),
    executable: outcome.executable ?? 'node-under-test',
    stderr: { write: value => errors.push(String(value)) },
    stdio: 'pipe',
    spawn(executable, args, options) {
      calls.push({ executable, args, options })
      if (outcome.throwError) throw outcome.throwError

      const child = new EventEmitter()
      queueMicrotask(() => {
        if (outcome.spawnError) child.emit('error', outcome.spawnError)
        else child.emit(
          'exit',
          Object.hasOwn(outcome, 'exitCode') ? outcome.exitCode : 0,
        )
      })
      return child
    },
  }
}

test('runs an exercise from the current solution directory', async () => {
  const runtime = createRuntime()

  assert.equal(await runCommand(['abs'], runtime), 0)
  assert.equal(runtime.calls.length, 1)
  assert.equal(runtime.calls[0].executable, 'node-under-test')
  assert.deepEqual(runtime.calls[0].args.slice(-2), [runtime.cwd, 'abs'])
})

test('resolves an explicit solution directory from the current directory', async () => {
  const runtime = createRuntime({ cwd: resolve(projectRoot, 'test') })

  assert.equal(await runCommand(['concat-str', 'fixtures/piscine-js'], runtime), 0)
  assert.equal(runtime.calls[0].args.at(-2), resolve(projectRoot, 'test/fixtures/piscine-js'))
})

test('accepts a direct solution file and strips exercise extensions', async () => {
  const runtime = createRuntime({ cwd: resolve(projectRoot, 'test') })

  await runCommand([
    'concat-str.js',
    'fixtures/piscine-js/concat-str.js',
  ], runtime)

  assert.deepEqual(runtime.calls[0].args.slice(-2), [
    resolve(projectRoot, 'test/fixtures/piscine-js'),
    'concat-str',
  ])
})

test('applies Node string-generation lockdown only to elementary', async () => {
  const elementaryRuntime = createRuntime()
  const regularRuntime = createRuntime()

  await runCommand(['elementary'], elementaryRuntime)
  await runCommand(['abs'], regularRuntime)

  assert.ok(elementaryRuntime.calls[0].args.includes('--disallow-code-generation-from-strings'))
  assert.ok(!regularRuntime.calls[0].args.includes('--disallow-code-generation-from-strings'))
})

test('prints usage without spawning when the exercise is missing', async () => {
  const runtime = createRuntime()

  assert.equal(await runCommand([], runtime), 1)
  assert.equal(runtime.calls.length, 0)
  assert.match(runtime.errors.join(''), /^usage: js-test/m)
  assert.match(runtime.errors.join(''), /missing exercise name/)
})

test('returns child failures and signal termination as command failures', async () => {
  assert.equal(await runCommand(['abs'], createRuntime({ exitCode: 7 })), 7)
  assert.equal(await runCommand(['abs'], createRuntime({ exitCode: null })), 1)
})

test('reports asynchronous and synchronous spawn failures', async () => {
  const asynchronous = createRuntime({ spawnError: new Error('async spawn failed') })
  const synchronous = createRuntime({ throwError: new Error('sync spawn failed') })

  assert.equal(await runCommand(['abs'], asynchronous), 1)
  assert.match(asynchronous.errors.join(''), /async spawn failed/)
  assert.equal(await runCommand(['abs'], synchronous), 1)
  assert.match(synchronous.errors.join(''), /sync spawn failed/)
})

test('runs a vendored upstream test against a solution directory', () => {
  const result = spawnSync(process.execPath, [
    'bin/01-js-test.mjs',
    'concat-str',
    'test/fixtures/piscine-js',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /concat-str passed/)
})

test('maps Docker student paths to the local solution directory', () => {
  const result = spawnSync(process.execPath, [
    'bin/01-js-test.mjs',
    'how-2-js',
    'test/fixtures/piscine-js/how-2-js.js',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /how-2-js passed/)
})
