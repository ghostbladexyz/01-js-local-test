import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

import { buildRunPlan } from '../src/cli.mjs'

describe('buildRunPlan', () => {
  it('uses the current directory as the solution path when only exercise is given', () => {
    const plan = buildRunPlan(['abs'], { cwd: '/work/piscine-js' })

    assert.equal(plan.exercise, 'abs')
    assert.equal(plan.solutionPath, resolve('/work/piscine-js'))
    assert.deepEqual(plan.nodeArgs, [
      resolve('vendor/01-edu-public/js/tests/test.mjs'),
      resolve('/work/piscine-js'),
      'abs',
    ])
  })

  it('uses the second argument as the solution path when provided', () => {
    const plan = buildRunPlan(['concat-str', '../solutions'], { cwd: '/work/tools' })

    assert.equal(plan.exercise, 'concat-str')
    assert.equal(plan.solutionPath, resolve('/work/solutions'))
  })

  it('accepts a direct path to the exercise file', () => {
    const plan = buildRunPlan(['concat-str', '../solutions/concat-str.js'], { cwd: '/work/tools' })

    assert.equal(plan.exercise, 'concat-str')
    assert.equal(plan.solutionPath, resolve('/work/solutions'))
  })

  it('strips .js from the exercise argument when users include it', () => {
    const plan = buildRunPlan(['concat-str.js'], { cwd: '/work/piscine-js' })

    assert.equal(plan.exercise, 'concat-str')
    assert.deepEqual(plan.nodeArgs, [
      resolve('vendor/01-edu-public/js/tests/test.mjs'),
      resolve('/work/piscine-js'),
      'concat-str',
    ])
  })

  it('rejects missing exercise names', () => {
    assert.throws(
      () => buildRunPlan([], { cwd: '/work/piscine-js' }),
      /missing exercise name/,
    )
  })

  it('passes the elementary exercise through Node string-generation lockdown', () => {
    const plan = buildRunPlan(['elementary'], { cwd: '/work/piscine-js' })

    assert.equal(plan.nodeExecArgv[0], '--disallow-code-generation-from-strings')
  })
})

describe('01-js-test command', () => {
  it('runs a vendored upstream JS test against a solution directory', () => {
    const result = spawnSync(process.execPath, [
      'bin/01-js-test.mjs',
      'concat-str',
      'test/fixtures/piscine-js',
    ], {
      cwd: resolve(import.meta.dirname, '..'),
      encoding: 'utf8',
    })

    assert.equal(result.status, 0, result.stderr || result.stdout)
    assert.match(result.stdout, /concat-str passed/)
  })

  it('runs tests that read Docker student paths against the local solution directory', () => {
    const result = spawnSync(process.execPath, [
      'bin/01-js-test.mjs',
      'how-2-js',
      'test/fixtures/piscine-js/how-2-js.js',
    ], {
      cwd: resolve(import.meta.dirname, '..'),
      encoding: 'utf8',
    })

    assert.equal(result.status, 0, result.stderr || result.stdout)
    assert.match(result.stdout, /how-2-js passed/)
  })
})
