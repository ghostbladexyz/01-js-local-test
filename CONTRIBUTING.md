# Contributing to 01-js-local-test

Thank you for your interest in contributing to 01-js-local-test. This project
keeps local runs small and dependency-free for regular JavaScript exercises.

## Getting Started

1. Fork the repository.
2. Clone your fork:

   ```bash
   git clone git@github.com:YOUR_USERNAME/01-js-local-test.git
   cd 01-js-local-test
   ```

3. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Requirements

- Node.js 18 or newer.
- No package install is required for regular wrapper development.

## Code Standards

- Keep the CLI dependency-free unless there is a clear reason to change that.
- Write command tests in `test/cli.test.mjs`.
- Write local compatibility tests in `test/local-compatibility.test.mjs`.
- Keep changes to `vendor/01-edu-public/js/tests` minimal and documented in
  README.md and THIRD_PARTY.md.
- Do not rewrite vendored upstream files for formatting-only changes.

## Testing

Run syntax checks and the full test suite:

```bash
npm run check
```

Run a smoke test from the project root:

```bash
./js-test concat-str test/fixtures/piscine-js
```

On Windows PowerShell:

```powershell
.\js-test.cmd concat-str test\fixtures\piscine-js
```

## Project Structure

- `bin/01-js-test.mjs` - executable Node entrypoint.
- `src/cli.mjs` - command execution and process handling.
- `src/local-compatibility.mjs` - local adaptations kept outside upstream code.
- `js-test` - Unix/Git Bash launcher.
- `js-test.cmd` - Windows launcher.
- `test/` - command, compatibility, and integration tests.
- `vendor/01-edu-public/js/tests` - vendored upstream 01-edu JS tests.

## Submitting Changes

1. Ensure `npm run check` passes.
2. Use clear commit messages, preferably Conventional Commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for test changes
   - `chore:` for maintenance tasks
3. Push to your fork.
4. Open a pull request against `main`.

## Questions?

Open an issue in the GitHub issue tracker:

```text
https://github.com/ghostbladexyz/01-js-local-test/issues
```
