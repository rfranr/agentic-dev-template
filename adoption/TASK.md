# Adopt agentic development tooling

## Objective and boundaries

Integrate the prepared reusable tooling with this project's existing workflow.
Bootstrap only copied resources: it did not execute tooling, install dependencies,
change application files, select thresholds, or approve any adaptation.
The bootstrap prepares resources. The agent integrates them. The human approves policies.

Start a fresh Pi session after bootstrap so project-local Skills are discovered.
Read existing project instructions first, then this task and the installation result
at `.agentic-adoption/RESULT.json`. Read the bundled Skills when relevant; their
dependencies are not installed. Existing project instructions remain authoritative;
if requirements conflict, ask the human rather than silently resolving them.

## Prepared resources and conflicts

The installation result is the generated inventory, separate from this methodology.
It lists each resource's template source, project-relative destination, kind
(`direct` or `staged`), and status (`installed` or `conflict`). `installed` means
copied or already identical; conflicting paths were NOT installed and their existing
contents remain untouched. Staging preserves template-relative paths.

If the result file conflicts, use the proposed result printed by bootstrap, not a
potentially stale on-disk result. If this task conflicts, bootstrap preserves it
and prints the proposed task. Request that terminal output from the human if needed.
The result does not list itself; its own status is reported in terminal output.

Do not overwrite conflicts. Compare the corresponding files in the source template
and propose an explicit resolution. Re-running bootstrap does not merge or upgrade
files. Missing sources or invalid plans stop bootstrap before writes. Expected
conflicts do not prevent installation of other resources. An unexpected I/O failure
stops installation without rollback: earlier copies remain. After an interrupted
run, obtain a successful rerun or inspect every resource before treating it as ready.

Review Pi package declarations before trusting/loading them: starting Pi may offer
to install third-party packages; bootstrap did not install or pin those packages.
Do not install unreviewed packages or overwrite existing Pi settings.

## Inspect, reconcile, and approve once

Inspect existing agent instructions, approved policies, languages, runtime, package manager,
source layout, tests, build system, CI, configurations, and command coverage.
Read the inventory and these relative recipes (paths also resolve after installation):

- [Formatting](checks/formatting.md)
- [Lint](checks/lint.md)
- [Cognitive complexity](checks/complexity.md)
- [TypeScript metrics](checks/metrics.md)
- [Dependencies](checks/dependencies.md)
- [Structure](checks/structure.md)
- [Tests and build](checks/tests-build.md)
- [Aggregate checks](checks/aggregate.md)

For each capability, determine whether it is satisfied, missing, partial, conflicting,
or genuinely inapplicable, with evidence and reasons. These are discussion aids, not
machine-readable states. Existing configuration and documented policies are sufficient;
do not create an adoption database or lockfile.

Use the existing project as the primary source of truth.

**Do not conduct a multi-question quality-policy wizard.**

Apply the following decision principles when preparing the integration proposal:

- Preserve existing conventions, tooling, commands, and quality gates.
- Infer runtime, paths, globals, and package manager from the project.
- Propose appropriate defaults only where no existing policy exists.
- Introduce new complexity thresholds as advisory by default.
- Report existing technical debt without automatically fixing it.
- Never weaken existing blocking quality gates.
- Do not introduce CI changes without explicit approval.
- Do not install unreviewed Pi packages or optional native tooling.
- Do not modify application logic or existing tests merely to satisfy new tooling.

Present **one concise integration proposal** containing:

1. What will be installed and integrated.
2. Which existing project conventions will be preserved.
3. Which new quality rules will be blocking versus advisory.
4. Any meaningful conflicts, risks, or exceptions.
5. The commands that will validate the integration.

Obtain **explicit human approval BEFORE** modifying files, installing dependencies,
or running commands that write project files. Ask for **one approval of the complete
proposal**; silence is not approval. Include dependency changes, coverage gaps, and
reasons for any inapplicable tooling. If nothing needs changing, report that outcome
without repeating policy negotiations or dependency installation.

Only ask individual questions when a genuine ambiguity, significant trade-off, or conflicting requirement cannot be resolved safely from existing project evidence.

Do not ask the human to confirm inferred facts or routine defaults.

After approval, proceed with integration and validation without requesting a second approval for the same decisions.

If new findings require changes outside the approved scope, explain the difference and request additional approval only for those changes.

## Apply approved adaptations

Follow the recipes for applicable capabilities, making only necessary approved changes.
Preserve already integrated tooling and unchanged approved decisions; do not rewrite
configurations or reinstall dependencies on an unchanged rerun. Never replace project
package files or lockfiles with staged snapshots. Align coverage across capabilities
and explain exceptions rather than silently omitting tools.

Keep mechanical installation, inventory, conflict detection, command execution,
exit-code collection, and report generation in existing scripts. Use judgment for
configuration adaptation, compatibility, coverage, and policy. No recipe runner is needed.

Reconcile Pi settings and feedback with approved tooling and propose project-specific
agent instructions. Template application fixtures and root instructions were not copied.
Integrate the actual delivered tools into the workflow: documentation pointing to
staged files alone is not completion. Preserve observable behavior and existing tests.

## Validation and completion

After approved integration, run formatting, lint, existing and added tests, build,
and all agreed quality/report commands. Command execution failures are blockers;
advisory findings are reviewed, not silently promoted to gates. Preserve the
agreed distinction between blocking checks and advisory reports, including dependency
cycle warnings and informational metrics. Do not weaken agreed policy or edit existing
tests merely to pass.

Review the diff for unintended application or behavior changes. Document:

- Integrated resources and approved deviations, with conflict resolutions.
- Exact validation commands and outcomes, including test and build results.
- Coverage gaps, total/maximum cognitive complexity, remaining violations,
  advisory findings, limitations, and unresolved conflicts or blockers.

Completion requires approved integration of all applicable tooling into the workflow,
passing agreed gates, successful report execution, and a clear summary of findings.
Do not claim unrun checks or declare completion while command failures remain.
