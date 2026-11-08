# Dependency analysis

## Detect

Inspect Dependency Cruiser dependencies, configuration, commands, resolution settings,
entry paths, exclusions, and approved architectural rules and cycle policy.

## Reconcile

Compare staged `.dependency-cruiser.cjs` and package references. Existing working
Dependency Cruiser coverage and approved rules satisfy the capability. Preserve
cycle warnings and existing stronger gates; do not silently promote warnings or
weaken rules. Explain unresolved imports and configuration/version conflicts.

## Apply

After approval, merge missing configuration, add the `dependency-cruiser` dependency
and `dependencies` command as needed, and adapt paths and TypeScript resolution.
Coordinate the shared dependency with [structure](structure.md); do not replace
existing architecture policy with template defaults.

## Verify

Run `npm run dependencies` or the approved equivalent. Review violations, cycle
warnings, unresolved imports, and excluded paths. Distinguish findings from command
execution failures and explain graph coverage limitations.

## Repeatability

Leave equivalent configurations, rules, and commands intact. Propose only necessary
coverage or compatibility changes; do not reinstall the shared dependency needlessly.
