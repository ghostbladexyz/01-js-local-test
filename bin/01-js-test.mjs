#!/usr/bin/env node

import { runCommand } from '../src/cli.mjs'

process.exitCode = await runCommand(process.argv.slice(2))
