/* eslint-disable no-mixed-operators */
const { EmbedBuilder } = require('discord.js');
const { version } = require('../../../package.json');
const Command = require('../../Structures/Command');
const os = require('os');
const si = require('systeminformation');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['botinfo', 'info'],
			description: 'Lists statistics on the bot.',
			category: 'Informative'
		});
	}

	async run(message) {
		const dbGrab = db.prepare('SELECT msg FROM announcement').get();
		let annc;
		if (dbGrab) {
			annc = dbGrab.msg;
		} else {
			annc = 'N/A';
		}

		const msg = await message.channel.send({ content: 'Generating...' });
		message.channel.sendTyping();
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

		this.client.utils.deletableCheck(msg, 0);

		const nowInMs = Date.now() - this.client.uptime;
		const nowInSecond = Math.round(nowInMs / 1000);

		const embed = new EmbedBuilder()
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
			.setAuthor({ name: `Viewing statistics for ${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
			.addField('General Information',
				`**◎ 🤖 Name:** \`${this.client.user.tag}\`
				**◎ 📈 Uptime:** <t:${nowInSecond}:R>
				**◎ 🧾 Commands:** \`${this.client.commands.filter(cmd => cmd.category !== 'Hidden').size}\`
				**◎ 🔖 Servers:** \`${this.client.guilds.cache.size.toLocaleString()}\`
				**◎ 👯 Users:** \`${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')}\`
				**◎ 📝 Channels:** \`${this.client.channels.cache.size.toLocaleString()}\`
				**◎ 📅 Creation Date:** <t:${Math.round(this.client.user.createdTimestamp / 1000)}> - (<t:${Math.round(this.client.user.createdTimestamp / 1000)}:R>)
				**◎ 💹 Bot Version:** \`v${version}\`
				\u200b`)
			.addField('System',
				`**◎ 💻 OS:** \`${osVersion}\`
				**◎ 📊 Uptime:** <t:${Math.round((Date.now() - os.uptime() * 1000) / 1000)}:R>
				**◎ 💾 Memory Usage:** \`${realMemUsed.toLocaleString('en')} / ${totalMemory.toLocaleString('en')}MB - ${memPercent.toFixed(1)}%\`
				**◎ 💻 CPU:**
				\u3000 \u3000 ⌨️ Cores: \`${os.cpus().length}\`
				\u3000 \u3000 ⌨️ Model: \`${core.model}\`
				\u3000 \u3000 ⌨️ Speed: \`${core.speed}MHz\`
				\u3000 \u3000 ⌨️ Usage: \`${cpuUsage.toFixed(1)}%\``)
			.addField('Announcement',
				`\`\`\`${annc}\`\`\``)
			.setTimestamp();
		message.channel.send({ embeds: [embed] });
	}

};
