import { defaultPersona } from './Default.js';
import { ruthlessPersona } from './Ruthless.js';
import type { Persona } from './Types.js';

export const personas: Record<string, Persona> = {
    default: defaultPersona,
    ruthless: ruthlessPersona,
};

export { defaultPersona } from './Default.js';
export type { Persona } from './Types.js';
