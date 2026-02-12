const economyViewTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function clearEconomyViewTimer(messageId?: string | null): void {
    if (!messageId) {
        return;
    }

    const existing = economyViewTimers.get(messageId);
    if (existing) {
        clearTimeout(existing);
        economyViewTimers.delete(messageId);
    }
}

export function scheduleEconomyViewTimer(
    messageId: string | null | undefined,
    delayMs: number,
    onElapsed: () => Promise<void> | void
): void {
    if (!messageId) {
        return;
    }

    clearEconomyViewTimer(messageId);

    const timer = setTimeout(async () => {
        try {
            await onElapsed();
        } finally {
            if (economyViewTimers.get(messageId) === timer) {
                economyViewTimers.delete(messageId);
            }
        }
    }, delayMs);

    economyViewTimers.set(messageId, timer);
}
