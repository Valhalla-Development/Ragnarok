import { ChannelType, Events, MessageFlags, PermissionsBitField } from 'discord.js';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import urlRegexSafe from 'url-regex-safe';
import AdsProtection from '../mongo/AdsProtection.js';
import Logging from '../mongo/Logging.js';
import { deletableCheck, messageDelete, RagnarokContainer } from '../utils/Util.js';

@Discord()
export class MessageUpdate {
    @On({ event: Events.MessageUpdate })
    async onMessageUpdate([oldMessage, newMessage]: ArgsOf<'messageUpdate'>, client: Client) {
        if (!newMessage.guild || newMessage.author?.bot) {
            return;
        }

        if (oldMessage.content === newMessage.content) {
            return;
        }

        // Ads protection for edited messages (matches OG behavior).
        const adsProt = await AdsProtection.findOne({ GuildId: newMessage.guild.id });
        if (adsProt?.Status) {
            const botHasManageMessages = newMessage.guild.members.me?.permissions.has(
                PermissionsBitField.Flags.ManageMessages
            );

            if (!botHasManageMessages) {
                const errorContainer = RagnarokContainer(
                    `${client.user?.username ?? 'Bot'} - Ads Protection`,
                    '**Error:** I lack the `Manage Messages` permission required for Ads Protection. This feature has been disabled.'
                );

                await newMessage.channel
                    .send({
                        components: [errorContainer],
                        flags: MessageFlags.IsComponentsV2,
                        allowedMentions: { parse: [] },
                    })
                    .then((m) => deletableCheck(m, 0));
                await AdsProtection.deleteOne({ GuildId: newMessage.guild.id });
                return;
            }

            const memberHasManageMessages = newMessage.member?.permissions.has(
                PermissionsBitField.Flags.ManageMessages
            );
            const hasLink = urlRegexSafe({ strict: false }).test(
                (newMessage.content ?? '').toLowerCase()
            );

            if (memberHasManageMessages !== true && hasLink) {
                await messageDelete(newMessage, 0);
                await newMessage.channel
                    .send(
                        `**Link detected:** Your edited message has been deleted, ${newMessage.author}.`
                    )
                    .then((msg) => deletableCheck(msg, 5000));
            }
        }

        // Logging for message edits.
        const logging = await Logging.findOne({ GuildId: newMessage.guild.id });
        if (!logging?.ChannelId) {
            return;
        }

        if (!oldMessage.content) {
            return;
        }

        if (oldMessage.content.length + (newMessage.content?.length ?? 0) > 6000) {
            return;
        }

        const chn =
            newMessage.guild.channels.cache.get(logging.ChannelId) ??
            (await newMessage.guild.channels.fetch(logging.ChannelId));

        if (
            !chn ||
            chn.type !== ChannelType.GuildText ||
            !chn.permissionsFor(chn.guild.members.me!).has(PermissionsBitField.Flags.SendMessages)
        ) {
            return;
        }

        const container = RagnarokContainer(
            'Message Updated',
            [
                `**Author:** ${newMessage.author.tag}`,
                `**Avatar:** ${newMessage.author.displayAvatarURL({ extension: 'png' })}`,
                `**Message Link:** ${newMessage.url}`,
                '',
                `**Before:**\n${oldMessage.content.substring(0, 1024)}`,
                '',
                `**After:**\n${(newMessage.content ?? '*No content*').substring(0, 1024)}`,
            ].join('\n')
        );

        await chn.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: [] },
        });
    }
}
