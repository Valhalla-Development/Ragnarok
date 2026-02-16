import { defaultPersona } from './default.js';
import { ruthlessPersona } from './ruthless.js';
import type { Persona } from './types.js';

export const personas: Record<string, Persona> = {
    default: defaultPersona,
    ruthless: ruthlessPersona,
};

export { defaultPersona } from './default.js';
export type { Persona } from './types.js';
