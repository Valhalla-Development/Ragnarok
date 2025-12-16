import type { Message, TextBasedChannel } from 'discord.js';
import { EmbedBuilder, type GuildTextBasedChannel, PermissionsBitField } from 'discord.js';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import urlRegexSafe from 'url-regex-safe';
import AdsProtection from '../mongo/AdsProtection.js';
import AFK from '../mongo/AFK.js';
import Dad from '../mongo/Dad.js';
import { color, deletableCheck, messageDelete, updateLevel } from '../utils/Util.js';

const dadCooldown = new Set();
const dadCooldownSeconds = 60;

@Discord()
export class MessageCreate {
    /**
     * Handler for messageCreate event.
     * @param args - An array containing the interaction and client objects.
     * @param client - The Discord client.
     */
    @On({ event: 'messageCreate' })
    async onMessage([message]: ArgsOf<'messageCreate'>, client: Client) {
        if (!message.guild || message.author.bot) {
            return;
        }

        async function afk() {
            const pingCheck = await AFK.findOne({ GuildId: message.guild!.id });
            const afkGrab = await AFK.findOne({
                GuildId: message.guild!.id,
                UserId: message.author.id,
            });

            if (afkGrab) {
                await AFK.deleteOne({ GuildId: message.guild!.id, UserId: message.author.id });
                const embed = new EmbedBuilder()
                    .setColor(color(`${message.member?.displayHexColor}`))
                    .addFields({
                        name: `**${client.user?.username} - AFK**`,
                        value: `${message.author} is no longer AFK.`,
                    });
                message.channel.send({ embeds: [embed] }).then((m) => deletableCheck(m, 10_000));
                return;
            }

            if (message.mentions.users.size > 0 && pingCheck) {
                const afkCheck = await AFK.findOne({
                    GuildId: message.guild!.id,
                    UserId: message.mentions.users.first()?.id,
                });
                if (afkCheck) {
                    const error = new EmbedBuilder()
                        .setColor(color(`${message.member?.displayHexColor}`))
                        .addFields({
                            name: `**${client.user?.username} - AFK**`,
                            value: `**◎** Please do not ping ${message.mentions.users.first()}, is currently AFK with the reason:\n\n${afkCheck.Reason}`,
                        });
                    message.channel
                        .send({ embeds: [error] })
                        .then((m) => deletableCheck(m, 10_000));
                }
            }
        }
        await afk();

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
                if (
                    !message.member?.guild.members.me?.permissions.has(
                        PermissionsBitField.Flags.ManageMessages
                    )
                ) {
                    // Bot doesn't have MANAGE_MESSAGES permission, disable Ad Protection
                    const errorEmbed = new EmbedBuilder()
                        .setColor(color(`${message.guild?.members.me?.displayHexColor}`))
                        .addFields({
                            name: `**${client.user?.username} - Ads Protection**`,
                            value: '**Error:** I lack the `Manage Messages` permission required for Ads Protection. This feature has been disabled.',
                        });

                    message.channel
                        .send({ embeds: [errorEmbed] })
                        .then((m) => deletableCheck(m, 0));
                    await AdsProtection.deleteOne({ GuildId: message.guild?.id });
                    return;
                }

                // Check if the user has MANAGE_MESSAGES permission and the channel is not a ticket
                if (
                    !(
                        message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) ||
                        channel.name.startsWith('ticket-')
                    ) &&
                    urlRegexSafe({ strict: false }).test(message.content.toLowerCase()) &&
                    message.member.guild.members.me.permissions.has(
                        PermissionsBitField.Flags.ManageMessages
                    )
                ) {
                    await messageDelete(message, 0);
                    message.channel
                        .send(
                            `**◎ Link detected:** Your message has been deleted, ${message.author}.`
                        )
                        .then((msg) => {
                            deletableCheck(msg, 5000);
                        });
                }
            }
        }
        await adsProtection();

        /**
         * Asynchronously extracts and handles links to Discord messages in a text message.
         */
        async function linkTag() {
            const discordRegex =
                /https?:\/\/(?:ptb\.)?(?:canary\.)?(discordapp|discord)\.com\/channels\/(\d{1,19})\/(\d{1,19})\/(\d{1,19})/;

            const exec = discordRegex.exec(message.content);

            if (exec && message.guild?.id === exec[2]) {
                const [, , guildID, channelID, messageID] = exec;

                const findGuild = client.guilds.cache.get(guildID as string);
                if (!findGuild) {
                    return;
                }
                const findChannel = findGuild.channels.cache.get(
                    channelID as string
                ) as TextBasedChannel;
                if (!findChannel) {
                    return;
                }
                const validExtensions = ['gif', 'png', 'jpeg', 'jpg'];

                const messagePromises = [
                    findChannel.messages.fetch({ message: messageID as string }),
                    findChannel.messages.fetch({ message: messageID as string, cache: false }),
                ];
                const settledPromises = await Promise.allSettled(messagePromises);
                const resolvedPromise = settledPromises.find(
                    (result) => result.status === 'fulfilled'
                ) as PromiseFulfilledResult<Message | undefined>;

                if (resolvedPromise) {
                    const res = resolvedPromise.value;

                    if (res) {
                        const unixEpochTimestamp = Math.floor(res.createdTimestamp / 1000);
                        const user = client.users.cache.get(res.author.id);

                        const embed = new EmbedBuilder()
                            .setAuthor({
                                name: user?.displayName || message.author.displayName,
                                iconURL:
                                    user?.displayAvatarURL({ extension: 'png' }) ||
                                    message.author.displayAvatarURL({ extension: 'png' }),
                            })
                            .setColor(color(`${message.guild?.members.me?.displayHexColor}`))
                            .setFooter({ text: `Quoted by ${message.author.displayName}` })
                            .setTimestamp();

                        const attachmentCheck = res.attachments.first();
                        if (res.content && attachmentCheck) {
                            const attachmentUrl = attachmentCheck.url;
                            const fileExtension = attachmentUrl.substring(
                                attachmentUrl.lastIndexOf('.') + 1
                            );
                            if (validExtensions.includes(fileExtension)) {
                                embed.setDescription(
                                    `**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`
                                );
                                embed.setImage(attachmentUrl);
                            } else {
                                embed.setDescription(
                                    `**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`
                                );
                            }
                        } else if (res.content) {
                            embed.setDescription(
                                `**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`
                            );
                        } else if (attachmentCheck) {
                            const attachmentUrl = attachmentCheck.url;
                            const fileExtension = attachmentUrl.substring(
                                attachmentUrl.lastIndexOf('.') + 1
                            );
                            if (validExtensions.includes(fileExtension)) {
                                embed.setDescription(
                                    `**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>`
                                );
                                embed.setImage(attachmentUrl);
                            } else {
                                embed.setDescription(
                                    `**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>`
                                );
                            }
                        }
                        message.channel.send({ embeds: [embed] });
                    }
                }
            }
        }
        await linkTag();

        async function dadBot() {
            const dadData = await Dad.findOne({ GuildId: message.guild?.id });
            if (!dadData || dadCooldown.has(message.author.id)) {
                return;
            }

            const messageContent = message.content.toLowerCase();
            if (!(messageContent.startsWith('im ') || messageContent.startsWith("i'm "))) {
                return;
            }

            const content = messageContent.split(' ').slice(1).join(' ');

            switch (true) {
                case urlRegexSafe({ strict: false }).test(messageContent):
                    message.channel.send({ files: ['./Storage/Images/dadNo.png'] });
                    break;
                case messageContent.startsWith('im dad') || messageContent.startsWith("i'm dad"):
                    message.channel.send({ content: "No, I'm Dad!" });
                    break;
                case messageContent.includes('@everyone') || messageContent.includes('@here'):
                    await message.reply({ content: '<:pepebruh:987742251297931274>' });
                    break;
                default:
                    message.channel.send({ content: `Hi ${content}, I'm Dad!` });
            }

            dadCooldown.add(message.author.id);
            setTimeout(() => dadCooldown.delete(message.author.id), dadCooldownSeconds * 1000);
        }
        await dadBot();

        /**
         * Easter Eggs
         */
        if (message.content.includes('(╯°□°）╯︵ ┻━┻')) {
            await message.reply({
                content: 'Leave my table alone!\n┬─┬ ノ( ゜-゜ノ)',
            });
        }

        /**
         * Update Level module
         */
        await updateLevel(message);
    }
}
