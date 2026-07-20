# 01-js-local-test

Run 01-edu JavaScript exercise tests locally without cloning `01-edu/public`
or using Docker for regular exercises.

The repository vendors the upstream `js/tests` files and provides a
dependency-free, cross-platform command around their runner.

## License

Original wrapper code and documentation are MIT licensed. Vendored files under
`vendor/01-edu-public/` come from `01-edu/public` and remain under their
upstream terms. See [THIRD_PARTY.md](THIRD_PARTY.md).

## Requirements

- Node.js 18 or newer.
- No `npm install` for regular non-DOM exercises.

DOM exercises, such as `skeleton-dom`, still require Puppeteer and
Chrome/Chromium. If you need exact DOM parity, use the official Docker image
instead.

## Install

```sh
git clone git@github.com:ghostbladexyz/01-js-local-test.git
cd 01-js-local-test
```

## Usage

The command accepts an exercise name and an optional solution directory or file:

```text
js-test <exercise> [solution-directory-or-file]
```

The solution defaults to the current directory. Including `.js` or `.mjs` in
the exercise name is harmless; the command removes it automatically.

### PowerShell

From this repo:

```powershell
.\js-test.cmd abs C:\path\to\piscine-js
```

If the terminal is already inside the solution directory, pass only the exercise name:

```powershell
cd C:\path\to\piscine-js
C:\path\to\01-js-local-test\js-test.cmd concat-str
```

Direct solution files are also accepted:

```powershell
C:\path\to\01-js-local-test\js-test.cmd concat-str C:\path\to\piscine-js\concat-str.js
```

### Git Bash

Git Bash needs Unix-style paths. Use `/c/Users/...`, not `C:\Users\...`.

From this repo:

```sh
./js-test abs /c/path/to/piscine-js
```

Inside the solution directory:

```sh
cd /c/path/to/piscine-js
/c/path/to/01-js-local-test/js-test concat-str
```

With a direct solution file:

```sh
/c/path/to/01-js-local-test/js-test concat-str /c/path/to/piscine-js/concat-str.js
```

The solution file must live directly in the solution directory:

```text
piscine-js/
  abs.js
  concat-str.js
  personal-shopper.mjs
```

## Examples

```powershell
.\js-test.cmd concat-str ..\piscine-js
.\js-test.cmd abs ..\piscine-js
```

```sh
./js-test concat-str ../piscine-js
./js-test abs ../piscine-js
```

For `elementary`, the command preserves the upstream string-generation lockdown:

```powershell
.\js-test.cmd elementary ..\piscine-js
```

```sh
./js-test elementary ../piscine-js
```

## Docker Fallback

For DOM exercises or for exact official image behavior:

```sh
docker run --rm -e EXERCISE=abs -v "$PWD:/jail/student:ro" ghcr.io/01-edu/test-js:latest
```

## Upstream Tests

Vendored test files come from `01-edu/public` at commit:

```text
13cd08c1d25db64e79535a51348c332f7dc83b9f
```

Local compatibility changes:

- Puppeteer is loaded only for DOM exercises, so regular exercises remain dependency-free.
- Windows filesystem paths are converted to `file://` URLs before dynamic imports.
- Docker-only `/jail/student` paths are mapped to the local solution directory.
- Generated test modules use isolated temporary directories and are removed
  after success or failure.

These changes live in `src/local-compatibility.mjs`; the vendored runner
contains only the small integration points needed to call them. See
[THIRD_PARTY.md](THIRD_PARTY.md) for provenance and refresh guidance.

## Development

Run the tests:

```sh
npm test
```

Run syntax checks and the full test suite:

```sh
npm run check
```
