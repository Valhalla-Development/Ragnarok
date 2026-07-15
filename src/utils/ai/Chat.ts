import type { ChatCompletionResult } from 'openrouter-kit';
import {
    aiLogDone,
    aiLogStart,
    getClient,
    isAIEnabled,
    normalizeResponseContent,
    splitMessages,
} from './Client.js';
import { recordAIGlobalUsage } from './GlobalStats.js';
import { friendly, personas } from './personas/Index.js';
import { buildFinalSystemPrompt } from './Security.js';
import type { AIRunResult } from './Types.js';
import { checkAIAvailability } from './Users.js';

export async function runAIChat(params: {
    userId: string;
    groupId: string;
    prompt: string;
    displayName?: string;
    personaId?: string;
    botName: string;
}): Promise<AIRunResult> {
    if (!isAIEnabled()) {
        return {
            message:
                'AI is not configured yet. Set `OPENROUTER_API_KEY` in your environment first.',
            ok: false,
        };
    }

    const stripped = params.prompt.trim();
    if (stripped.length < 2) {
        return { message: 'Please enter a query with at least 2 characters.', ok: false };
    }
    const normalizedDisplayName = params.displayName?.trim();
    const persona = personas[params.personaId ?? 'friendly'] ?? friendly;
    const systemPrompt = buildFinalSystemPrompt(
        persona.system,
        normalizedDisplayName,
        params.botName
    );

    const availability = await checkAIAvailability(params.userId);
    if (!availability.ok) {
        return availability;
    }

    try {
        const client = getClient();
        const start = Date.now();
        aiLogStart(params.userId, stripped);
        const result = (await client.chat({
            group: params.groupId,
            prompt: stripped,
            systemPrompt,
            temperature: persona.temperature,
            topP: persona.top_p,
            user: params.userId,
        })) as ChatCompletionResult;

        const content = normalizeResponseContent(result.content);
        if (!content.length) {
            return { message: 'The model returned an empty response. Try again.', ok: false };
        }

        aiLogDone(result, Date.now() - start);
        const { cost } = result as { cost?: number };
        await recordAIGlobalUsage({ cost: cost ?? 0, queries: 1 });
        return { chunks: splitMessages(content, 1900), ok: true };
    } catch (error) {
        console.error('OpenRouter chat error:', error);
        return {
            message: 'An AI error occurred while processing your request. Please try again.',
            ok: false,
        };
    }
}
