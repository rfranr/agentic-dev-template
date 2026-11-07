# Extraction validation

[README](../README.md)

## Scope

Extracted from WorldGL revision `0f3f9ed` (the supplied checkout), following the
approved PROPOSAL4 inventory. These observations describe the initial extraction,
not permanent guarantees or evidence of application quality.

Environment: Node.js 24.22.2, npm 11.19.1. Root dependencies were installed locally
with offline `npm ci`, after updating the copied lockfile offline. Comparison
against WorldGL's lockfile found **zero version changes among retained packages**.
Removed package paths were Three.js, its types, and their now-unused dependencies.

## Executed results

| Check | Observed result |
| --- | --- |
| `npm run format` | Passed |
| `npm run format:check` | Passed |
| `npm run check:report` | Passed, including lint, tests, build, and all reports |
| Tests | 2 passed, 0 failed |
| TypeScript / Vite build | Passed |
| Cognitive complexity | Total 0, maximum 0, 0 violations |
| TypeScript metrics | Ran successfully; no metric warnings reported |
| `npm run metrics:html` | Generated ignored `metrics.html` |
| Dependency validation | No violations; 522 modules and 907 dependencies analyzed |
| First-party structure | Maximum dependency depth 1 |
| Real Chromium, headless | Neutral page title verified; experiment URL returned 403 in dev server |

The tiny fixture and linear configuration regression explain the zero cognitive
score. This is not a maintainability target or a meaningful comparison with
WorldGL's application totals.

### Semantic probes

Temporary probe files were removed after these checks:

- An undeclared JavaScript name produced an ESLint error.
- A long identifier produced a warning without an ESLint error.
- A temporary over-limit function failed lint; the cognitive report printed
  `FAIL` but exited zero, preserving its informational semantics.
- A temporary module cycle produced `no-circular` at warning severity while
  the dependency command exited zero.
- An unchanged copy of the aggregate runner in a temporary directory retained
  a report command's failure, exited 1, and still ran later report groups.

Byte comparisons confirmed unchanged aggregate runner, dependency configuration,
Prettier settings, Pi package declarations, and Pi Lens settings. Other files
have the path/fixture/documentation adaptations described in the README.

The first runtime-global regression attempted JavaScript-style `no-undef`
assertions against TypeScript paths and failed: TypeScript's recommended rules
disable that rule. The regression now checks `.mjs` contexts, as WorldGL's
original adapter regression did. No rule was enabled, disabled, or weakened to
make the test pass.

## Limitations

- Pi packages were preserved as declarations, not installed or loaded in this
  repository. Pi Lens UI feedback, web access, skill discovery, model credentials,
  and provider requests were not exercised. No model-driven success is claimed.
- The technical-documentation skill's intended installation source remains
  unresolved; the README records the provenance discrepancy without recommending
  an unverified installation command. No global skill was installed.
- Chromium was already available on the host. Browser provisioning from a fresh
  machine, headed display, preview-server privacy behavior, and other browsers
  were not tested.
- Tests verify a neutral fixture and lint context, not a consuming application.
  The fixture must be replaced and project behavior tested during adoption.
- Existing tooling coverage is not silently expanded to every configuration or
  reporting script. `.mjs` is not analyzed by `tsmetrics`.
- Licensing requires human resolution before public distribution.

WorldGL was not modified. No commit was made. Generated dependencies, build
output, metrics HTML, and temporary probes are not part of the proposed Git diff.
