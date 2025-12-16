import os from 'node:os';
import { Category, type ICategory } from '@discordx/utilities';
import { type CommandInteraction, EmbedBuilder } from 'discord.js';
import { type Client, type DApplicationCommand, Discord, MetadataStorage, Slash } from 'discordx';
import si from 'systeminformation';

import Announcement from '../../mongo/Announcement.js';
import { color } from '../../utils/Util.js';

@Discord()
@Category('Miscellaneous')
export class Stats {
    /**
     * Displays bot statistics.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Displays bot statistics.' })
    async stats(interaction: CommandInteraction, client: Client): Promise<void> {
        // Fetch announcement from database
        const dbAnnouncements = await Announcement.find();
        const announcement = dbAnnouncements.length ? dbAnnouncements[0]?.Message : 'N/A';

        // Retrieve system information
        const systemInfo = await si.get({
            osInfo: 'distro',
            currentLoad: 'currentLoadUser',
        });

        // Retrieve system memory
        const systemMemory = await si.mem();

        // Calculate memory usage
        const totalMemory = Math.floor(systemMemory.total / 1024 / 1024);
        const cachedMem = systemMemory.buffcache / 1024 / 1024;
        const memoryUsed = systemMemory.used / 1024 / 1024;
        const realMemUsed = Math.floor(memoryUsed - cachedMem);
        const memPercent = (realMemUsed / totalMemory) * 100;

        const embed = new EmbedBuilder()
            .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'))
            .setThumbnail(client.user?.displayAvatarURL() || '')
            .setAuthor({ name: 'Bot Statistics', iconURL: client.user?.displayAvatarURL() || '' })
            .addFields({
                name: 'Overview',
                value: `**◎ 🤖 Name:** \`${client.user?.tag}\`
                **◎ 📈 Uptime:** <t:${Math.round((Date.now() - client.uptime!) / 1000)}:R>
                **◎ 🧾 Commands:** \`${MetadataStorage.instance.applicationCommands.filter((cmd: DApplicationCommand & ICategory) => cmd.category?.toLowerCase() !== 'Hidden').length}\`
                **◎ 🔖 Servers:** \`${client.guilds.cache.size.toLocaleString()}\`
                **◎ 👯 Users:** \`${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')}\`
                **◎ 📝 Channels:** \`${client.channels.cache.size.toLocaleString()}\`
                **◎ 📅 Creation Date:** <t:${Math.round(client.user!.createdTimestamp / 1000)}> - (<t:${Math.round(client.user!.createdTimestamp / 1000)}:R>)
                **◎ 💹 Bot Version:** \`v${process.env.npm_package_version}\`
                \u200b`,
            })
            .addFields({
                name: 'System Information',
                value: `**◎ 💻 OS:** \`${systemInfo.osInfo.distro}\`
                **◎ 📊 Uptime:** <t:${Math.round((Date.now() - os.uptime() * 1000) / 1000)}:R>
                **◎ 💾 Memory Usage:** \`${realMemUsed.toLocaleString('en')} / ${totalMemory.toLocaleString('en')}MB - ${memPercent.toFixed(1)}%\`
                **◎ 💻 CPU:**
                \u3000 \u3000 ⌨️ Cores: \`${os.cpus().length}\`
                \u3000 \u3000 ⌨️ Model: \`${os.cpus()[0]?.model}\`
                \u3000 \u3000 ⌨️ Speed: \`${os.cpus()[0]?.speed}MHz\`
                \u3000 \u3000 ⌨️ Usage: \`${systemInfo.currentLoad.currentLoadUser.toFixed(1)}%\``,
            })
            .addFields({ name: 'Announcement', value: `\`\`\`${announcement}\`\`\`` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}
