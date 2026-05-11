# 01-js-local-test

Run 01-edu JavaScript tests locally without cloning `01-edu/public` and without Docker for normal JS exercises.

This repo vendors the upstream `js/tests` files and provides a small wrapper around their `test.mjs` runner.

## License

Original wrapper code and documentation are MIT licensed. Vendored files under
`vendor/01-edu-public/` come from `01-edu/public` and remain under their
upstream terms. See [THIRD_PARTY.md](THIRD_PARTY.md).

## Requirements

- Node.js 14 or newer to run student exercise tests.
- Node.js 18 or newer to run this repo's own `npm test` suite.
- No `npm install` is needed for regular non-DOM exercises.

DOM exercises, such as `skeleton-dom`, still require Puppeteer and Chrome/Chromium. If you need exact DOM parity, use the official Docker image instead.

## Install

```sh
git clone git@github.com:ghostbladexyz/01-js-local-test.git
cd 01-js-local-test
```

## Usage

Pass the exercise name without `.js`; if you include `.js` by mistake, the wrapper strips it.

### PowerShell

From this repo:

```powershell
.\js-test.cmd abs C:\path\to\piscine-js
```

If your terminal is already inside your piscine JS solutions directory, pass only the exercise name:

```powershell
cd C:\path\to\piscine-js
C:\path\to\01-js-local-test\js-test.cmd concat-str
```

You can also pass the direct solution file path:

```powershell
C:\path\to\01-js-local-test\js-test.cmd concat-str C:\path\to\piscine-js\concat-str.js
```

### Git Bash

Git Bash needs Unix-style paths. Use `/c/Users/...`, not `C:\Users\...`.

From this repo:

```sh
./js-test abs /c/path/to/piscine-js
```

If your terminal is already inside your piscine JS solutions directory, pass only the exercise name:

```sh
cd /c/path/to/piscine-js
/c/path/to/01-js-local-test/js-test concat-str
```

You can also pass the direct solution file path:

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

For `elementary`, the wrapper keeps the upstream lockdown behavior:

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

Local patches:

- Puppeteer is lazy-loaded so regular JS tests do not require installing Puppeteer.
- Dynamic imports convert Windows filesystem paths to `file://` URLs.
- Docker-only `/jail/student` paths are mapped to the local solution directory.
