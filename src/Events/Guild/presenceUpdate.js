const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	// this whole file is just for AirReps!
	async run(oldPresence, newPresence) {
		if (newPresence.guild.id !== '657235952116170794') return;

		const Ragnar = this.client.users.cache.find((a) => a.id === '151516555757223936');

		const offlineEmbed = new MessageEmbed()
			.setTitle('Ragnarok Report')
			.setDescription(`<@${newPresence.userID}> is **OFFLINE**`)
			.setColor('#ff2f2f')
			.setTimestamp();

		const onlineEmbed = new MessageEmbed()
			.setTitle('Ragnarok Report')
			.setDescription(`<@${newPresence.userID}> is **ONLINE**`)
			.setColor('#27d200')
			.setTimestamp();

		// Status other than offline
		const statusList = ['online', 'idle', 'dnd'];

		const airRepsBotId = '664924910048641044';

		const channelid = this.client.channels.cache.find((a) => a.id === '657342849737687041');
		if (airRepsBotId.includes(newPresence.userID)) {
			if (oldPresence.status === newPresence.status) return;
			if (statusList.includes(oldPresence.status) && statusList.includes(newPresence.status)) return;
			if (newPresence.status === 'offline') {
				channelid.send(`${Ragnar}`);
				channelid.send({ embeds: [offlineEmbed] });
			} else {
				channelid.send(`${Ragnar}`);
				channelid.send({ embeds: [onlineEmbed] });
			}
		}
	}

};
