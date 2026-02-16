// Chat
export { runAIChat } from './Chat.js';

// Client utilities
export {
    getClient,
    getSystemPrompt,
    isAIAdmin,
    isAIEnabled,
    isAIStaff,
} from './Client.js';

// Permission management
export {
    clearAIAllowedChannels,
    getAIAllowedChannels,
    getAIGuildPersona,
    isAIChannelAllowed,
    isAIGuildEnabled,
    setAIAllowedChannels,
    setAIGuildEnabled,
    setAIGuildPersona,
    toggleAIAllowedChannel,
} from './Permissions.js';

// Types
export type { AIAvailabilityResult, AIRunResult, AIUserData } from './Types.js';
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
} from './Users.js';
