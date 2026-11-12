import { cognitive } from '../.pi/skills/quality-gates/scripts/cognitive.mjs';
import { fileURLToPath } from 'node:url';

process.exitCode = await cognitive({
  root: fileURLToPath(new URL('..', import.meta.url)),
  inputs: ['src', 'tests'],
  eslintConfig: fileURLToPath(new URL('../eslint.config.mjs', import.meta.url)),
});
