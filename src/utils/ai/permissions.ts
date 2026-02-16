import AIConfig from '../../mongo/AIConfig.js';

export async function isAIChannelAllowed(
    guildId: string | null | undefined,
    channelId: string | null | undefined
): Promise<boolean> {
    if (!(guildId && channelId)) {
        return true;
    }

    const cfg = await AIConfig.findOne({ GuildId: guildId }).lean().exec();
    if (cfg?.Enabled === false) {
        return false;
    }
    const allowed = cfg?.AllowedChannelIds ?? [];
    if (allowed.length === 0) {
        return true;
    }
    return allowed.includes(channelId);
}

export async function getAIAllowedChannels(guildId: string): Promise<string[]> {
    const cfg = await AIConfig.findOne({ GuildId: guildId }).lean().exec();
    return (cfg?.AllowedChannelIds ?? []).map((id) => String(id));
}

export async function isAIGuildEnabled(guildId: string): Promise<boolean> {
    const cfg = await AIConfig.findOne({ GuildId: guildId }).lean().exec();
    return cfg?.Enabled !== false;
}

export async function setAIGuildEnabled(guildId: string, enabled: boolean): Promise<boolean> {
    await AIConfig.findOneAndUpdate(
        { GuildId: guildId },
        { $set: { GuildId: guildId, Enabled: enabled } },
        { upsert: true }
    ).exec();
    return enabled;
}

export async function toggleAIAllowedChannel(
    guildId: string,
    channelId: string
): Promise<string[]> {
    const current = await getAIAllowedChannels(guildId);
    const set = new Set(current);
    if (set.has(channelId)) {
        set.delete(channelId);
    } else {
        set.add(channelId);
    }
    const next = Array.from(set);
    await AIConfig.findOneAndUpdate(
        { GuildId: guildId },
        { $set: { GuildId: guildId, AllowedChannelIds: next } },
        { upsert: true }
    ).exec();
    return next;
}

export async function clearAIAllowedChannels(guildId: string): Promise<void> {
    await AIConfig.findOneAndUpdate(
        { GuildId: guildId },
        { $set: { GuildId: guildId, AllowedChannelIds: [] } },
        { upsert: true }
    ).exec();
}

export async function setAIAllowedChannels(
    guildId: string,
    channelIds: string[]
): Promise<string[]> {
    const unique = Array.from(new Set(channelIds)).slice(0, 25);
    await AIConfig.findOneAndUpdate(
        { GuildId: guildId },
        { $set: { GuildId: guildId, AllowedChannelIds: unique } },
        { upsert: true }
    ).exec();
    return unique;
}

export async function getAIGuildPersona(guildId: string): Promise<string> {
    const cfg = await AIConfig.findOne({ GuildId: guildId }).lean().exec();
    const id = cfg?.PersonaId?.trim();
    return id && id.length > 0 ? id : 'default';
}

export async function setAIGuildPersona(guildId: string, personaId: string): Promise<string> {
    const id = personaId?.trim() && personaId.trim().length > 0 ? personaId.trim() : 'default';
    await AIConfig.findOneAndUpdate(
        { GuildId: guildId },
        { $set: { GuildId: guildId, PersonaId: id } },
        { upsert: true }
    ).exec();
    return id;
}
