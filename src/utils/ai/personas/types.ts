export interface Persona {
    id: string;
    name: string;
    system: string;
    temperature?: number;
    top_p?: number;
}
