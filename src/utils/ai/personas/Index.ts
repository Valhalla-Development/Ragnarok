import { chaotic } from './Chaotic.js';
import { codeExpert } from './CodeExpert.js';
import { codeReviewer } from './CodeReviewer.js';
import { conspiracyTheorist } from './ConspiracyTheorist.js';
import { defaultPersona } from './Default.js';
import { lazy } from './LazyAI.js';
import { ruthless } from './Ruthless.js';
import type { Persona } from './Types.js';

export const personas: Record<string, Persona> = {
    default: defaultPersona,
    ruthless,
    codeReviewer,
    codeExpert,
    conspiracyTheorist,
    lazy,
    chaotic,
};

export { defaultPersona } from './Default.js';
export type { Persona } from './Types.js';
