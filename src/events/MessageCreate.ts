import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import type { Message, TextBasedChannel } from 'discord.js';
import {
    ButtonStyle, EmbedBuilder, GuildTextBasedChannel, PermissionsBitField,
} from 'discord.js';
import urlRegexSafe from 'url-regex-safe';
import { color, deletableCheck, messageDelete } from '../utils/Util.js';
import AdsProtection from '../mongo/AdsProtection.js';
import AntiScam from '../mongo/AntiScam.js';
import linksContent from '../../assets/SpenLinks.json' assert { type: 'json' };

@Discord()
export class MessageCreate {
    /**
     * Handler for messageCreate event.
     * @param args - An array containing the interaction and client objects.
     * @param client - The Discord client.
     */
    @On({ event: 'messageCreate' })
    async onMessage([message]: ArgsOf<'messageCreate'>, client: Client) {
        if (!message.guild) return;

        /**
         * Checks for and handles potential scams in a message.
         */
        async function antiScam() { // TODO needs testing ofc
            const antiscam = await AntiScam.findOne({ GuildId: message.guild?.id });

            if (!antiscam) return;

            if (!message.member?.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                const npPerms = new EmbedBuilder()
                    .setColor(color(`${message.guild?.members.me?.displayHexColor}`))
                    .addFields({
                        name: `**${client.user?.username} - Anti Scam**`,
                        value: '**Error:** I lack the `Manage Messages` permission required for this action. Anti-Scam feature has been disabled.\n',
                    });

                const deletionMessage = await message.channel.send({ embeds: [npPerms] });
                deletableCheck(deletionMessage, 0);
                await AntiScam.deleteOne({ GuildId: message.guild?.id });
                return;
            }

            const reasons = [];

            const linksRegex = new RegExp(`\\b${linksContent.join('\\b|\\b')}\\b`, 'ig');
            const match = linksRegex.exec(message.content.toLowerCase());

            if (match) {
                const matchedLink = match[0];
                console.log(`Matched link: ${matchedLink}`);
                reasons.push('Malicious Link');

                if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
                    && message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                    await messageDelete(message, 0);
                    const deletionMessage = await message.channel.send(`**◎ Message deleted:** Your message contains: \`${reasons.join(', ')}\`, ${message.author}.`);
                    deletableCheck(deletionMessage, 5000);
                }
            }
        }
        await antiScam();

        /**
         * Function for protecting against ads and unwanted links in a text-based channel.
         * @remarks This function checks if the AdsProtection feature is enabled in the guild and takes actions accordingly.
         */
        async function adsProtection() {
            const channel = message.channel as GuildTextBasedChannel;
            const adsProt = await AdsProtection.findOne({ GuildId: message.guild?.id });

            // Check if AdsProtection is enabled in the guild
            if (adsProt) {
                // Check if the bot has the MANAGE_MESSAGES permission
                if (!message.member?.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                    // Bot doesn't have MANAGE_MESSAGES permission, disable Ads Protection
                    const errorEmbed = new EmbedBuilder()
                        .setColor(color(`${message.guild?.members.me?.displayHexColor}`))
                        .addFields({
                            name: `**${client.user?.username} - Ads Protection**`,
                            value: '**Error:** I lack the `Manage Messages` permission required for Ads Protection. This feature has been disabled.',
                        });

                    message.channel.send({ embeds: [errorEmbed] }).then((m) => deletableCheck(m, 0));
                    await AdsProtection.deleteOne({ GuildId: message.guild?.id });
                    return;
                }

                // Check if the user has MANAGE_MESSAGES permission and the channel is not a ticket
                if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !channel.name.startsWith('ticket-')) {
                    // Use a regular expression to check for links in the message content
                    const matches = urlRegexSafe({ strict: false }).test(message.content.toLowerCase());
                    if (matches) {
                        // Delete the message and notify the user
                        if (message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                            await messageDelete(message, 0);
                            message.channel.send(`**◎ Link detected:** Your message has been deleted, ${message.author}.`).then((msg) => {
                                deletableCheck(msg, 5000);
                            });
                        }
                    }
                }
            }
        }
        await adsProtection();

        /**
         * Asynchronously extracts and handles links to Discord messages in a text message.
         */
        async function linkTag() {
            const discordRegex = /https?:\/\/(?:ptb\.)?(?:canary\.)?(discordapp|discord)\.com\/channels\/(\d{1,19})\/(\d{1,19})\/(\d{1,19})/;

            const exec = discordRegex.exec(message.content);

            if (exec && message.guild?.id === exec[2]) {
                const [, , guildID, channelID, messageID] = exec;

                const findGuild = client.guilds.cache.get(guildID);
                if (!findGuild) return;
                const findChannel = findGuild.channels.cache.get(channelID) as TextBasedChannel;
                if (!findChannel) return;
                const validExtensions = ['gif', 'png', 'jpeg', 'jpg'];

                const messagePromises = [
                    findChannel.messages.fetch({ message: messageID }),
                    findChannel.messages.fetch({ message: messageID, cache: false }),
                ];
                const settledPromises = await Promise.allSettled(messagePromises);
                const resolvedPromise = settledPromises.find((result) => result.status === 'fulfilled') as PromiseFulfilledResult<Message | undefined>;

                if (resolvedPromise) {
                    const res = resolvedPromise.value;

                    if (res) {
                        const unixEpochTimestamp = Math.floor(res.createdTimestamp / 1000);
                        const user = client.users.cache.get(res.author.id);

                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: user?.displayName || message.author.displayName,
                                iconURL: user?.displayAvatarURL({ extension: 'png' }) || message.author.displayAvatarURL({ extension: 'png' }),
                            })
                            .setColor(color(`${message.guild.members.me?.displayHexColor}`))
                            .setFooter({ text: `Quoted by ${message.author.displayName}` })
                            .setTimestamp();

                        const attachmentCheck = res.attachments.first();
                        if (res.content && attachmentCheck) {
                            const attachmentUrl = attachmentCheck.url;
                            const fileExtension = attachmentUrl.substring(attachmentUrl.lastIndexOf('.') + 1);
                            if (!validExtensions.includes(fileExtension)) {
                                embed.setDescription(`**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`);
                            } else {
                                embed.setDescription(`**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`);
                                embed.setImage(attachmentUrl);
                            }
                        } else if (res.content) {
                            embed.setDescription(`**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`);
                        } else if (attachmentCheck) {
                            const attachmentUrl = attachmentCheck.url;
                            const fileExtension = attachmentUrl.substring(attachmentUrl.lastIndexOf('.') + 1);
                            if (!validExtensions.includes(fileExtension)) {
                                embed.setDescription(`**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>`);
                            } else {
                                embed.setDescription(`**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>`);
                                embed.setImage(attachmentUrl);
                            }
                        }
                        message.channel.send({ embeds: [embed] });
                    }
                }
            }
        }
        await linkTag();
    }
}
