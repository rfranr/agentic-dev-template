import { constants, copyFileSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';

const template = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const resultPath = '.agentic-adoption/RESULT.json';

function existingStatus(filename) {
  try {
    return lstatSync(filename);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
}

function overlaps(first, second) {
  const relative = path.relative(first, second);

  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function unsafeComponent(status, isParent) {
  return status.isSymbolicLink() || (isParent && !status.isDirectory());
}

// Inspect every component, including dangling symlinks, without following links.
function safePath(filename) {
  const root = path.parse(filename).root;
  const components = path.relative(root, filename).split(path.sep);
  let current = root;

  for (const [index, component] of components.entries()) {
    current = path.join(current, component);

    const status = existingStatus(current);

    if (!status) {
      continue;
    }

    if (unsafeComponent(status, index < components.length - 1)) {
      return false;
    }
  }

  return true;
}

function resolveTarget(argument) {
  const requested = path.resolve(argument);

  if (!safePath(requested)) {
    throw new Error('Unsafe target path: symlink or non-directory ancestor.');
  }

  let ancestor = requested;

  while (!existingStatus(ancestor)) {
    ancestor = path.dirname(ancestor);
  }

  const target = path.resolve(realpathSync(ancestor), path.relative(ancestor, requested));

  if (overlaps(template, target) || overlaps(target, template)) {
    throw new Error('Target and source template must not overlap.');
  }

  const targetIsDirectory = existingStatus(target)?.isDirectory() ?? true;

  if (!targetIsDirectory) {
    throw new Error('Target must be a directory.');
  }

  return target;
}

function validateRelativePath(relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || relative.includes('\0')) {
    throw new Error(`Invalid manifest path: ${relative}`);
  }

  if (path.posix.isAbsolute(relative) || path.win32.isAbsolute(relative)) {
    throw new Error(`Absolute manifest path: ${relative}`);
  }

  if (relative.split('/').some((component) => ['', '.', '..'].includes(component))) {
    throw new Error(`Unsafe manifest path: ${relative}`);
  }
}

function validateResource(resource) {
  validateRelativePath(resource.source);
  validateRelativePath(resource.destination);

  if (!['direct', 'staged'].includes(resource.kind)) {
    throw new Error(`Invalid resource kind: ${resource.kind}`);
  }

  if (resource.kind === 'staged' && resource.destination !== `.agentic-adoption/staging/${resource.source}`) {
    throw new Error(`Staged resource must preserve its relative path: ${resource.source}`);
  }
}

function readSource(relative) {
  const filename = path.join(template, relative);

  if (!safePath(filename) || !existingStatus(filename)?.isFile()) {
    throw new Error(`Missing or unsafe template resource: ${relative}`);
  }

  return readFileSync(filename);
}

function destinationStatus(target, relative, contents) {
  const filename = path.join(target, relative);

  if (!safePath(filename)) {
    return 'conflict';
  }

  const status = existingStatus(filename);

  if (!status) {
    return 'missing';
  }

  return status.isFile() && readFileSync(filename).equals(contents) ? 'identical' : 'conflict';
}

function preparePlan(target) {
  const resources = JSON.parse(readSource('adoption/resources.json'));
  const destinations = [resultPath];
  const plan = [];

  for (const resource of resources) {
    validateResource(resource);

    if (destinations.some((name) => overlaps(name, resource.destination) || overlaps(resource.destination, name))) {
      throw new Error(`Overlapping manifest destination: ${resource.destination}`);
    }

    destinations.push(resource.destination);

    const contents = readSource(resource.source);
    const status = destinationStatus(target, resource.destination, contents);

    plan.push({ ...resource, contents, status });
  }

  return plan;
}

function prepareResult(target, plan) {
  // Stable outcomes, not per-run actions: identical reruns must not rewrite this file.
  const inventory = plan.map(({ source, destination, kind, status }) => ({
    source,
    destination,
    kind,
    status: status === 'conflict' ? 'conflict' : 'installed',
  }));
  const contents = Buffer.from(`${JSON.stringify({ resources: inventory }, null, 2)}\n`);

  return { destination: resultPath, contents, status: destinationStatus(target, resultPath, contents) };
}

function createResource(target, resource) {
  const filename = path.join(target, resource.destination);

  mkdirSync(path.dirname(filename), { recursive: true });

  if (resource.source) {
    copyFileSync(path.join(template, resource.source), filename, constants.COPYFILE_EXCL);
  } else {
    writeFileSync(filename, resource.contents, { flag: 'wx' });
  }
}

function installResource(target, resource) {
  const { destination, contents, status } = resource;

  // Recheck before writing; exclusive creation also prevents replacing a new leaf file.
  if (destinationStatus(target, destination, contents) !== status) {
    throw new Error(`Destination changed during installation: ${destination}`);
  }

  if (status === 'missing') {
    createResource(target, resource);
  }

  console.log(`${status === 'missing' ? 'copied' : status}: ${destination}`);

  if (status === 'conflict' && destination.startsWith('.agentic-adoption/') && resource.kind !== 'staged') {
    console.log(`Proposed ${destination} (existing path preserved):\n${contents.toString()}`);
  }
}

function bootstrap(argument) {
  const target = resolveTarget(argument);
  const plan = preparePlan(target);
  const result = prepareResult(target, plan);
  const installation = [...plan, result];
  const conflicts = installation.filter((resource) => resource.status === 'conflict');

  // All sources and destinations have been checked before the first directory or file is created.
  console.log(`Preflight: ${plan.length} resources, ${conflicts.length} conflicts.`);

  for (const resource of installation) {
    installResource(target, resource);
  }

  if (conflicts.length > 0) {
    process.exitCode = 1;
  }
}

try {
  if (process.argv.length !== 3) {
    throw new Error('Usage: node scripts/bootstrap.mjs <target-directory>');
  }

  bootstrap(process.argv[2]);
} catch (error) {
  console.error(`Bootstrap stopped: ${error.message}. Earlier copies, if any, remain; no rollback.`);
  process.exitCode = 1;
}
