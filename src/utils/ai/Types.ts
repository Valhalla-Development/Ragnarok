export interface AIUserData {
    blacklisted: boolean;
    expiration: number;
    queriesRemaining: number;
    totalQueries: number;
    whitelisted: boolean;
}

export type AIAvailabilityResult = { ok: true; data: AIUserData } | { ok: false; message: string };

export type AIRunResult = { ok: true; chunks: string[] } | { ok: false; message: string };
