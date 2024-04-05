import {
    ArgsOf, Client, Discord, On,
} from 'discordx';
import {
    ActivityType, AttachmentBuilder, ChannelType, EmbedBuilder,
} from 'discord.js';
import { createCanvas, loadImage, registerFont } from 'canvas';
import ordinal from 'ordinal';
import { readFileSync } from 'fs';
import path from 'path';
import { color } from '../utils/Util.js';
import Tickets from '../mongo/Tickets.js';
import Welcome from '../mongo/Welcome.js';

registerFont('./assets/canvas/fonts/Handlee-Regular.ttf', {
    family: 'Handlee',
});

registerFont('./assets/canvas/fonts/Montserrat-SemiBold.ttf', {
    family: 'Montserrat',
});

/**
 * Discord.js GuildMemberAdd event handler.
 */
@Discord()
export class GuildMemberAdd {
    /**
     * Executes when the GuildMemberAdd event is emitted.
     * @param member
     * @param client - The Discord client.
     * @returns void
     */
    @On({ event: 'guildMemberAdd' })
    async onGuildMemberAdd([member]: ArgsOf<'guildMemberAdd'>, client: Client) {
        // Set activity
        client.user?.setActivity({
            type: ActivityType.Watching,
            name: `${client.guilds.cache.size.toLocaleString('en')} Guilds
            ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString('en')} Users`,
        });

        async function checkTicket() {
            // Check if the user has a ticket
            const foundTicket = await Tickets.findOne({
                GuildId: member.guild.id,
                AuthorId: member.user.id,
            });

            if (foundTicket) {
                // Fetch the channel
                const channel = member.guild.channels.cache.get(foundTicket.ChannelId);

                // Check if the channel exists
                if (channel && channel.type === ChannelType.GuildText) {
                    // Send a message that the user joined
                    channel.permissionOverwrites
                        .create(member, {
                            ViewChannel: true,
                            SendMessages: true,
                        })
                        .catch(console.error);

                    const embed = new EmbedBuilder()
                        .setColor(color(member.guild!.members.me!.displayHexColor))
                        .addFields({
                            name: `**${client.user?.username} - Ticket**`,
                            value: `**◎:** \`${member.user}\` has rejoined the server\nThey have been added back to the ticket.`,
                        });

                    channel.send({ embeds: [embed] });
                }
            }
        }
        await checkTicket();

        async function sendWelcomeMessage() {
            const welcome = await Welcome.findOne({ GuildId: member.guild.id });

            if (!welcome) return;

            const welcomeId = welcome.ChannelId;
            const channel = member.guild.channels.cache.get(welcomeId);

            if (!channel) {
                await Welcome.deleteMany({ GuildId: member.guild.id });
                return;
            }

            const img = readFileSync(path.join(process.cwd(), 'assets/canvas/images/Welcome.png'));

            const canvas = createCanvas(700, 300);
            const ctx = canvas.getContext('2d');

            const background = await loadImage(img);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Bars
            ctx.globalAlpha = 0.75;
            ctx.fillStyle = '#000000';
            ctx.fillRect(-1, 7, 702, 52);
            ctx.fillRect(-1, 240, 702, 52);
            ctx.strokeStyle = '#ffffff';
            ctx.strokeRect(-1, 7, 702, 52);
            ctx.strokeRect(-1, 240, 702, 52);
            ctx.globalAlpha = 1;

            // Text
            ctx.font = '42px Handlee';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('Welcome to the server', canvas.width / 2, 45);

            ctx.font = '42px Handlee';
            ctx.fillText(`${member.user.displayName}`, canvas.width / 2, 280);

            ctx.font = '15px Montserrat';
            ctx.textAlign = 'left';
            ctx.fillText(`${ordinal(member.guild.memberCount - member.guild.members.cache.filter((mem: { user: { bot: boolean; }; }) => mem.user.bot).size)} member!`, 3.5, 45);

            // Avatar
            ctx.beginPath();
            ctx.arc(350, 150, 85, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png' }));

            ctx.drawImage(avatar, 265, 65, 170, 170);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.jpg' });

            if (channel && channel.type === ChannelType.GuildText) {
                channel.send({ files: [attachment] });
            }
        }
        await sendWelcomeMessage();
    }
}
