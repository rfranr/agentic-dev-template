# Lint

## Detect

Inspect ESLint version, configuration, plugins, language parsers, globals, ignores,
commands, CI gates, and covered source, tests, and tooling paths.

## Reconcile

Compare with staged `eslint.config.mjs` and package references. References are under
`../staging/` after bootstrap; inspect the corresponding template sources here.
Review recommended JS/TS rules, SonarJS, stylistic rules, cyclomatic complexity,
nesting, parameters, function size, statements, and readability rules. Existing
approved equivalents satisfy the capability; do not override their severities or
thresholds. Explain unsupported syntax, version conflicts, and rule disagreements.
Coordinate cognitive analysis with [complexity](complexity.md).

## Apply

After approval, adapt rather than replace configuration. Integrate applicable
`@eslint/js`, `eslint`, `typescript-eslint`, `eslint-plugin-sonarjs`, and
`@stylistic/eslint-plugin` dependencies from staged package references, respecting
runtime compatibility. Add missing lint commands, project globals, and path coverage;
retain approved exceptions and gates. Do not copy browser-fixture globals blindly.

## Verify

Run the project's lint command (template: `npm run lint`). Confirm intended files
are actually checked; report errors, warnings, ignored languages, and coverage gaps.
Do not suppress violations or alter application logic merely to pass adoption.

## Repeatability

Preserve working configuration and existing approved policies. Propose only missing
coverage or compatibility changes, not a fresh rule negotiation on every adoption.
