// Chat
export { runAIChat } from './Chat.js';

// Client utilities
export {
    getClient,
    isAIAdmin,
    isAIEnabled,
    isAIStaff,
} from './Client.js';

// Permission management
export {
    clearAIAllowedChannels,
    getAIAllowedChannels,
    getAIGuildPersona,
    getEffectivePersonaId,
    isAIChannelAllowed,
    isAIGuildEnabled,
    setAIAllowedChannels,
    setAIGuildEnabled,
    setAIGuildPersona,
} from './Permissions.js';

// Types
export type { AIAvailabilityResult, AIRunResult, AIUserData } from './Types.js';

// User management
export {
    buildAIGroupId,
    checkAIAvailability,
    clearAllAIHistoryForGuild,
    getAITopUsers,
    getAITotalQueryCount,
    getAIUserPersona,
    getAiUserData,
    resetAICooldown,
    resetAIHistory,
    setAIBlacklist,
    setAIUserPersona,
    setAIWhitelist,
} from './Users.js';
