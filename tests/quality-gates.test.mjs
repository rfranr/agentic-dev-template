import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { ESLint } from 'eslint';
import { qualityConfig } from '../.pi/skills/quality-gates/config/eslint.mjs';
import { gates, put, snapshot, temporaryProject } from './gates-support.mjs';

const inputs = ['--input', 'lib', '--input', 'spec'];

function project(context) {
  const root = temporaryProject(context);

  put(
    root,
    'package.json',
    JSON.stringify({
      private: true,
      type: 'module',
      scripts: {
        test: 'node -e "console.log(\'delegated-test\')"',
        typecheck: 'node -e "console.log(\'delegated-typecheck\')"',
        build: 'node -e "console.log(\'delegated-build\')"',
        failure: 'node -e "process.exit(7)"',
      },
    }),
  );
  put(root, 'lib/value.ts', 'export const value = 1;\n');
  put(root, 'spec/value.test.ts', "import { value } from '../lib/value.js';\nexport const actual = value;\n");
  put(root, 'tsconfig.json', JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@lib/*': ['lib/*'] } } }));
  put(root, 'eslint.config.mjs', 'throw new Error("target ESLint must not be auto-loaded");');
  put(root, '.prettierrc.json', '{"singleQuote":false,"printWidth":10}');
  put(root, 'package-lock.json', '{"untouched":true}');

  return root;
}

test('bundled policies retain every threshold and warning severity', async () => {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: qualityConfig() });
  const config = await eslint.calculateConfigForFile('lib/probe.ts');
  const expected = {
    complexity: [2, { max: 10 }],
    'sonarjs/cognitive-complexity': [2, 5],
    'max-depth': [2, 3],
    'max-params': [2, 4],
    'max-statements': [1, 22],
  };

  for (const [rule, value] of Object.entries(expected)) {
    assert.deepEqual(config.rules[rule], value);
  }

  assert.equal(config.rules['max-lines-per-function'][1].max, 85);
  assert.equal(config.rules['max-len'][0], 1);
  assert.equal(config.rules['max-len'][1].code, 120);
  assert.equal((await eslint.calculateConfigForFile('spec/probe.test.mjs')).rules['max-lines-per-function'][0], 0);
});

test('format and lint use Skill policy without loading target config or writing project files', (context) => {
  const root = project(context);
  const before = snapshot(root);

  assert.equal(gates('format:check', root, inputs).status, 0);
  assert.equal(gates('lint', root, inputs).status, 0);
  assert.deepEqual(snapshot(root), before);
  put(root, 'lib/value.ts', 'export const value=1;\n');
  assert.equal(gates('format:check', root, inputs).status, 1);
  assert.equal(gates('format', root, inputs).status, 0);
  assert.equal(readFileSync(path.join(root, 'lib/value.ts'), 'utf8'), 'export const value = 1;\n');
});

test('cognitive limit is enforced by lint, but report findings remain advisory', (context) => {
  const root = project(context);

  put(
    root,
    'lib/value.ts',
    'export function nested(a: boolean, b: boolean, c: boolean) {\n  if (a) {\n    if (b) {\n      if (c) {\n        return 1;\n      }\n    }\n  }\n  return 0;\n}\n',
  );

  const lint = gates('lint', root, inputs);
  const report = gates('cognitive', root, inputs);

  assert.equal(lint.status, 1, lint.stderr);
  assert.match(lint.stdout, /sonarjs\/cognitive-complexity/);
  assert.equal(report.status, 0, report.stderr);
  assert.match(report.stdout, /Total complexity:\s+6/);
  assert.match(report.stdout, /Maximum score:\s+6/);
  assert.match(report.stdout, /Violations:\s+1/);
});

test('runtime bindings are explicit and browser globals do not leak into Node files', (context) => {
  const root = project(context);

  put(root, 'lib/runtime.mjs', 'export const runtime = process;\n');
  assert.equal(gates('lint', root, inputs).status, 1);
  assert.equal(gates('lint', root, [...inputs, '--node-files', 'lib/**/*.mjs']).status, 0);
  put(root, 'lib/runtime.mjs', 'export const runtime = window;\n');
  assert.equal(gates('lint', root, [...inputs, '--node-files', 'lib/**/*.mjs']).status, 1);
  assert.equal(gates('lint', root, [...inputs, '--browser-files', 'lib/**/*.mjs']).status, 0);
});

test('dependency aliases and warning-level cycles resolve with Skill-owned TypeScript', (context) => {
  const root = project(context);

  put(root, 'lib/value.ts', "import { other } from '@lib/other';\nexport const value = () => other;\n");
  put(root, 'lib/other.ts', "import { value } from './value.js';\nexport const other = () => value;\n");

  const result = gates('dependencies', root, [...inputs, '--tsconfig', 'tsconfig.json']);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /warn no-circular/);
  assert.doesNotMatch(result.stdout, /could-not-resolve/);

  const structure = gates('structure', root, [...inputs, '--tsconfig', 'tsconfig.json']);

  assert.equal(structure.status, 0, structure.stderr);
  assert.match(structure.stdout, /Max dependency depth: 2/);
  assert.match(structure.stdout, /lib\/other.ts/);
  assert.doesNotMatch(structure.stdout, /node_modules/);
});

test('tsmetrics text and HTML execute without target TypeScript packages', (context) => {
  const root = project(context);
  const text = gates('metrics', root, inputs);
  const html = gates('metrics:html', root, inputs);

  assert.equal(text.status, 0, text.stderr);
  assert.match(text.stdout, /Analyzed 2 file/);
  assert.equal(html.status, 0, html.stderr);
  assert.match(html.stdout, /<html/i);
});

test('verification delegates existing scripts in order and stops on failure', (context) => {
  const root = project(context);
  const result = gates('verify', root, [
    '--package-manager',
    'npm',
    '--script',
    'test',
    '--script',
    'typecheck',
    '--script',
    'build',
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.indexOf('delegated-test') < result.stdout.indexOf('delegated-typecheck'));
  assert.ok(result.stdout.indexOf('delegated-typecheck') < result.stdout.indexOf('delegated-build'));

  const failed = gates('verify', root, ['--package-manager', 'npm', '--script', 'failure', '--script', 'build']);

  assert.equal(failed.status, 7, failed.stderr);
  assert.doesNotMatch(failed.stdout, /delegated-build/);

  const missing = gates('verify', root, ['--package-manager', 'npm', '--script', 'test', '--script', 'missing']);

  assert.equal(missing.status, 1);
  assert.doesNotMatch(missing.stdout, /delegated-test/);
});

test('aggregate retains report execution failures and continues later reports', (context) => {
  const root = project(context);
  const result = gates('check:report', root, [
    ...inputs,
    '--package-manager',
    'npm',
    '--script',
    'test',
    '--dependency-config',
    'missing.cjs',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /delegated-test/);
  assert.match(result.stdout, /Cognitive Complexity Report/);
  assert.match(result.stdout, /Max dependency depth/);
});

test('explicit configuration paths resolve against the project root', (context) => {
  const root = project(context);

  put(root, 'lib/runtime.mjs', 'export const value = missing;\n');
  put(root, 'config/eslint.mjs', 'export default [{ rules: { "no-undef": "error" } }];\n');

  const lint = gates('lint', root, ['--input', 'lib/runtime.mjs', '--eslint-config', 'config/eslint.mjs']);

  assert.equal(lint.status, 1, lint.stderr);
  assert.match(lint.stdout, /no-undef/);
  assert.equal(gates('format:check', root, [...inputs, '--prettier-config', '.prettierrc.json']).status, 1);
  put(
    root,
    'config/dependencies.cjs',
    'module.exports = { forbidden: [{ name: "no-spec-imports", severity: "error", from: { path: "^spec/" }, to: { path: "^lib/" } }] };',
  );

  const dependencies = gates('dependencies', root, [...inputs, '--dependency-config', 'config/dependencies.cjs']);

  assert.equal(dependencies.status, 1, dependencies.stderr);
  assert.match(dependencies.stdout, /no-spec-imports/);
});

test('parse errors and invalid paths do not silently skip coverage', (context) => {
  const root = project(context);

  put(root, 'lib/value.ts', 'export const = ;');
  assert.equal(gates('cognitive', root, inputs).status, 1);
  assert.equal(gates('structure', root, [...inputs, '--tsconfig', 'missing.json']).status, 1);
  assert.equal(gates('lint', root).status, 1);
  assert.equal(gates('lint', root, ['--input', '..']).status, 1);
  assert.equal(gates('unknown', root, inputs).status, 1);
  assert.equal(gates('lint:html', root, inputs).status, 1);
});
