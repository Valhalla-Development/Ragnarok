import type {
    ChatCompletionResult,
    HistoryEntry,
    IHistoryStorage,
    OpenRouterClient,
} from 'openrouter-kit';
import '@colors/colors';
import moment from 'moment';
import { OpenRouterClient as OpenRouterClientCtor } from 'openrouter-kit';
import { config, durationToMs } from '../../config/Config.js';
import AIHistory from '../../mongo/AIHistory.js';

class MongoHistoryStorage implements IHistoryStorage {
    async load(key: string): Promise<HistoryEntry[]> {
        const doc = await AIHistory.findOne({ Key: key }).lean().exec();
        if (!doc?.Entries) {
            return [];
        }
        // Filter out system messages to ensure fresh system prompt is used on every request
        const entries = doc.Entries as HistoryEntry[];
        return entries.filter((entry) => entry.message?.role !== 'system');
    }

    async save(key: string, entries: HistoryEntry[]): Promise<void> {
        await AIHistory.findOneAndUpdate(
            { Key: key },
            {
                $set: {
                    Key: key,
                    Entries: entries,
                    UpdatedAt: Date.now(),
                },
            },
            { upsert: true }
        ).exec();
    }

    async delete(key: string): Promise<void> {
        await AIHistory.deleteOne({ Key: key }).exec();
    }

    async listKeys(): Promise<string[]> {
        const docs = await AIHistory.find({}, { Key: 1, _id: 0 }).lean().exec();
        return docs.map((doc) => String(doc.Key));
    }
}

let aiClient: OpenRouterClient | null = null;

export function aiLogStart(userId: string, prompt: string): void {
    if (!config.ENABLE_LOGGING) {
        return;
    }

    const shortPrompt = prompt.length > 80 ? `${prompt.slice(0, 77)}...` : prompt;
    console.log(
        `${'◆◆◆◆◆◆'.rainbow.bold} ${moment().format('MMM D, h:mm A')} ${'◆◆◆◆◆◆'.rainbow.bold}\n` +
            `${'🤖 OpenRouter Query'.brightBlue.bold} ${`user:${userId}`.brightMagenta.bold}\n` +
            `${'📝 Prompt: '.brightBlue.bold}${shortPrompt.brightYellow.bold}`
    );
}

export function aiLogDone(result: ChatCompletionResult, durationMs: number): void {
    if (!config.ENABLE_LOGGING) {
        return;
    }

    const totalTokens = result.usage?.total_tokens ?? 0;
    console.log(
        `${'✅ AI Complete'.brightGreen.bold} ${`(${durationMs}ms)`.gray} ` +
            `${'Model:'.brightBlue.bold} ${result.model.brightMagenta.bold} ` +
            `${'Tokens:'.brightBlue.bold} ${String(totalTokens).brightYellow.bold}`
    );
}

export function getResetTimeMs(): number {
    try {
        return durationToMs(config.AI_QUERIES_RESET_TIME);
    } catch {
        return durationToMs('24h');
    }
}

export function isAIEnabled(): boolean {
    return config.OPENROUTER_API_KEY.trim().length > 0;
}

export function getClient(): OpenRouterClient {
    if (aiClient) {
        return aiClient;
    }

    aiClient = new OpenRouterClientCtor({
        apiKey: config.OPENROUTER_API_KEY,
        model: config.OPENROUTER_MODEL,
        historyAdapter: new MongoHistoryStorage(),
        enableCostTracking: false,
        // Keep library internals quiet; we print concise custom logs.
        debug: false,
    });

    return aiClient;
}

export function splitMessages(content: string, length = 1900): string[] {
    if (content.length <= length) {
        return [content];
    }

    const chunks: string[] = [];
    let remainingContent = content.trim();

    while (remainingContent.length > 0) {
        const chunkEnd =
            remainingContent.length <= length
                ? remainingContent.length
                : remainingContent.lastIndexOf(' ', length) ||
                  remainingContent.indexOf(' ', length);

        chunks.push(remainingContent.slice(0, chunkEnd).trim());
        remainingContent = remainingContent.slice(chunkEnd).trim();
    }

    const totalChunks = chunks.length;
    return chunks.map((chunk, index) => `${chunk}\n\`${index + 1}\`/\`${totalChunks}\``);
}

export function normalizeResponseContent(content: unknown): string {
    if (typeof content === 'string') {
        return content.trim();
    }

    try {
        return JSON.stringify(content, null, 2);
    } catch {
        return String(content);
    }
}

export function isAIAdmin(userId: string): boolean {
    return config.AI_ADMIN_USER_IDS.includes(userId);
}

export function isAIStaff(roleIds: string[] | undefined, userId: string): boolean {
    if (isAIAdmin(userId)) {
        return true;
    }
    if (!roleIds?.length) {
        return false;
    }
    return roleIds.some((id) => config.AI_STAFF_ROLE_IDS.includes(id));
}

// Re-export the client instance for history management
export { aiClient };
