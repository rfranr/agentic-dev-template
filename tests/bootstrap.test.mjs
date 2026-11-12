import assert from 'node:assert/strict';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fingerprint, install, installerFixture, put, skill, snapshot, temporaryProject } from './gates-support.mjs';

// Adoption wizard assertions are replaced because that distribution no longer exists.
// Preservation, preflight and filesystem safety remain installer requirements.
test('installer delivers only the complete Skill, with no staging or Pi settings', (context) => {
  const source = installerFixture(context);
  const target = temporaryProject(context);
  const result = install(source, target);

  assert.equal(result.status, 0, result.stderr);
  const installed = snapshot(path.join(target, skill));
  const bundled = snapshot(path.join(source, skill));

  assert.deepEqual(Object.keys(installed).sort(), Object.keys(bundled).sort());

  for (const filename of Object.keys(bundled)) {
    assert.equal(installed[filename].hash, bundled[filename].hash, filename);
  }
});

test('installer preserves project files and identical reruns preserve Skill bytes and mtimes', (context) => {
  const source = installerFixture(context);
  const target = temporaryProject(context);
  const projectFiles = [
    'package.json',
    'package-lock.json',
    'pnpm-lock.yaml',
    'eslint.config.mjs',
    '.prettierrc.json',
    '.pi/settings.json',
    'src/app.ts',
    'AGENTS.md',
  ];

  for (const filename of projectFiles) {
    put(target, filename, `existing ${filename}`);
  }

  const before = snapshot(target);

  assert.equal(install(source, target).status, 0);

  for (const filename of projectFiles) {
    assert.deepEqual(fingerprint(path.join(target, filename)), before[filename]);
  }

  const installed = snapshot(target);
  const repeat = install(source, target);

  assert.equal(repeat.status, 0, repeat.stderr);
  assert.doesNotMatch(repeat.stdout, /copied:/);
  assert.deepEqual(snapshot(target), installed);
});

test('a late conflict stops all copies, without overwriting an existing Skill', (context) => {
  const source = installerFixture(context);
  const target = temporaryProject(context);
  const filename = `${skill}/scripts/verify.mjs`;

  put(target, filename, 'customized Skill');

  const before = snapshot(target);
  const result = install(source, target);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /conflict:.*verify.mjs/);
  assert.deepEqual(snapshot(target), before);
  assert.equal(install(source, target).status, 1);
});

test('missing late source stops before creating target', (context) => {
  const source = installerFixture(context);
  const parent = temporaryProject(context);
  const target = path.join(parent, 'new-project');

  rmSync(path.join(source, skill, 'scripts/verify.mjs'));

  const result = install(source, target);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing or unsafe Skill resource/);
  assert.equal(existsSync(target), false);
});

test('unlisted installed dependencies and artifacts are never copied', (context) => {
  const source = installerFixture(context);
  const target = temporaryProject(context);

  for (const filename of ['node_modules/pkg/index.js', 'metrics.html', 'unlisted.mjs']) {
    put(source, `${skill}/${filename}`, 'not distributed');
  }

  assert.equal(install(source, target).status, 0);
  assert.equal(existsSync(path.join(target, skill, 'node_modules')), false);
  assert.equal(existsSync(path.join(target, skill, 'metrics.html')), false);
  assert.equal(existsSync(path.join(target, skill, 'unlisted.mjs')), false);
  assert.deepEqual(readdirSync(target), ['.pi']);
  assert.deepEqual(readdirSync(path.join(target, '.pi/skills')), ['quality-gates']);
});

test('source symlinks, including a parent, prevent all writes', (context) => {
  const outside = temporaryProject(context);
  const target = temporaryProject(context);

  put(outside, 'resource', 'outside');

  for (const relative of ['package.json', 'config']) {
    const source = installerFixture(context);
    const filename = path.join(source, skill, relative);

    rmSync(filename, { recursive: true, force: true });
    symlinkSync(path.join(outside, 'resource'), filename);
    assert.equal(install(source, target).status, 1);
    assert.deepEqual(readdirSync(target), []);
  }
});

test('overlap and symlinked target roots are rejected', (context) => {
  const source = installerFixture(context);
  const parent = temporaryProject(context);
  const outside = temporaryProject(context);
  const alias = path.join(parent, 'alias');

  symlinkSync(outside, alias, 'dir');

  for (const target of [source, path.dirname(source), path.join(source, 'new'), alias, path.join(alias, 'child')]) {
    assert.equal(install(source, target).status, 1, target);
  }

  assert.deepEqual(readdirSync(outside), []);
  assert.equal(existsSync(path.join(source, 'new')), false);
});

test('destination symlinks and file ancestors are conflicts, never followed or replaced', (context) => {
  const source = installerFixture(context);
  const outside = temporaryProject(context);

  put(outside, 'resource', 'outside');

  const before = snapshot(outside);

  for (const relative of ['.pi', `${skill}/config`, `${skill}/package.json`]) {
    const target = temporaryProject(context);
    const filename = path.join(target, relative);

    mkdirSync(path.dirname(filename), { recursive: true });
    symlinkSync(path.join(outside, 'missing'), filename);
    assert.equal(install(source, target).status, 1);
    assert.equal(lstatSync(filename).isSymbolicLink(), true);
    assert.deepEqual(snapshot(outside), before);
  }

  const target = temporaryProject(context);

  put(target, '.pi', 'not a directory');
  assert.equal(install(source, target).status, 1);
  assert.equal(readFileSync(path.join(target, '.pi'), 'utf8'), 'not a directory');
});

test('directory leaves conflict and installation never modifies its sources', (context) => {
  const source = installerFixture(context);
  const target = temporaryProject(context);
  const before = snapshot(source);

  mkdirSync(path.join(target, skill, 'package.json'), { recursive: true });
  assert.equal(install(source, target).status, 1);
  assert.deepEqual(snapshot(source), before);
});
