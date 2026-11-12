import { constants, copyFileSync, lstatSync, mkdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const template = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const skill = '.pi/skills/quality-gates';
// The distribution is deliberately bounded: no installed dependencies, other Skills,
// Pi settings, target configuration, or generated reports are copied.
const resources = [
  'SKILL.md',
  '.gitignore',
  'package.json',
  'package-lock.json',
  'config/eslint.mjs',
  'config/prettier.json',
  'config/dependency-cruiser.cjs',
  'scripts/quality-gates.mjs',
  'scripts/options.mjs',
  'scripts/process.mjs',
  'scripts/style.mjs',
  'scripts/cognitive.mjs',
  'scripts/architecture.mjs',
  'scripts/structure.mjs',
  'scripts/metrics.mjs',
  'scripts/verify.mjs',
];

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

    if (status && unsafeComponent(status, index < components.length - 1)) {
      return false;
    }
  }

  return true;
}

function resolveTarget(argument) {
  const target = path.resolve(argument);

  if (!safePath(target)) {
    throw new Error('Unsafe target path: symlink or non-directory ancestor.');
  }

  if (overlaps(template, target) || overlaps(target, template)) {
    throw new Error('Target and source template must not overlap.');
  }

  if (existingStatus(target) && !existingStatus(target).isDirectory()) {
    throw new Error('Target must be a directory.');
  }

  return target;
}

function destinationStatus(filename, contents) {
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
  return resources.map((relative) => {
    const source = path.join(template, skill, relative);
    const destination = path.join(target, skill, relative);

    if (!safePath(source) || !existingStatus(source)?.isFile()) {
      throw new Error(`Missing or unsafe Skill resource: ${relative}`);
    }

    const contents = readFileSync(source);

    return { relative, source, destination, contents, status: destinationStatus(destination, contents) };
  });
}

function installResource(resource) {
  const { destination, source, contents, status } = resource;

  if (destinationStatus(destination, contents) !== status) {
    throw new Error(`Destination changed during installation: ${destination}`);
  }

  if (status === 'missing') {
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(source, destination, constants.COPYFILE_EXCL);
  }

  console.log(`${status === 'missing' ? 'copied' : status}: ${skill}/${resource.relative}`);
}

function bootstrap(argument) {
  const target = resolveTarget(argument);
  const plan = preparePlan(target);
  const conflicts = plan.filter((resource) => resource.status === 'conflict');

  if (conflicts.length > 0) {
    for (const resource of conflicts) {
      console.error(`conflict: ${skill}/${resource.relative}`);
    }

    throw new Error('Conflicts found; no files copied. Resolve manually and rerun.');
  }

  for (const resource of plan) {
    installResource(resource);
  }

  console.log(`Ready: ${path.join(target, skill)}`);
  console.log(
    'Install dependencies explicitly with npm ci --prefix <Skill-directory>. No project packages were changed.',
  );
}

try {
  if (process.argv.length !== 3) {
    throw new Error('Usage: node scripts/bootstrap.mjs <target-directory>');
  }

  bootstrap(process.argv[2]);
} catch (error) {
  console.error(`Bootstrap stopped: ${error.message}. Unexpected I/O errors may leave earlier copies; no rollback.`);
  process.exitCode = 1;
}
