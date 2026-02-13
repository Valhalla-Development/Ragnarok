import { z } from 'zod';

// Helper transforms for common patterns
const stringToBoolean = (val: string): boolean => val.toLowerCase() === 'true';
const stringToArray = (val: string): string[] =>
    val
        ? val
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

const configSchema = z.object({
    // Required bot token
    BOT_TOKEN: z.string().min(1, 'Bot token is required'),

    // Environment (defaults to development)
    NODE_ENV: z.enum(['development', 'production']).default('development'),

    // Optional comma-separated guild IDs (undefined = global, string[] = guild-specific)
    GUILDS: z
        .string()
        .optional()
        .transform((val) => (val ? stringToArray(val) : undefined)),

    // Logging settings
    ENABLE_LOGGING: z.string().optional().default('false').transform(stringToBoolean),
    ERROR_LOGGING_CHANNEL: z.string().optional(),
    COMMAND_LOGGING_CHANNEL: z.string().optional(),

    // Valhalla API settings
    VALHALLA_API_URI: z.string().optional().default('https://api.valhalladev.org/v1'),
    VALHALLA_API_KEY: z.string().optional().default(''),

    // OpenRouter AI settings (optional)
    OPENROUTER_API_KEY: z.string().optional().default(''),
    OPENROUTER_MODEL: z.string().optional().default('openai/gpt-4o-mini'),
    OPENROUTER_SYSTEM_PROMPT_FILE: z.string().optional().default('src/config/system-prompt.md'),
    OPENROUTER_SYSTEM_PROMPT: z.string().optional().default(''),
    MAX_AI_QUERIES_LIMIT: z.string().optional().default('30').transform(Number),
    AI_QUERIES_RESET_TIME: z.string().optional().default('24h'),
    AI_ADMIN_USER_IDS: z
        .string()
        .optional()
        .transform((val) => (val ? stringToArray(val) : [])),
    AI_STAFF_ROLE_IDS: z
        .string()
        .optional()
        .transform((val) => (val ? stringToArray(val) : [])),
    OWNER_IDS: z
        .string()
        .optional()
        .transform((val) => (val ? stringToArray(val) : [])),
});

// Parse config with error handling
let config: z.infer<typeof configSchema>;
try {
    config = configSchema.parse(process.env);

    if (!config.VALHALLA_API_KEY.trim()) {
        console.warn(
            [
                '⚠️ Valhalla API key missing — Valhalla-powered word/Hangman/Scramble features are DISABLED.',
                `- VALHALLA_API_URI: ${config.VALHALLA_API_URI}`,
                '- To enable: set VALHALLA_API_KEY (request via emailing ragnarlothbrokjr@proton.me)',
            ].join('\n')
        );
    }

    // Validate logging channels required when logging is enabled
    if (config.ENABLE_LOGGING && !config.ERROR_LOGGING_CHANNEL && !config.COMMAND_LOGGING_CHANNEL) {
        console.warn(
            '⚠️  ENABLE_LOGGING is true but ERROR_LOGGING_CHANNEL and COMMAND_LOGGING_CHANNEL are missing. Logging will be disabled.'
        );
        config.ENABLE_LOGGING = false;
    }
} catch (error) {
    if (error instanceof z.ZodError) {
        const missingVars = error.issues
            .filter((issue) => issue.code === 'too_small' || issue.code === 'invalid_type')
            .map((issue) => issue.path[0])
            .join(', ');

        throw new Error(`Missing required environment variables: ${missingVars}`);
    }
    throw error;
}

export { config };
export const isDev = config.NODE_ENV === 'development';

export function isValhallaEnabled(): boolean {
    return Boolean(config.VALHALLA_API_KEY.trim());
}

/**
 * Converts duration string (e.g., "1h", "6h", "24h", "7d") to milliseconds.
 * @param duration - Duration string like "1h", "6h", "24h", "7d"
 */
export function durationToMs(duration: string): number {
    const timeRegex = /^(\d+)(m|h|d)$/i;
    const match = duration.match(timeRegex);

    if (!match) {
        throw new Error(`Invalid duration format: ${duration}`);
    }

    const valueStr = match[1];
    const unitStr = match[2];
    if (!(valueStr && unitStr)) {
        throw new Error(`Invalid duration format: ${duration}`);
    }
    const value = Number.parseInt(valueStr, 10);
    const unit = unitStr.toLowerCase();

    switch (unit) {
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        case 'd':
            return value * 24 * 60 * 60 * 1000;
        default:
            throw new Error(`Invalid duration unit: ${unit}`);
    }
}
