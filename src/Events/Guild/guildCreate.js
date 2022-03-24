const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(guild) {
		// Custom prefixes
		function customPrefix() {
			const prefixes = db.prepare('SELECT count(*) FROM setprefix WHERE guildid = ?').get(guild.id);
			if (!prefixes['count(*)']) {
				const insert = db.prepare('INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);');
				insert.run({
					guildid: `${guild.id}`,
					prefix: '-'
				});
				return;
			}
		}
		customPrefix();

		// Invite Manager
		this.client.invites.set(guild.id, await guild.invites.fetch());

		console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
		this.client.user.setActivity(`${this.client.prefix}help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
			{
				type: 'WATCHING'
			}
		);

		let defaultChannel = '';

		const genChan = guild.channels.cache.find((chan) => chan.name === 'general');
		if (genChan) {
			defaultChannel = genChan;
		} else {
			guild.channels.cache.forEach((channel) => {
				if (channel.type === 'GUILD_TEXT' && defaultChannel === '') {
					if (channel.permissionsFor(guild.me).has('SEND_MESSAGES')) {
						defaultChannel = channel;
					}
				}
			});
		}

		if (defaultChannel === '') {
			return;
		}

		const embed = new MessageEmbed()
			.setAuthor({ name: `${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
			.setColor(this.client.utils.color(guild.me.displayHexColor))
			.setTitle('Hello, I\'m **Ragnarok**! Thanks for inviting me!')
			.setDescription(`The prefix for all my commands is \`${this.client.prefix}\`, e.g: \`${this.client.prefix}help\`.\nIf you find any bugs, report them with \`${this.client.prefix}bugreport <bug>\`\nCheck \`${this.client.prefix}stats\` to see the latest announcements!`);
		defaultChannel.send({ embeds: [embed] });
	}

};
