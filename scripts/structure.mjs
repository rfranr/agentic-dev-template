import fs from 'node:fs';
import { printStructure, projectGraph } from '../.pi/skills/quality-gates/scripts/structure.mjs';

const report = JSON.parse(fs.readFileSync(0, 'utf8'));
const isProjectModule = (source) => /^(src\/|tests\/)(?!node_modules\/)/.test(source ?? '');

printStructure(projectGraph(report, isProjectModule));
