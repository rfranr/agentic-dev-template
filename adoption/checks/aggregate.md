# Aggregate checks and reports

## Detect

Inspect `check`, `check:report`, CI/agent feedback, and the command graph. Identify
blocking gates, advisory reports, and whether failures survive aggregation.

## Reconcile

Compare staged package commands and `scripts/check-report.mjs`. `check` is a package
command, not a missing standalone script. Existing integration satisfies this
capability when approved gates run and all applicable reports execute with nonzero
command results retained. Preserve existing stronger gates and advisory policy.

## Apply

After approval, integrate the delivered `check-report.mjs` and missing aggregate
commands. Template `check` runs lint, tests, and build; its reporter runs `check`,
`complexity`, `metrics`, `dependencies`, and `structure`, attempting all and collecting
failures. Adapt command/package-manager names deliberately without losing that behavior.
Ensure all four reusable scripts remain integrated: `check-report.mjs`,
`complexity-report.mjs`, `run-structure.mjs`, and `structure.mjs`, with their dependencies.
Formatting checks, separate typechecks, and HTML generation must also be validated
where applicable, even if they are not part of the template aggregate command.

## Verify

Run the approved aggregate commands (template: `npm run check:report`) and any separate
formatting/typecheck/HTML commands. Confirm every intended command ran and failures
were not masked. Review lint, cognitive, dependency, TypeScript, and structural findings.
Command execution failures block completion even for informational reports; printed
advisory findings alone are not new exit-code gates. Record exact outcomes and gaps.

## Repeatability

Preserve equivalent aggregate wiring and approved gate distinctions. Revalidation is
not a reason to rewrite scripts or reopen unchanged policy decisions.
