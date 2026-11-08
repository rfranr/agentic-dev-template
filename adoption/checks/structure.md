# Structural analysis

## Detect

Inspect the `structure` command, `scripts/run-structure.mjs` and `scripts/structure.mjs`,
Dependency Cruiser availability, input paths, filters, and report interpretation.

## Reconcile

Compare both delivered scripts and staged package references. A runner producing a
valid dependency graph for the analyzer with appropriate project coverage satisfies
this capability. Structural metrics are informational, not new architecture gates.
Inspect hard-coded source/test discovery and package-manager invocation; explain gaps.

## Apply

After approval, integrate both delivered scripts and the `structure` command, keeping
their relative references or explicitly adapting them. Preserve the shared
`dependency-cruiser` dependency. Adapt runner entry paths, include filters, and analyzer
filters together. Retain subprocess failure propagation; do not substitute documentation
or an unrelated metric for the delivered analyzer.

## Verify

Run `npm run structure` or the approved equivalent. Confirm graph generation and
analysis both succeed. Review structural findings and report excluded modules,
resolution limitations, and the difference between graph evidence and code correctness.

## Repeatability

Preserve an equivalent working runner/analyzer pair and coverage. No script rewrite
or new installation is needed for an unchanged integrated project.
