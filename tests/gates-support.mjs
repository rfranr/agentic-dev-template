import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const template = fileURLToPath(new URL('..', import.meta.url));
export const skill = '.pi/skills/quality-gates';
export const cli = path.join(template, skill, 'scripts/quality-gates.mjs');

export function temporaryProject(context) {
  const parent = path.join(template, '.validation');

  mkdirSync(parent, { recursive: true });

  const directory = mkdtempSync(path.join(parent, 'test-'));

  context.after(() => rmSync(directory, { recursive: true, force: true }));

  return directory;
}

export function put(directory, relative, contents) {
  const filename = path.join(directory, relative);

  mkdirSync(path.dirname(filename), { recursive: true });
  writeFileSync(filename, contents);
}

export function fingerprint(filename) {
  const status = lstatSync(filename);
  const contents = status.isSymbolicLink() ? readlinkSync(filename) : readFileSync(filename);

  return { hash: createHash('sha256').update(contents).digest('hex'), modified: status.mtimeMs };
}

export function snapshot(directory, relative = '') {
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

export function installerFixture(context) {
  const source = temporaryProject(context);

  cpSync(path.join(template, skill), path.join(source, skill), {
    recursive: true,
    filter: (filename) => path.basename(filename) !== 'node_modules',
  });
  put(source, 'scripts/bootstrap.mjs', readFileSync(path.join(template, 'scripts/bootstrap.mjs')));

  return source;
}

export function install(source, target) {
  return spawnSync(process.execPath, [path.join(source, 'scripts/bootstrap.mjs'), target], { encoding: 'utf8' });
}

export function gates(command, root, args = []) {
  return spawnSync(process.execPath, [cli, command, '--root', root, ...args], { encoding: 'utf8' });
}
