const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	async run(oldState, newState) {
		const player = this.client.manager.players.get(newState.guild.id);

		if (player) {
			// if oldState channel ID does not equal the player voiceChannel, return
			if (oldState.channelId !== player.voiceChannel) {
				return;
			}

			const userCount = oldState.channel.members.size;
			if (userCount <= 1) {
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(oldState.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Music**`,
						`**◎ Error:** No users in voice channel, ending playback.`);
				this.client.channels.cache.get(player.textChannel).send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				player.destroy();
			}
		}
	}

};
