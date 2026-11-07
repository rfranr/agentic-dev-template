# Agentic development environment

A working JavaScript/TypeScript (JS/TS) development environment extracted from
WorldGL. It gives a coding agent instructions, repeatable quality checks, and
feedback while editing—without including WorldGL's application or explorer code.

It provides:

- **Agent guidance and tasks:** boundaries and objectives, with room for engineering judgment.
- **Formatting and linting:** consistent layout and automated checks for code problems.
- **Complexity and structure reports:** ways to inspect difficult logic and relationships between files.
- **Tests and a build:** executable checks and TypeScript validation.
- **Pi integrations and skills:** development feedback and specialized task guidance.

A tiny browser page exercises the tools. It is a verification **fixture** (sample
input for checks), not an application starter.

## Quickstart: create a project and try Pi

You need Git, npm, and a compatible Node.js installation. Node.js 24.22.2 with
npm 11.19.1 was used for validation. Vite, the browser development/build tool,
requires Node.js 20.19+ or 22.12+; current Pi requires Node.js 22.19 or newer.
Use Node.js 24 to satisfy both for this walkthrough.

1. Open [the template on GitHub](https://github.com/rfranr/agentic-dev-template).
   Choose **Use this template → Create a new repository** and name it `my-project`.
   This creates independent Git history; do not copy the template's `.git` directory.
2. Run these commands, entering the owner of your new repository when prompted:

   ```sh
   printf 'GitHub username or organization: '
   read -r GITHUB_OWNER
   git clone "https://github.com/$GITHUB_OWNER/my-project.git"
   cd my-project
   npm ci
   npm run check:report
   ```

   `npm ci` installs the local development tools at the versions recorded in
   `package-lock.json`. The next command runs the checks and reports described below.
3. Use your existing Pi installation and model configuration. From the project directory:

   ```sh
   pi
   ```

   Review the third-party package declarations in `.pi/settings.json` before
   granting project trust or loading them. Pi manages these packages separately
   from `npm ci`; the repository does not bundle a global Pi installation or
   authentication store. If you do not have Pi, install it using its
   [installation instructions](https://github.com/earendil-works/pi/tree/main/packages/coding-agent#getting-started).
   For a built-in provider, use `/login` inside Pi to configure access if needed,
   then `/model` to select a model you have configured.
4. Try this prompt in Pi:

   ```text
   Read AGENTS.md and TASK.md. Inspect this repository and explain which files
   are the verification fixture and which are reusable tooling. Do not modify files yet.
   ```

For actual development, replace `TASK.md` with your assignment. Agents choose
implementation details within its boundaries. Review their diff and verification
results; no task-management system is required. See [AGENTS.md](AGENTS.md).

## What the quality checks tell you

Run `npm run check:report` to run the main checks and then collect reports.
A **blocking gate** is a check that must pass before completion; an **advisory
report** supplies findings to review rather than an automatic rejection.

### What blocks completion

- **Lint errors:** ESLint checks correctness, readability, and configured complexity limits.
  Warnings stay warnings; they are not promoted to errors.
- **Failed tests:** tests run TypeScript through `tsx`, using Node's test runner.
- **Failed build:** TypeScript checks types, then Vite builds the browser files.
- **Command failures:** a check or report that cannot execute successfully is a blocker,
  even when its normal findings are advisory.

`check` runs lint → tests → build and stops at the first failing group.
`check:report` then runs the cognitive, TypeScript metrics, dependency, and
structural report commands. It continues through those groups and retains their
nonzero exit statuses (the numbers commands return to indicate failure).
See the pipeline limitation under [known limitations](#known-limitations).

### What is advisory

- **Cognitive complexity** estimates how hard control flow is to follow, such as
  nested conditions. Lint enforces the default limit of 5. The separate report
  shows totals, maximum, and configured-limit findings; it can print `FAIL` and
  still exit zero because enforcement belongs to lint. WorldGL's exceptions for
  its excluded simulation modules are not carried over.
- **TypeScript metrics** from `tsmetrics` provide additional code measurements.
  Their findings are not new gates.
- **Dependency cycles** are files importing one another in a loop. Dependency-cruiser
  checks them at warning severity, not error severity.
- **Structural metrics** describe project-owned files: fan-out is the number of
  direct dependencies; transitive count includes dependencies reached indirectly;
  depth measures the longest chain. These have no blocking thresholds.

Review and report advisory findings; a successful command does not mean it found
nothing. These measurements do not replace human review or establish application quality.

### Formatting is separate

`npm run format` writes consistent formatting with Prettier. `npm run format:check`
checks formatting without editing files. Formatting remains an agent instruction,
not part of `check:report`.

## Adapt the environment to a real project

1. **Write the task.** Replace [TASK.md](TASK.md) with your objective, required behavior,
   boundaries, and observable acceptance criteria.
2. **Replace the fixture.** `index.html`, `src/fixture.mjs`, `src/fixture.d.mts`, and
   `src/main.ts` exist only to exercise JavaScript imports, TypeScript checking,
   and Vite. Replace them when developing real behavior.
   `tests/quality.test.ts` checks the fixture and runtime-global lint boundaries;
   replace fixture-specific assertions while retaining useful tooling regressions.
3. **Add behavior tests.** The existing fixture tests do not verify your application.
   Playwright is available for real browser regression tests (checks that behavior
   still works after changes). Provision Chromium explicitly when needed:

   ```sh
   npx playwright install chromium
   ```

   The test command does not install a browser, and browser tests need no model request.
4. **Check coverage when paths change.** Update affected package scripts, ESLint
   runtime bindings, cognitive inputs, and structural filters together. Runtime
   bindings declare names available in a particular environment, such as Node's
   `process` or the browser's `window`; do not allow browser globals everywhere.
   Exact current coverage is listed in the reference below.
5. **Preserve policy unless changing it is the task.** Do not silently change rules,
   thresholds, or blocking/advisory semantics during project adaptation.

`npm run dev` serves the fixture during development. After building,
`npm run preview` serves the built output. Neither command launches an agent.

### Experiments and notes

Create `experiments/<question>/` for a real investigation, not a generic framework.
No explorer launcher, navigation helpers, exports, or generated workspaces are
included. New maintained paths need deliberate verification coverage; there is
no blanket experiment exclusion or automatic inclusion.

Record whether reused local files affect an experiment and preserve relevant
versions when needed. Keep claims separate from observed outcomes. Optional
[journal guidance](docs/journal-plan.md) keeps notes short; no entry is required
per task. Retain useful assignments under `docs/tasks/` when helpful.

## Contributing improvements

Start a project from this template and develop normally. When friction or a
missing capability appears, fix it in the project and validate it there first.
Separate project-specific behavior from reusable environment changes. Propose
the reusable portion back to `agentic-dev-template` with a short account of the
problem, change, validation, and relevant limitations for human review.

For example, an import rule tied to your application may belong only in your
project; a correction to how a shared report handles failures may be reusable.

Agents may suggest improvements but must not modify the template from a consuming
project without explicit authorization. Project and template Git histories remain
independent. There is no automatic propagation, synchronization framework,
submodule, generator, mandatory retrospective, issue tracker, or promotion ceremony.

## Technical reference and known limitations

### Command reference

All command names below are invoked with `npm run`, for example `npm run lint`.

| Command | Purpose |
| --- | --- |
| `dev` / `preview` | Serve development files / built browser output |
| `format` / `format:check` | Write formatting / check without mutation |
| `lint` | ESLint correctness, readability, and complexity rules |
| `test` | TypeScript tests through `tsx` and Node's test runner |
| `build` | TypeScript checking, then Vite build |
| `check` | Lint → tests → build; stops at the first failing group |
| `complexity` | Informational cognitive totals, maximum, and configured-limit findings |
| `metrics` / `metrics:html` | `tsmetrics` reports; HTML writes ignored `metrics.html` |
| `dependencies` | Dependency-cruiser validation, including warning-level cycles |
| `structure` | Project-owned fan-out, transitive counts, and depth; no thresholds |
| `check:report` | Runs `check`, then all four report commands; retains their failure statuses |

### Exact coverage

Formatting scans `src/` and `tests/` for `.ts`, `.js`, and `.mjs`. Lint and cognitive
analysis cover both directories; lint additionally covers all maintained code in
`scripts/`, with Node.js globals scoped to those scripts. Reporting scripts and
configuration are not added to formatting coverage. TypeScript includes `src`
and `tests`.

Metrics scan both directories, but `tsmetrics` skips `.mjs`; ESLint/cognitive
analysis cover JavaScript. Dependency entry points are `src/` and `tests/*.ts`;
structural reporting filters to those two project-owned directories. Vite retains
experiment-path protection in dev/preview and filesystem deny settings, which
restrict access to configured private files.

TypeScript's recommended lint rules disable `no-undef`, the rule for undeclared
names. Compiler checks and the JavaScript lint regression therefore serve different roles.

### Pi and development feedback

`.pi/settings.json` retains `@harms-haus/pi-lens`, `pi-web-access`, and
`pi-skills-sh`. Package declarations remain unpinned (not fixed to exact versions),
as in WorldGL. Actual loading and model access were not validated during extraction.

`.pi-lens.json` retains lint feedback and always-report behavior. Its Prettier,
LSP (language-server editor support), and tsc (TypeScript compiler) integrations
remain disabled. Command-line verification remains independent. Editor feedback
can expose coverage gaps; reconcile discrepancies rather than assuming either
feedback source covers everything.

### Skills

Skills are specialized instructions an agent can load for a matching task.
Discover them through the agent environment or the retained `pi-skills-sh`
integration. Read the selected skill before using it; technical-documentation is
the existing documentation-work example.

Skill installation requires approval. WorldGL documents `magnus919/agent-skills`
and the command `npx skills add magnus919/agent-skills --skill technical-documentation --agent pi --global`.
The locally available skill instead records provenance from
`magnus919/hermes-profiles`. These are historical references, **not a verified
installation recommendation**. Confirm the intended source before installing;
this extraction does not silently choose one or install a global skill.

### Known limitations

- The `structure` command runs dependency-cruiser and the reporter in sequence.
  Failures from either step now stop the command with a nonzero exit code; the
  output and advisory metrics themselves are unchanged.
- Pi package loading, model access, and skill-source provenance remain unverified
  in the extracted environment; browser and platform coverage are limited.
- The fixture checks tools, not a consuming application's behavior. Passing checks
  establish only what their actual coverage supports.

[Validation](docs/validation.md) records executed checks, historical results, and
limitations; do not treat historical counts as a guarantee for your checkout.

### Provenance and licensing

Derived from WorldGL's development infrastructure, not its application.
No license was supplied with WorldGL; no new license is asserted here. Resolve
licensing before distributing the template publicly.
