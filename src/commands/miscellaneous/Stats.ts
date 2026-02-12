import os from 'node:os';
import { Category, type ICategory } from '@discordx/utilities';
import {
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { type Client, type DApplicationCommand, Discord, MetadataStorage, Slash } from 'discordx';
import si from 'systeminformation';

import Announcement from '../../mongo/Announcement.js';

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
        const systemData = await si.get({
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

        const commandCount = MetadataStorage.instance.applicationCommands.filter(
            (cmd: DApplicationCommand & ICategory) => cmd.category?.toLowerCase() !== 'Hidden'
        ).length;
        const totalUsers = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);

        const header = new TextDisplayBuilder().setContent(
            [
                '# 📊 Bot Statistics',
                `> 🤖 **${client.user}**`,
                `> 📅 Created: <t:${Math.round(client.user!.createdTimestamp / 1000)}:F> (<t:${Math.round(client.user!.createdTimestamp / 1000)}:R>)`,
            ].join('\n')
        );

        const overview = new TextDisplayBuilder().setContent(
            [
                '## 📈 Overview',
                '',
                `> 📈 **Uptime:** <t:${Math.round((Date.now() - client.uptime!) / 1000)}:R>`,
                `> 🧾 **Commands:** \`${commandCount}\``,
                `> 🔖 **Servers:** \`${client.guilds.cache.size.toLocaleString()}\``,
                `> 👯 **Users:** \`${totalUsers.toLocaleString('en')}\``,
                `> 📝 **Channels:** \`${client.channels.cache.size.toLocaleString()}\``,
                `> 💹 **Version:** \`v${process.env.npm_package_version}\``,
            ].join('\n')
        );

        const systemInfoDisplay = new TextDisplayBuilder().setContent(
            [
                '## 💻 System Information',
                '',
                `> 💻 **OS:** \`${systemData.osInfo.distro}\``,
                `> 📊 **Uptime:** <t:${Math.round((Date.now() - os.uptime() * 1000) / 1000)}:R>`,
                `> 💾 **Memory:** \`${realMemUsed.toLocaleString('en')} / ${totalMemory.toLocaleString('en')}MB - ${memPercent.toFixed(1)}%\``,
                `> ⌨️ **CPU Cores:** \`${os.cpus().length}\``,
                `> ⌨️ **CPU Model:** \`${os.cpus()[0]?.model}\``,
                `> ⌨️ **CPU Speed:** \`${os.cpus()[0]?.speed}MHz\``,
                `> ⌨️ **CPU Usage:** \`${systemData.currentLoad.currentLoadUser.toFixed(1)}%\``,
            ].join('\n')
        );

        const announcementDisplay = new TextDisplayBuilder().setContent(
            ['## 📢 Announcement', '', `\`\`\`${announcement}\`\`\``].join('\n')
        );

        const container = new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(overview)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(systemInfoDisplay)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(announcementDisplay);

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
