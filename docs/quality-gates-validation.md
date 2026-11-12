# Quality-gates refactor validation

## Scope and environment

Executed on branch `bootstrap`, starting at `ff3a9ab`. `main` was not checked out,
modified or advanced. No application source was changed.

- Linux x64; Node.js 24.22.2; npm 11.19.1; pnpm 11.3.0.
- Template integration target: clean local clone of `bootstrap` at `ff3a9ab`,
  before this refactor. This exercises the existing fixture and its original tests.
- `memory-cli` integration target: clean local clone at `7803fe7`, without the
  original working directory's untracked files, databases, environment file or
  installed dependencies.
- All integration directories, logs, dependency stores and temporary test targets
  were created under ignored `.validation/` inside this repository. No changes
  were made to the original `memory-cli` checkout.

The installer was copied with its bounded Skill distribution to
`.validation/tool-source/`, without node_modules. This permits sibling target
installation while retaining the installer's source/target-overlap rejection.
The fixture used the separately installed `.validation/final-tool-host/` Skill;
`memory-cli` used the Skill installed into its own `.pi/skills/quality-gates/`.
The fixture's pre-refactor adoption tooling was not rewritten or removed to make
its historical tests pass. Only the refactored repository replaces that workflow.

## Executed integration results

All successful rows below exited zero; blank ESLint output meant **0 errors and
0 warnings**, not a skipped lint invocation. Formatting used check mode, not write.

| Check                              | Existing template fixture                             | Clean memory-cli                                                |
| ---------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| Formatting                         | Pass: `src`, `tests`                                  | Pass: `src`, `test`                                             |
| ESLint + SonarJS                   | Pass: `src`, `tests`, `scripts`                       | Pass: `src`, `test`, `scripts`                                  |
| Cognitive report                   | Total **28**, maximum **5**, violations **0**         | Total **119**, maximum **5**, violations **0**                  |
| Dependency report                  | No violations; 526 modules / 922 dependencies cruised | No violations; 46 modules / 121 dependencies cruised            |
| Structure report                   | Maximum depth **1**                                   | Maximum depth **4**                                             |
| tsmetrics text                     | 2 files, 4 functions, 51 LOC                          | 37 files, 244 functions, 2,828 LOC                              |
| tsmetrics HTML                     | Executed successfully                                 | Executed successfully                                           |
| Existing application/tooling tests | **23/23** original Node tests                         | **49/49** Vitest tests in 16 files; **9/9** tooling tests       |
| Existing typecheck                 | Build's `tsc --noEmit` passed                         | Existing `typecheck` script passed with TypeScript **6.0.3**    |
| Existing build                     | Existing `build` passed (`tsc` + Vite)                | Existing `build` passed (`tsc`)                                 |
| Standalone Skill `check:report`    | Passed, delegating `test`, `build`                    | Passed, delegating `test`, `test:tooling`, `typecheck`, `build` |

Cognitive, metrics and architecture inputs were `src` plus the target's test
directory. Lint additionally selected `scripts`. Dependency and structure commands
used `--tsconfig tsconfig.json` for the fixture and `--tsconfig tsconfig.build.json`
for memory-cli. Node globals were explicitly scoped to tests and scripts, plus
memory-cli's source. Only the fixture's `src/main.ts` received browser `window`.
Absolute input paths and trailing-directory slashes were also executed successfully.

The fixture has **no standalone `typecheck` script**. Requesting it explicitly
returned exit 1 with `Project script does not exist: typecheck`; it was not silently
skipped or synthesized. Its existing build supplies compiler verification.

### Non-destructive installation and execution

SHA-256 inventories of **every tracked file** were taken before installation/checks
and compared after all checks, including the aggregate runs. Both comparisons
were identical. This covers target application code, manifests, npm/pnpm lockfiles,
Prettier/ESLint/Dependency Cruiser configs, TypeScript configs, package-manager
configuration, and agent instructions. Git showed no tracked changes. The only
untracked addition in memory-cli was the deliberately installed Skill.

After installing dependencies in memory-cli's Skill, the installer was rerun:
**exit 0**, with all Skill bytes and modification times unchanged, including its
node_modules. A separate target with an existing customized last resource
(`scripts/verify.mjs`) returned **exit 1** before copying anything; the entire
before/after snapshot was identical. Automated installer tests also covered missing
late sources, source/target overlap, source and destination symlinks (including
dangling links), file ancestors, directory leaves, project-file preservation and
exclusion of unlisted artifacts/dependencies.

### Dependency and TypeScript resolution

From the installed Skill, Node's `findPackageJSON` resolved ESLint, SonarJS,
Prettier, Dependency Cruiser, tsmetrics and TypeScript under:

```text
.validation/memory-cli/.pi/skills/quality-gates/node_modules/
```

The Skill uses TypeScript **5.9.3**; memory-cli retains **6.0.3**. No target module
resolution flags, manifests or configs were changed. Automated tests in a project
with `lib/` and `spec/` and no local node_modules resolved `@lib/*` aliases through
an explicitly selected tsconfig and retained warning-only dependency cycles.
That test also checked structure output excludes node_modules and resolves the
expected project depth. Effective ESLint rules and runtime globals were compared
against the old checkout for `src/main.ts`, `src/probe.mjs`, `tests/probe.test.ts`,
`tests/probe.test.mjs` and `scripts/probe.mjs`: every rule and binding was identical. This verifies the exercised resolution paths, not every
TypeScript 6 feature or monorepo layout.

## Provisioning results and limitations

- Skill `npm ci` succeeded in its own directory, independently of target package
  installation. Tool versions remain the existing template's versions, now pinned
  in the Skill lockfile. No global package was installed.
- Fixture `npm ci` succeeded.
- The first frozen memory-cli pnpm installation returned exit 1 because its existing
  `allowBuilds` policy did not approve its own tsmetrics postinstall. pnpm added a
  placeholder entry to `pnpm-workspace.yaml`. That incidental setup change was
  explicitly restored before taking the quality-run baseline; it was **not** kept
  as an integration change. SQLite's approved native install completed.
- Repeating the frozen install with `--ignore-scripts` succeeded without tracked
  changes. The Skill's independently installed tsmetrics binary was used for all
  Skill checks. This does **not** establish that memory-cli's own `pnpm metrics`
  command works after that lifecycle-disabled setup; it was not substituted for
  the Skill command or claimed as verified.
- `npm audit --prefix .pi/skills/quality-gates --json` returned exit 1: **11 moderate,
  0 high, 0 critical** dependency advisories. The reported chain includes minimatch
  and ESLint/TypeScript-ESLint consumers. Versions were not upgraded or policies
  weakened to conceal this finding. Audit is not an existing quality-gate command.
- tsmetrics 0.4.0 executed in both text and HTML modes on this Linux host; its native
  tree-sitter parser is independent of the target TypeScript compiler. It skips
  `.mjs`, so its file totals are intentionally narrower than lint/cognitive coverage.
  Installation requires the supported platform binary/GitHub release access.
- The bundled ESLint policy remains non-type-aware. Target compiler/types/framework
  resolution is validated only through the project's delegated commands.
- External configs require explicit flags and their own resolvable imports.
  Prettier override configs are JSON only; target `.prettierignore` and `.editorconfig`
  are not automatically loaded. Directory formatting retains `.ts`, `.js`, `.mjs`
  coverage. Missing runtime globals require explicit appropriate configuration,
  not broad implicit browser/Node bindings.
- Windows, Yarn PnP, symlinked source trees, multiple-tsconfig monorepos, newer syntax
  unsupported by the Skill's compiler/parser, and framework-specific compilation
  have not been established as supported. Large dense cyclic graphs retain the
  original structural depth calculation's potentially expensive traversal.
- Delegated scripts can create generated outputs or run arbitrary project lifecycle
  code. The Skill does not sandbox them or promise that arbitrary project scripts
  never mutate tracked files; the two exercised targets did not do so.

## Refactored template verification

Executed `npm run format`, `npm run check:report`, and reviewed ESLint, cognitive,
TypeScript metrics, dependency and structural output:

- **25 tests passed**, 0 failures; build/typecheck passed.
- **0 lint errors, 0 warnings; 0 cognitive-limit violations.**
- Normal cognitive report (`src`, `tests`): total **15**, maximum **4**.
- Expanded maintained-code cognitive report (also root scripts, Skill scripts and
  shared ESLint policy): total **100**, maximum **4**, violations **0**.
- For context, the old checkout's report over its source/tests/root scripts/ESLint
  policy was total **73**, maximum **5**. The new expanded scope includes newly
  executable Skill modules and regression tests; the increased total is not a
  same-size-codebase regression measure. Normal source/test total changed **28 → 15**
  primarily because obsolete adoption tests were replaced.
- tsmetrics: 2 TypeScript files / 4 functions; `.mjs` tooling is outside its parser
  coverage. Dependency output contained no violations. Structure maximum depth **1**.
- `git diff --check` passed.

The replacement tests exercise threshold values, cognitive score 6 failing lint
but not the advisory report, explicit runtime bindings, formatting mutation only
on request, explicit alternate config paths, path aliases and warning-level cycles,
text/HTML metrics, ordered delegation and stop-on-failure, missing script preflight,
parse errors and aggregate failure retention. Existing fixture and structure-runner
regressions were retained unchanged.

## Reproduction

Clone clean targets under `.validation/`, install their existing dependencies, and
install the Skill into a separate tool host or the target. The installer cannot
install into its own source tree; use a separate bounded distribution when keeping
validation targets inside the same repository.

Representative standalone commands (adjust absolute paths):

```sh
SKILL=/absolute/path/to/installed/quality-gates
PROJECT=/absolute/path/to/clean/memory-cli
CLI="$SKILL/scripts/quality-gates.mjs"

npm ci --prefix "$SKILL"
node "$CLI" format:check --root "$PROJECT" --input src --input test
node "$CLI" lint --root "$PROJECT" --input src --input test --input scripts \
  --node-files 'src/**/*.{ts,js,mjs}' --node-files 'test/**/*.{ts,js,mjs}' \
  --node-files 'scripts/**/*.{ts,js,mjs}'
node "$CLI" cognitive --root "$PROJECT" --input src --input test
node "$CLI" dependencies --root "$PROJECT" --input src --input test --tsconfig tsconfig.build.json
node "$CLI" structure --root "$PROJECT" --input src --input test --tsconfig tsconfig.build.json
node "$CLI" metrics --root "$PROJECT" --input src --input test
node "$CLI" metrics:html --root "$PROJECT" --input src --input test > /chosen/path/metrics.html
node "$CLI" verify --root "$PROJECT" --package-manager pnpm \
  --script test --script test:tooling --script typecheck --script build
```

For the fixture use `tests` instead of `test`, `tsconfig.json`, browser pattern
`src/main.ts`, and verification scripts `test` and `build` with npm. Hash all tracked
files before and after using `git ls-files -z | xargs -0 sha256sum` from each target.
Keep temporary test directories inside the repository via `TMPDIR` when running
its old bootstrap tests.

Detailed execution logs remain local under ignored `.validation/`; this document
is the versioned record. Successful checks establish only their stated coverage.
