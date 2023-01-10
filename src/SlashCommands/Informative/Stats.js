import { EmbedBuilder } from 'discord.js';
import os from 'os';
import si from 'systeminformation';
import * as packageFile from '../../../package.json' assert { type: 'json' };
import SlashCommand from '../../Structures/SlashCommand.js';
import Announcement from '../../Mongo/Schemas/Announcement.js';

const { version } = packageFile.default;

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Lists statistics on the bot.',
      category: 'Informative'
    });
  }

  async run(interaction) {
    const dbGrab = await Announcement.find();

    let annc;
    if (dbGrab) {
      annc = dbGrab[0].message;
    } else {
      annc = 'N/A';
    }

    const memory = await si.mem();
    const totalMemory = Math.floor(memory.total / 1024 / 1024);
    const cachedMem = memory.buffcache / 1024 / 1024;
    const memoryUsed = memory.used / 1024 / 1024;
    const realMemUsed = Math.floor(memoryUsed - cachedMem);
    const memPercent = (realMemUsed / totalMemory) * 100;
    const load = await si.currentLoad();
    const cpuUsage = load.currentLoadUser;
    const platform = await si.osInfo();
    const osVersion = platform.distro;
    const core = os.cpus()[0];

    const nowInMs = Date.now() - this.client.uptime;
    const nowInSecond = Math.round(nowInMs / 1000);

    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .setThumbnail(this.client.user.displayAvatarURL())
      .setAuthor({ name: `Viewing statistics for ${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL() })
      .addFields({
        name: 'General Information',
        value: `**◎ 🤖 Name:** \`${this.client.user.tag}\`
				**◎ 📈 Uptime:** <t:${nowInSecond}:R>
				**◎ 🧾 Commands:** \`${this.client.slashCommands.filter((cmd) => cmd.category !== 'Hidden').size}\`
				**◎ 🔖 Servers:** \`${this.client.guilds.cache.size.toLocaleString()}\`
				**◎ 👯 Users:** \`${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')}\`
				**◎ 📝 Channels:** \`${this.client.channels.cache.size.toLocaleString()}\`
				**◎ 📅 Creation Date:** <t:${Math.round(this.client.user.createdTimestamp / 1000)}> - (<t:${Math.round(this.client.user.createdTimestamp / 1000)}:R>)
				**◎ 💹 Bot Version:** \`v${version}\`
				\u200b`
      })
      .addFields({
        name: 'System',
        value: `**◎ 💻 OS:** \`${osVersion}\`
				**◎ 📊 Uptime:** <t:${Math.round((Date.now() - os.uptime() * 1000) / 1000)}:R>
				**◎ 💾 Memory Usage:** \`${realMemUsed.toLocaleString('en')} / ${totalMemory.toLocaleString('en')}MB - ${memPercent.toFixed(1)}%\`
				**◎ 💻 CPU:**
				\u3000 \u3000 ⌨️ Cores: \`${os.cpus().length}\`
				\u3000 \u3000 ⌨️ Model: \`${core.model}\`
				\u3000 \u3000 ⌨️ Speed: \`${core.speed}MHz\`
				\u3000 \u3000 ⌨️ Usage: \`${cpuUsage.toFixed(1)}%\``
      })
      .addFields({ name: 'Announcement', value: `\`\`\`${annc}\`\`\`` })
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  }
};

export default SlashCommandF;
