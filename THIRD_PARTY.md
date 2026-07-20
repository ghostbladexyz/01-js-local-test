# Third-Party Code

This repository vendors JavaScript test files from `01-edu/public` so users can
run local tests without cloning the full upstream repository.

## 01-edu/public

- Source: `https://github.com/01-edu/public`
- Vendored path: `vendor/01-edu-public/js/tests`
- Commit: `13cd08c1d25db64e79535a51348c332f7dc83b9f`

The MIT license in this repository applies to this project's original wrapper
code and documentation. The vendored upstream files remain under their
upstream terms.

## Local Integration Changes

The upstream snapshot is intentionally kept recognizable. Local behavior lives
in `src/local-compatibility.mjs`; `vendor/01-edu-public/js/tests/test.mjs` only
imports and calls that module.

The local integration:

- loads Puppeteer lazily for DOM exercises;
- converts filesystem paths to importable file URLs;
- maps Docker's `/jail/student` path to the local solution directory;
- creates a unique generated-test workspace for each run;
- removes generated-test workspaces after success and failure; and
- lets fatal test errors unwind through cleanup before exiting.

When refreshing the vendored snapshot, replace the upstream files first, then
reapply only the integration points above and run `npm run check`.
