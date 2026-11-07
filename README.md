# Agentic development environment

A working JS/TS development environment extracted from WorldGL: agent guidance,
formatting, linting, cognitive complexity, TypeScript metrics, dependency analysis,
structural reports, and Pi integrations. No WorldGL application or explorer code.

## Start a project

Create an independent repository from the template (for example, GitHub's
**Use this template**). Do not copy its `.git` directory into another repository.
Use Node.js 20.19+ or 22.12+ compatible with Vite; this extraction was tested with
Node.js 24.22.2 and npm 11.19.1.

```sh
npm ci
npm run check:report
```

Read [AGENTS.md](AGENTS.md), then replace [TASK.md](TASK.md) with the assignment.
Agents choose implementation details within its boundaries. Review the diff and
reported results; no task-management system is required.

`index.html`, `src/fixture.mjs`, `src/fixture.d.mts`, and `src/main.ts` are only a
neutral verification fixture for JS imports, TS checking, and the Vite build—not
an application starter. Replace them when developing real behavior.
`tests/quality.test.ts` exercises the fixture and runtime-global lint boundaries.
`npm run dev` and `npm run preview` serve the fixture; they are not agent launchers.

## Quality commands and semantics

| Command | Purpose |
| --- | --- |
| `format` / `format:check` | Write formatting / check without mutation |
| `lint` | Existing ESLint correctness, readability, and complexity rules |
| `test` | TypeScript tests through `tsx` and Node's test runner |
| `build` | TypeScript checking, then Vite build |
| `check` | Lint → tests → build; stops at the first failing group |
| `complexity` | Informational cognitive totals, maximum, and configured-limit findings |
| `metrics` / `metrics:html` | Existing `tsmetrics` reports; HTML writes ignored `metrics.html` |
| `dependencies` | Dependency-cruiser validation, including warning-level cycles |
| `structure` | First-party fan-out, transitive counts, and depth; no thresholds |
| `check:report` | Runs `check`, then all four report commands; retains command failures |

Formatting remains an agent instruction, not part of the aggregate gate.
ESLint warnings are not promoted to errors. Default cognitive limit is 5;
WorldGL's exceptions for its excluded simulation modules are not carried over.
A cognitive report can print `FAIL` and exit zero: lint enforces the limits.
Metric findings are not newly converted into gates. Report-command execution
failures still cause aggregate failure.

### Coverage and adaptation

Formatting scans `src/` and `tests/` for `.ts`, `.js`, and `.mjs`. Lint and cognitive
analysis cover both directories; lint also covers `scripts/check-report.mjs`, as
in WorldGL. Other reporting scripts/configuration are not silently added to lint
or formatting coverage. TypeScript includes `src` and `tests`.

Metrics scan both directories, but `tsmetrics` skips `.mjs`; ESLint/cognitive
analysis cover JavaScript. Dependency entry points are `src/` and `tests/*.ts`;
structural reporting filters to those two first-party directories. Vite retains
experiment-path protection in dev/preview and filesystem deny settings.

When paths change, update the affected package scripts, ESLint runtime bindings,
cognitive inputs, and structural filter together. Keep runtime globals scoped;
TypeScript's recommended lint rules disable `no-undef`, so compiler checks and
the JavaScript lint regression serve different roles. Preserve existing policies
unless changing them is explicitly part of the task.

Playwright remains available for real browser regressions. Provision Chromium
explicitly when needed (`npx playwright install chromium`); it is not installed
by the test command, and no model request is needed for browser tests.

## Pi and development feedback

Use an existing Pi installation and model configuration. `.pi/settings.json`
retains `@harms-haus/pi-lens`, `pi-web-access`, and `pi-skills-sh`. Review these
third-party packages before loading them; Pi manages their installation separately
from root `npm ci`. No global Pi installation or authentication store is bundled.

`.pi-lens.json` retains lint feedback and always-report behavior; its Prettier,
LSP, and tsc integrations remain disabled. Command-line verification remains
independent. Editor feedback can expose coverage gaps; reconcile discrepancies
rather than assuming either feedback source covers everything.

The declarations remain unpinned as in WorldGL. Actual package loading and model
access were not validated during this extraction. See [validation](docs/validation.md).

## Skills

Discover available skills through the agent environment or the retained
`pi-skills-sh` integration. Read the selected skill's instructions for a matching
task; technical-documentation is the existing documentation-work example.

Skill installation requires approval. WorldGL documents `magnus919/agent-skills`
and the command `npx skills add magnus919/agent-skills --skill technical-documentation --agent pi --global`.
The locally available skill instead records provenance from
`magnus919/hermes-profiles`. These are historical references, **not a verified
installation recommendation**. Confirm the intended source before installing;
this extraction does not silently choose one or install a global skill.

## Experiments and notes

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
Separate project-specific changes from reusable development-environment changes.
Propose the reusable portion back to `agentic-dev-template` with a short account
of the problem, change, validation, and relevant limitations for human review.

Agents may suggest improvements but must not modify the template from a consuming
project without explicit authorization. Project and template Git histories remain
independent. There is no automatic propagation, synchronization framework,
submodule, generator, mandatory retrospective, issue tracker, or promotion ceremony.

## Provenance and licensing

Derived from WorldGL's development infrastructure, not its application.
[Validation](docs/validation.md) records actual extraction results and limitations.
No license was supplied with WorldGL; no new license is asserted here. Resolve
licensing before distributing the template publicly.
