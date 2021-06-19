const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays available commands.',
			category: 'Music'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setAuthor(`${this.client.user.username}- Music Commands`, 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
				.setDescription([
					`**◎ Play:**`,
					`\u3000 \`${prefix}play <search term/link>\` : Searches term / plays supplied link`,
					`\u3000`,
					`**◎ Pause:**`,
					`\u3000 \`${prefix}pause\` : Pauses music playback`,
					`\u3000`,
					`**◎ Resume:**`,
					`\u3000 \`${prefix}resume\` : Resumes music playback`,
					`\u3000`,
					`**◎ Now Playing:**`,
					`\u3000 \`${prefix}nowplaying\` : Displays current song playing`,
					`\u3000`,
					`**◎ Queue:**`,
					`\u3000 \`${prefix}queue\` : Displays current song queue`,
					`\u3000 \`${prefix}queue clear\` : Clears the song queue`,
					`\u3000`,
					`**◎ Skip:**`,
					`\u3000 \`${prefix}skip\` : Skips current song`,
					`\u3000`,
					`**◎ Repeat:**`,
					`\u3000 \`${prefix}repeat\` : Repeats current song playing`,
					`\u3000 \`${prefix}repeat queue\` : Repeats current song queue`,
					`\u3000`,
					`**◎ Volume:**`,
					`\u3000 \`${prefix}volume <1-100>\` : Sets the music playback volume`,
					`\u3000`,
					`**◎ Leave:**`,
					`\u3000 \`${prefix}leave\` : Ends music playback, and makes the bot leave the voice channel`,
					`\u3000`
				]);
			message.channel.send({ embeds: [embed] });
		}
	}

};
