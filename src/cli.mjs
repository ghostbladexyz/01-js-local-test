import { spawn } from 'node:child_process'
import { basename, dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const runnerPath = resolve(repoRoot, 'vendor/01-edu-public/js/tests/test.mjs')
const supportedSolutionExtensions = new Set(['.js', '.mjs'])

const usage = [
  'usage: js-test <exercise> [solution-directory-or-file]',
  '',
  'examples:',
  '  js-test abs',
  '  js-test concat-str ../piscine-js',
  '',
].join('\n')

function normalizeExercise(exerciseArgument) {
  if (!exerciseArgument) throw new Error('missing exercise name')

  const extension = extname(exerciseArgument)
  return supportedSolutionExtensions.has(extension)
    ? basename(exerciseArgument, extension)
    : exerciseArgument
}

function resolveSolutionDirectory(solutionArgument, cwd) {
  const resolvedPath = resolve(cwd, solutionArgument ?? '.')
  return supportedSolutionExtensions.has(extname(resolvedPath))
    ? dirname(resolvedPath)
    : resolvedPath
}

function createProcessArguments(args, cwd) {
  const [exerciseArgument, solutionArgument] = args
  const exercise = normalizeExercise(exerciseArgument)
  const solutionDirectory = resolveSolutionDirectory(solutionArgument, cwd)

  // The elementary exercise explicitly verifies that generated code is blocked.
  // Applying this flag to every exercise would reject otherwise valid solutions.
  const nodeFlags = exercise === 'elementary'
    ? ['--disallow-code-generation-from-strings']
    : []

  return [
    ...nodeFlags,
    runnerPath,
    solutionDirectory,
    exercise,
  ]
}

function waitForChild(child, stderr) {
  return new Promise(resolveExitCode => {
    child.once('error', error => {
      stderr.write(`${error.message}\n`)
      resolveExitCode(1)
    })

    // A process terminated by a signal has a null exit code. The command's
    // public contract represents every abnormal termination as status 1.
    child.once('exit', code => resolveExitCode(code ?? 1))
  })
}

/**
 * Runs one local exercise test and resolves to its process exit code.
 *
 * The optional runtime is the internal process seam used by tests. Normal
 * callers only provide command arguments; planning and process details remain
 * private implementation.
 */
export async function runCommand(args, runtime = {}) {
  const cwd = runtime.cwd ?? process.cwd()
  const stderr = runtime.stderr ?? process.stderr
  const spawnProcess = runtime.spawn ?? spawn
  const executable = runtime.executable ?? process.execPath
  const stdio = runtime.stdio ?? 'inherit'

  let processArguments
  try {
    processArguments = createProcessArguments(args, cwd)
  } catch (error) {
    stderr.write(usage)
    stderr.write(`${error.message}\n`)
    return 1
  }

  try {
    const child = spawnProcess(executable, processArguments, { stdio })
    return await waitForChild(child, stderr)
  } catch (error) {
    // spawn may throw synchronously for an invalid adapter or runtime setup.
    stderr.write(`${error.message}\n`)
    return 1
  }
}
