# Tests, typechecks, and build

## Detect

Inspect existing test runners, typecheck/build scripts, runtime requirements, CI,
browser tests, and documented setup. Identify what each command actually covers.

## Reconcile

Existing working project tests, typechecks, and builds satisfy this capability.
Staged `tsconfig.json` and `vite.config.ts` are fixture-specific references, not a
request to replace the project's build system. Compare staged package dependencies
only for relevant missing capabilities; do not introduce Vite or a new runner for symmetry.

## Apply

After approval, retain existing commands and wire missing applicable validation into
the workflow. Preserve useful browser testing where applicable. Propose any needed
dependencies and browser/native setup explicitly; do not install them implicitly.
Do not copy template application fixtures or change existing tests just to pass.

## Verify

Run existing and approved added tests, typechecks, and build commands. Report actual
results, skipped suites, missing browser/runtime prerequisites, and coverage gaps.
An unrelated template fixture passing does not validate the consuming application.

## Repeatability

Retain working commands and approved scope. Do not replace runners, install unchanged
dependencies, or renegotiate the build system on subsequent adoption.
