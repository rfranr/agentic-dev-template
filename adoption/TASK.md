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

## Inspect first; obtain approval

1. Inspect the repository and its existing agent instructions, documentation, and
   development workflow before proposing edits. Identify languages, package manager
   and lockfiles, runtime environments, source layout, tests, build system, CI,
   existing scripts/configurations, and current check coverage.
2. Inspect every installed tool and staged reference configuration using the inventory.
   Identify conflicts, missing dependencies, gaps, hard-coded paths, and integration
   requirements. Do not mistake copied resources for integrated or validated tooling.
3. Conduct an interactive quality-policy wizard with the human, not a silent policy
   selection: discuss languages and paths to cover, runtime globals and exclusions,
   formatting conventions, lint rules and complexity thresholds, blocking gates versus
   advisory reports, existing technical debt, and test/build commands. Explain the
   staged defaults and trade-offs; do not assume they are the project's policy.
4. Present a concrete integration plan covering all prepared tooling, proposed
   configuration and dependency changes, conflict resolutions, coverage, agreed
   policy, validation commands, and any tooling considered inapplicable with reasons.
   Do not silently omit tools or invent replacements for delivered scripts.
5. Obtain explicit human approval BEFORE changing project-specific files,
   installing packages, or running tooling that writes project files. Ask again
   if new findings require changes outside the approved plan.

## Integrate all approved tooling

- Adapt staged ESLint, Prettier and dependency-cruiser configurations to project paths
  and runtimes. Do not blindly replace existing configurations.
- Integrate the delivered cognitive complexity, structural analysis and aggregate
  report scripts together, preserving their relative references or deliberately
  updating them. Inspect the inventory for all reusable scripts to integrate.
- Use staged package.json and package-lock.json as references for dependencies and
  commands: check, check:report, complexity, metrics/metrics:html, dependencies,
  structure, formatting, lint, tests and build. TypeScript metrics and the aggregate
  check are package commands, not missing standalone scripts. Never replace the
  project's package manifest or lockfile with these template snapshots.
- Assess staged tsconfig.json and vite.config.ts as fixture-specific build references;
  retain the project's build system unless an approved change is needed. Preserve
  useful testing/build capabilities, including browser testing when applicable.
- Align coverage across lint, cognitive analysis, TypeScript metrics, dependencies,
  structural filters, formatting, tests and build. Inspect hard-coded paths in scripts.
- Reconcile Pi settings and feedback with approved tooling. Propose project-specific
  agent instructions; template application fixtures and root instructions were not copied.
- Integrate the actual delivered tools into the project's own workflow. Documentation
  pointing to staged files alone is not completion. Preserve observable application
  behavior and existing tests unless an approved task explicitly requires changes.

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
