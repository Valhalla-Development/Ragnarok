// Chat
export { runAIChat } from './chat.js';

// Client utilities
export {
    getClient,
    getSystemPrompt,
    isAIAdmin,
    isAIEnabled,
    isAIStaff,
} from './client.js';

// Permission management
export {
    clearAIAllowedChannels,
    getAIAllowedChannels,
    isAIChannelAllowed,
    isAIGuildEnabled,
    setAIAllowedChannels,
    setAIGuildEnabled,
    toggleAIAllowedChannel,
} from './permissions.js';

// Types
export type { AIAvailabilityResult, AIRunResult, AIUserData } from './types.js';
// User management
export {
    buildAIGroupId,
    checkAIAvailability,
    getAITopUsers,
    getAITotalQueryCount,
    getAiUserData,
    resetAICooldown,
    resetAIHistory,
    setAIBlacklist,
    setAIWhitelist,
} from './users.js';
