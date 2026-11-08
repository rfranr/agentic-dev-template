# Cognitive complexity

## Detect

Inspect SonarJS cognitive rules, approved limits/severities, the `complexity` command,
and any installed `scripts/complexity-report.mjs`, including its hard-coded paths.

## Reconcile

Compare with the staged report script and ESLint/package references. A working
report using actual project thresholds plus approved lint enforcement satisfies
this capability. Preserve existing blocking limits; propose new limits as advisory
by default, not as automatic debt remediation.

## Apply

After approval, integrate the delivered `complexity-report.mjs`, the `complexity`
command, and its ESLint/SonarJS dependencies with [lint](lint.md). Adapt analyzed
paths to the project. The script's analysis-only zero threshold collects scores;
it must not replace the project's configured enforcement threshold.

## Verify

Run lint and `npm run complexity` (or approved equivalents). Review total and maximum
scores and violations against configured limits. Report excluded files/languages,
disabled cognitive rules, and parser failures; an empty report is not proof of coverage.
The report is informational; lint enforces approved cognitive limits.

## Repeatability

Keep an already integrated report and unchanged thresholds. Do not rewrite the
script, renegotiate limits, or install packages when existing integration suffices.
