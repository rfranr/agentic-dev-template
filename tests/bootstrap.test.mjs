import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const template = fileURLToPath(new URL('..', import.meta.url));
const bootstrap = path.join(template, 'scripts/bootstrap.mjs');
const manifestPath = 'adoption/resources.json';
const manifest = JSON.parse(readFileSync(path.join(template, manifestPath)));
const resultPath = '.agentic-adoption/RESULT.json';
const taskPath = '.agentic-adoption/TASK.md';

function temporaryProject(context) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'agentic-bootstrap-'));

  context.after(() => rmSync(directory, { recursive: true, force: true }));

  return directory;
}

function run(target, source = template) {
  return spawnSync(process.execPath, [path.join(source, 'scripts/bootstrap.mjs'), target], { encoding: 'utf8' });
}

function put(directory, relative, contents) {
  const filename = path.join(directory, relative);

  mkdirSync(path.dirname(filename), { recursive: true });
  writeFileSync(filename, contents);
}

function fingerprint(filename) {
  const status = lstatSync(filename);
  const contents = status.isSymbolicLink() ? readlinkSync(filename) : readFileSync(filename);

  return {
    hash: createHash('sha256').update(contents).digest('hex'),
    modified: status.mtimeMs,
  };
}

function snapshot(directory, relative = '') {
  const result = {};

  for (const entry of readdirSync(path.join(directory, relative), { withFileTypes: true })) {
    const name = path.join(relative, entry.name);

    if (entry.isDirectory()) {
      Object.assign(result, snapshot(directory, name));
    } else {
      result[name] = fingerprint(path.join(directory, name));
    }
  }

  return result;
}

function templateFixture(context) {
  const fixture = temporaryProject(context);

  put(fixture, 'scripts/bootstrap.mjs', readFileSync(bootstrap));
  put(fixture, manifestPath, JSON.stringify(manifest));

  for (const resource of manifest) {
    put(fixture, resource.source, readFileSync(path.join(template, resource.source)));
  }

  return fixture;
}

function installationResult(target) {
  return JSON.parse(readFileSync(path.join(target, resultPath)));
}

test('empty installation delivers every manifest resource byte-for-byte and a separate inventory', (context) => {
  const target = temporaryProject(context);
  const result = run(target);

  assert.equal(result.status, 0, result.stderr);

  for (const resource of manifest) {
    assert.deepEqual(
      readFileSync(path.join(target, resource.destination)),
      readFileSync(path.join(template, resource.source)),
      resource.source,
    );
  }

  assert.deepEqual(
    installationResult(target).resources,
    manifest.map((resource) => ({ ...resource, status: 'installed' })),
  );
  assert.deepEqual(readdirSync(target).sort(), ['.agentic-adoption', '.pi', '.pi-lens.json']);
});

test('installation into an existing project preserves application, instructions and quality configuration', (context) => {
  const target = temporaryProject(context);
  const existing = [
    'package.json',
    'package-lock.json',
    'src/app.js',
    'tests/app.test.js',
    'eslint.config.mjs',
    '.prettierrc.json',
    'AGENTS.md',
    'TASK.md',
  ];

  for (const filename of existing) {
    put(target, filename, `existing ${filename}\n`);
  }

  const before = snapshot(target);

  assert.equal(run(target).status, 0);

  const after = snapshot(target);

  for (const filename of existing) {
    assert.deepEqual(after[filename], before[filename]);
  }
});

test('identical existing resources and repeated execution preserve bytes and modification times', (context) => {
  const target = temporaryProject(context);
  const resource = manifest[0];

  put(target, resource.destination, readFileSync(path.join(template, resource.source)));

  const identicalBefore = fingerprint(path.join(target, resource.destination));
  const first = run(target);

  assert.equal(first.status, 0, first.stderr);
  assert.ok(first.stdout.includes(`identical: ${resource.destination}`));
  assert.deepEqual(fingerprint(path.join(target, resource.destination)), identicalBefore);

  const before = snapshot(target);
  const second = run(target);

  assert.equal(second.status, 0, second.stderr);
  assert.doesNotMatch(second.stdout, /copied:|conflict:/);
  assert.deepEqual(snapshot(target), before);
});

test('preflight finds all conflicts before copying and preserves them while installing other resources', (context) => {
  const target = temporaryProject(context);
  const conflicts = ['.pi/settings.json', '.agentic-adoption/staging/eslint.config.mjs'];

  for (const filename of conflicts) {
    put(target, filename, 'existing project content\n');
  }

  const before = snapshot(target);
  const result = run(target);

  assert.equal(result.status, 1);
  assert.ok(result.stdout.startsWith(`Preflight: ${manifest.length} resources, 2 conflicts.`));
  assert.match(result.stdout, /copied:/);

  for (const filename of conflicts) {
    assert.ok(result.stdout.includes(`conflict: ${filename}`));
    assert.deepEqual(fingerprint(path.join(target, filename)), before[filename]);
  }

  assert.deepEqual(
    installationResult(target)
      .resources.filter((resource) => resource.status === 'conflict')
      .map((resource) => resource.destination),
    conflicts,
  );

  const installed = snapshot(target);

  assert.equal(run(target).status, 1);
  assert.deepEqual(snapshot(target), installed);
});

test('conflicting task and result files are preserved and proposed contents printed', (context) => {
  const target = temporaryProject(context);

  put(target, taskPath, 'human task');
  put(target, resultPath, 'human inventory');

  const before = snapshot(target);
  const result = run(target);

  assert.equal(result.status, 1);
  assert.ok(result.stdout.includes(`Proposed ${taskPath}`));
  assert.ok(result.stdout.includes(`Proposed ${resultPath}`));
  assert.ok(result.stdout.includes(readFileSync(path.join(template, 'adoption/TASK.md'), 'utf8')));
  assert.deepEqual(fingerprint(path.join(target, taskPath)), before[taskPath]);
  assert.deepEqual(fingerprint(path.join(target, resultPath)), before[resultPath]);
});

test('changed resources do not overwrite a previous result or methodology', (context) => {
  const target = temporaryProject(context);

  assert.equal(run(target).status, 0);
  put(target, '.pi/settings.json', 'project settings');

  const before = snapshot(target);
  const result = run(target);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /conflict: .pi\/settings.json/);
  assert.ok(result.stdout.includes(`Proposed ${resultPath}`));
  assert.deepEqual(snapshot(target), before);
});

test('manifest covers maintained Skills, reusable scripts and root quality/build references', () => {
  const maintained = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: template,
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean);
  const skillFiles = maintained.filter((name) => name.startsWith('.pi/skills/'));
  const scriptFiles = readdirSync(path.join(template, 'scripts'))
    .filter((name) => name !== 'bootstrap.mjs')
    .map((name) => `scripts/${name}`);
  const references = readdirSync(template).filter((name) =>
    /^(eslint\.config\.|\.prettier|\.dependency-cruiser\.|(?:package(?:-lock)?|tsconfig)\.json$|vite\.config\.)/.test(
      name,
    ),
  );
  const expected = [
    ...skillFiles,
    ...scriptFiles,
    ...references,
    '.pi/settings.json',
    '.pi-lens.json',
    'adoption/TASK.md',
    ...readdirSync(path.join(template, 'adoption/checks')).map((name) => `adoption/checks/${name}`),
  ];

  assert.deepEqual(manifest.map((resource) => resource.source).sort(), expected.sort());

  for (const resource of manifest) {
    const expectedDestination =
      resource.kind === 'staged' ? `.agentic-adoption/staging/${resource.source}` : resource.source;

    const destination = resource.source.startsWith('adoption/')
      ? resource.source.replace('adoption/', '.agentic-adoption/')
      : expectedDestination;

    assert.equal(resource.destination, destination);
  }
});

test('unlisted nested files, installed dependencies and generated artifacts are never discovered implicitly', (context) => {
  const fixture = templateFixture(context);
  const target = temporaryProject(context);

  for (const name of [
    'node_modules/pkg/index.js',
    'dist/result.js',
    '.cache/data',
    'coverage/result',
    'metrics.html',
    'unlisted.txt',
  ]) {
    put(fixture, `.pi/skills/maintainability-review/${name}`, 'not listed');
    put(fixture, `scripts/${name}`, 'not listed');
  }

  put(fixture, '.pi/npm/node_modules/pkg/index.js', 'not listed');

  assert.equal(run(target, fixture).status, 0);
  assert.deepEqual(
    Object.keys(snapshot(target)).sort(),
    [...manifest.map((resource) => resource.destination), resultPath].sort(),
  );
  assert.equal(
    readFileSync(path.join(target, '.pi/skills/joern-review/scripts/analyze.sc'), 'utf8'),
    readFileSync(path.join(template, '.pi/skills/joern-review/scripts/analyze.sc'), 'utf8'),
  );
});

test('external methodology is delivered unchanged with complete approval and validation requirements', (context) => {
  const target = temporaryProject(context);

  assert.equal(run(target).status, 0);

  const task = readFileSync(path.join(target, taskPath), 'utf8');

  assert.equal(task, readFileSync(path.join(template, 'adoption/TASK.md'), 'utf8'));

  for (const expected of [
    'existing agent instructions',
    'languages',
    'package manager',
    'runtime',
    'source layout',
    'tests',
    'build system',
    'CI',
    'Do not conduct a multi-question quality-policy wizard',
    'explicit human approval BEFORE',
    'dependency changes',
    'thresholds',
    'advisory reports',
    'Validation and completion',
    'RESULT.json',
    'checks/metrics.md',
    'total/maximum cognitive complexity',
    'fresh Pi session',
    'trusting/loading',
    'actual delivered tools',
    'silence is not approval',
    'do not create an adoption database or lockfile',
  ]) {
    assert.ok(task.includes(expected), expected);
  }

  assert.doesNotMatch(readFileSync(bootstrap, 'utf8'), /# Adopt agentic|interactive quality-policy wizard/);
});

test('installed orchestrator links every focused recipe and recipe conflicts remain safe', (context) => {
  const target = temporaryProject(context);
  const names = [
    'formatting',
    'lint',
    'complexity',
    'metrics',
    'dependencies',
    'structure',
    'tests-build',
    'aggregate',
  ];
  const conflict = '.agentic-adoption/checks/lint.md';

  put(target, conflict, 'approved project recipe');
  assert.equal(run(target).status, 1);
  assert.equal(readFileSync(path.join(target, conflict), 'utf8'), 'approved project recipe');

  const task = readFileSync(path.join(target, taskPath), 'utf8');

  for (const name of names) {
    const relative = `checks/${name}.md`;
    const source = `adoption/${relative}`;
    const destination = `.agentic-adoption/${relative}`;

    assert.ok(task.includes(`](${relative})`), relative);
    assert.ok(existsSync(path.resolve(target, path.dirname(taskPath), relative)), relative);
    assert.ok(manifest.some((resource) => resource.source === source && resource.destination === destination));

    const recipe = readFileSync(path.join(template, source), 'utf8');

    for (const heading of ['Detect', 'Reconcile', 'Apply', 'Verify', 'Repeatability']) {
      assert.ok(recipe.includes(`## ${heading}`), `${source}: ${heading}`);
    }
  }

  const before = snapshot(target);

  assert.equal(run(target).status, 1);
  assert.deepEqual(snapshot(target), before);
});

test('missing sources, including a late resource, prevent all writes and target creation', (context) => {
  const fixture = templateFixture(context);
  const parent = temporaryProject(context);
  const target = path.join(parent, 'not-created');

  rmSync(path.join(fixture, manifest.at(-1).source));

  const result = run(target, fixture);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing or unsafe template resource/);
  assert.equal(existsSync(target), false);
  assert.doesNotMatch(result.stdout, /copied:/);
});

test('unsafe manifest paths and colliding destinations are rejected before writes', (context) => {
  const fixture = templateFixture(context);
  const target = temporaryProject(context);
  const invalidResources = [
    { ...manifest[0], source: '../outside' },
    { ...manifest[0], destination: '../../outside' },
    { ...manifest[0], destination: '/absolute' },
    { ...manifest[0], destination: 'C:\\absolute' },
    { ...manifest[0], destination: '.pi/../outside' },
    { ...manifest[0], destination: manifest[0].destination },
    { ...manifest[0], destination: '.pi' },
    { ...manifest[0], destination: resultPath },
    { ...manifest[0], destination: `${resultPath}/child` },
    { ...manifest[0], kind: 'unknown' },
    { ...manifest[0], kind: 'staged', destination: '.agentic-adoption/staging/wrong-path' },
  ];

  for (const resource of invalidResources) {
    put(fixture, manifestPath, JSON.stringify([...manifest, resource]));

    const result = run(target, fixture);

    assert.equal(result.status, 1, JSON.stringify(resource));
    assert.deepEqual(readdirSync(target), []);
    assert.doesNotMatch(result.stdout, /copied:/);
  }
});

test('source symlinks, including manifest and parent symlinks, prevent all writes', (context) => {
  const outside = temporaryProject(context);
  const target = temporaryProject(context);

  put(outside, 'resource', 'outside');

  for (const source of [manifestPath, 'eslint.config.mjs', '.pi/skills']) {
    const fixture = templateFixture(context);
    const filename = path.join(fixture, source);

    rmSync(filename, { recursive: true, force: true });
    symlinkSync(path.join(outside, 'resource'), filename);

    const result = run(target, fixture);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing or unsafe template resource/);
    assert.deepEqual(readdirSync(target), []);
  }
});

test('overlapping paths and symlinked target roots are rejected without changes', (context) => {
  const parent = temporaryProject(context);
  const outside = temporaryProject(context);
  const alias = path.join(parent, 'alias');

  symlinkSync(outside, alias, 'dir');

  for (const target of [
    template,
    path.dirname(template),
    path.join(template, 'never-created'),
    alias,
    path.join(alias, 'child'),
  ]) {
    assert.equal(run(target).status, 1, target);
  }

  assert.deepEqual(readdirSync(outside), []);
  assert.equal(existsSync(path.join(template, 'never-created')), false);
});

test('destination symlinks, including dangling links, are conflicts and never followed', (context) => {
  const outside = temporaryProject(context);

  put(outside, 'settings', 'outside settings');

  const before = snapshot(outside);

  for (const destination of ['.pi', '.pi/settings.json', '.agentic-adoption', resultPath]) {
    const target = temporaryProject(context);
    const filename = path.join(target, destination);

    mkdirSync(path.dirname(filename), { recursive: true });
    symlinkSync(path.join(outside, 'does-not-exist'), filename);

    const result = run(target);

    assert.equal(result.status, 1, destination);
    assert.ok(result.stdout.includes('conflict:'), destination);
    assert.equal(lstatSync(filename).isSymbolicLink(), true);
  }

  const target = temporaryProject(context);

  symlinkSync(outside, path.join(target, '.pi'), 'dir');
  assert.equal(run(target).status, 1);
  assert.deepEqual(snapshot(outside), before);
});

test('file ancestors and directory leaves are preserved as conflicts', (context) => {
  const target = temporaryProject(context);

  put(target, '.pi', 'not a directory');
  mkdirSync(path.join(target, '.agentic-adoption/staging/eslint.config.mjs'), { recursive: true });

  const result = run(target);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /conflict: .pi\/settings.json/);
  assert.match(result.stdout, /conflict: .agentic-adoption\/staging\/eslint.config.mjs/);
  assert.equal(readFileSync(path.join(target, '.pi'), 'utf8'), 'not a directory');
  assert.equal(lstatSync(path.join(target, '.agentic-adoption/staging/eslint.config.mjs')).isDirectory(), true);
});

test('all sources, including manifest and methodology, remain unchanged during installation', (context) => {
  const fixture = templateFixture(context);
  const target = temporaryProject(context);
  const before = snapshot(fixture);

  assert.equal(run(target, fixture).status, 0);
  assert.deepEqual(snapshot(fixture), before);
});
