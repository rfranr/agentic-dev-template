# TypeScript metrics

## Detect

Inspect `tsmetrics`, `metrics` and `metrics:html` commands, input paths, and generated
HTML handling. Determine which project languages/syntax the tool can analyze.

## Reconcile

Compare staged package commands and dependencies. Both terminal analysis and HTML
report generation with appropriate coverage satisfy this capability. These are
package commands, not missing standalone scripts. Metrics remain informational;
explain incompatibilities or genuine inapplicability rather than silently dropping them.

## Apply

After approval, integrate `tsmetrics` from staged package references and both commands.
Adapt `tsmetrics analyze ./src ./tests` paths to the project; preserve
`--format html` output (template: `metrics.html`). Respect dependency lifecycle-script
trust requirements; do not copy package-manager approval settings blindly.

## Verify

Run `npm run metrics` and `npm run metrics:html` or approved equivalents. Confirm
successful analysis and inspect the generated HTML, not just the redirected file's
existence. Report parser limitations, skipped files, findings, and output location.

## Repeatability

Preserve working commands and dependencies. Regenerating a requested report does not
justify rewriting configuration or reinstalling unchanged dependencies.
