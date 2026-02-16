import type { ChatCompletionResult } from 'openrouter-kit';
import {
    aiLogDone,
    aiLogStart,
    getClient,
    getSystemPrompt,
    isAIEnabled,
    normalizeResponseContent,
    splitMessages,
} from './client.js';
import type { AIRunResult } from './types.js';
import { checkAIAvailability } from './users.js';

export async function runAIChat(params: {
    userId: string;
    groupId: string;
    prompt: string;
    displayName?: string;
}): Promise<AIRunResult> {
    if (!isAIEnabled()) {
        return {
            ok: false,
            message:
                'AI is not configured yet. Set `OPENROUTER_API_KEY` in your environment first.',
        };
    }

    const stripped = params.prompt.trim();
    if (stripped.length < 4) {
        return { ok: false, message: 'Please enter a query with at least 4 characters.' };
    }
    const normalizedDisplayName = params.displayName?.trim();
    const systemPrompt =
        normalizedDisplayName && normalizedDisplayName.length > 0
            ? [
                  getSystemPrompt(),
                  '',
                  `Context: The current user's name is "${normalizedDisplayName}".`,
                  'Use this naturally only when relevant.',
                  'Never mention "display name" or that this comes from metadata.',
              ].join('\n')
            : getSystemPrompt();

    const availability = await checkAIAvailability(params.userId);
    if (!availability.ok) {
        return availability;
    }

    try {
        const client = getClient();
        const start = Date.now();
        aiLogStart(params.userId, stripped);
        const result = (await client.chat({
            user: params.userId,
            group: params.groupId,
            prompt: stripped,
            systemPrompt,
        })) as ChatCompletionResult;

        const content = normalizeResponseContent(result.content);
        if (!content.length) {
            return { ok: false, message: 'The model returned an empty response. Try again.' };
        }

        aiLogDone(result, Date.now() - start);
        return { ok: true, chunks: splitMessages(content, 1900) };
    } catch (error) {
        console.error('OpenRouter chat error:', error);
        return {
            ok: false,
            message: 'An AI error occurred while processing your request. Please try again.',
        };
    }
}
