#!/usr/bin/env node

import { buildRunPlan, printUsage, runPlan } from '../src/cli.mjs'

try {
  runPlan(buildRunPlan(process.argv.slice(2)))
} catch (err) {
  printUsage()
  console.error(err.message)
  process.exitCode = 1
}
