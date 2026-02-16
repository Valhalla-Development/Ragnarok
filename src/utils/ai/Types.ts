export interface AIUserData {
    totalQueries: number;
    queriesRemaining: number;
    expiration: number;
    whitelisted: boolean;
    blacklisted: boolean;
}

export type AIAvailabilityResult = { ok: true; data: AIUserData } | { ok: false; message: string };

export type AIRunResult = { ok: true; chunks: string[] } | { ok: false; message: string };
