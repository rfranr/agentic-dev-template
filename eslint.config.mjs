import { qualityConfig } from './.pi/skills/quality-gates/config/eslint.mjs';

export default qualityConfig({
  nodeFiles: [
    'tests/**/*.ts',
    'tests/**/*.mjs',
    'scripts/**/*.{js,mjs,cjs,ts}',
    '.pi/skills/quality-gates/scripts/**/*.mjs',
  ],
  browserFiles: ['src/main.ts'],
});
