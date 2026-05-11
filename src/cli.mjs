import { spawn } from 'node:child_process'
import { basename, dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const runnerPath = resolve(repoRoot, 'vendor/01-edu-public/js/tests/test.mjs')

export function buildRunPlan(args, env = {}) {
  const [exerciseArg, solutionPathArg] = args
  const cwd = env.cwd ?? process.cwd()

  if (!exerciseArg) {
    throw new Error('missing exercise name')
  }

  const exercise = ['.js', '.mjs'].includes(extname(exerciseArg))
    ? basename(exerciseArg, extname(exerciseArg))
    : exerciseArg
  const resolvedSolutionArg = resolve(cwd, solutionPathArg ?? '.')
  const solutionPath = ['.js', '.mjs'].includes(extname(resolvedSolutionArg))
    ? dirname(resolvedSolutionArg)
    : resolvedSolutionArg
  const nodeExecArgv = exercise === 'elementary'
    ? ['--disallow-code-generation-from-strings']
    : []

  return {
    exercise,
    solutionPath,
    nodeExecArgv,
    nodeArgs: [runnerPath, solutionPath, exercise],
  }
}

export function runPlan(plan, io = {}) {
  const child = spawn(process.execPath, [...plan.nodeExecArgv, ...plan.nodeArgs], {
    stdio: io.stdio ?? 'inherit',
  })

  child.on('exit', code => {
    process.exitCode = code ?? 1
  })

  child.on('error', err => {
    console.error(err.message)
    process.exitCode = 1
  })

  return child
}

export function printUsage(stream = process.stderr) {
  stream.write([
    'usage: js-test <exercise> [solution-directory-or-file]',
    '',
    'examples:',
    '  js-test abs',
    '  js-test concat-str ../piscine-js',
    '',
  ].join('\n'))
}
