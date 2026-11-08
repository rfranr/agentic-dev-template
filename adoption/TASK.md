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

## Inspect and reconcile before discussion

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

Use the existing project as the source of truth for its technical environment,
existing explicit policies, and working quality gates. Use the **template's complete
configuration as the proposed baseline** for each missing capability: formatting
style, lint rules, complexity thresholds, severities, and command behavior.
Do not silently turn template blocking rules into advisory rules (or vice versa).
Template defaults are proposals, never automatic authorization; an existing
approved project policy takes precedence and any deviation must be visible.

- Infer routine facts such as runtime, paths, globals, and package manager.
- Adapt template paths, commands, and dependency versions to the project without
  treating those mechanical adaptations as new policy choices.
- Identify concrete incompatibilities, existing-policy conflicts, and consequential
  effects of adopting the baseline, such as current violations of blocking rules
  or widespread formatting changes; discuss those explicitly.
- Report existing technical debt without automatically fixing it.
- Never weaken existing blocking gates.
- Do not introduce CI changes without explicit approval.
- Do not install unreviewed Pi packages or optional native tooling.
- Do not modify application logic or existing tests merely to satisfy new tooling.

## Configure capabilities interactively

Treat each applicable capability as an interactive project scaffolding step
(like create-vite), not an open-ended requirements interview or a fixed
multi-capability questionnaire. Discuss **one capability at a time**.

Start from the **actual staged template configuration**, including rule values,
severities and exclusions. For capabilities with adjustable policy, show a
compact, editable proposal: the relevant rules, current template thresholds
and severities. A table is useful when comparing several rule settings; avoid
long explanations around it. For simpler capabilities, state the defaults
without inventing options that do not exist.

Give the human clear ways to respond in natural language:

- Accept the entire template baseline (e.g. "yes" or "use template defaults").
- Change severities globally or for selected rules (e.g. "all warnings").
- Change individual thresholds (e.g. "cognitive complexity 8").
- Disable or exclude selected rules, where supported.
- Restore the template defaults, or ask for more detail.

Interpret bulk changes as applying only to the current capability unless the
human explicitly broadens their scope. Retain every unspecified value exactly
as in the template. If a user changes one threshold, do not silently change
its severity or unrelated rules.

After a proposed change, show the **resulting configuration** (or concise
changed values plus unchanged template defaults) and allow corrections.
When the human accepts the capability, record all its rules, thresholds,
severities, scope and exclusions as one agreed decision and move on.
Do not repeatedly confirm individual rules after acceptance.

For each capability, briefly identify existing coverage, necessary project
adaptations and material risks. Preserve established project policy and
stronger existing gates; explain concrete conflicts rather than replacing
them silently. A template blocking rule that exposes existing debt remains
a blocker unless the human chooses otherwise. Do not automatically refactor,
format existing application code, suppress findings, or soften severity.

Skip policy questions for capabilities already satisfying an approved policy.
Mark genuinely inapplicable capabilities with a reason. Reuse documented
decisions on repeat runs; ask only for new or materially changed choices.
Do not equate silence with approval.

Configuration discussion is **policy selection, not permission to implement**.
Do not edit files, install dependencies, or execute commands that write project
files until the final integration authorization. Do not create a CLI wizard,
DSL, registry, recipe runner, or new persistent state mechanism.

## Confirm integration and execute

After the capability discussions, present **one concise combined plan** summarizing:

1. Which tools and scripts will be integrated, retained, or treated as inapplicable.
2. The agreed policies, coverage, and blocking versus advisory gates.
3. Dependency and configuration changes, meaningful risks, and unresolved conflicts.
4. Validation commands and expected report coverage.

Obtain **explicit human authorization BEFORE** modifying files, installing
dependencies, or running commands that write project files. This final authorization
permits implementation of the decisions already discussed; it is not an invitation
to repeat the wizard or request another approval for the same decisions.

If the human changes a choice, reconcile that capability and update the plan.
If nothing needs changing, report that outcome without requesting permission for
unnecessary work. If implementation uncovers changes outside the approved scope,
explain the delta and request approval for that delta only.

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
