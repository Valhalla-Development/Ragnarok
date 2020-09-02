const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	async run(guild) {
		// this.client.invites.set(guild.id, await guild.fetchInvites());

		console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
		this.client.user.setActivity(`${this.client.prefix}help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
			{
				type: 'WATCHING'
			}
		);

		let defaultChannel = '';
		guild.channels.cache.forEach((channel) => {
			if (channel.type === 'text' && defaultChannel === '') {
				if (channel.permissionsFor(guild.me).has('SEND_MESSAGES')) {
					defaultChannel = channel;
				}
			}
		});
		const embed = new MessageEmbed()
			.setAuthor(guild, guild.iconURL())
			.setColor(this.client.utils.color(guild.me.displayHexColor))
			.setTitle('Hello, I\'m **Ragnarok**! Thanks for inviting me!')
			.setDescription(`The prefix for all my commands is \`${this.client.prefix}\`, e.g: \`${this.client.prefix}help\`.\nIf you find any bugs, report them with \`${this.client.prefix}bugreport <bug>\`\nCheck \`${this.client.prefix}stats\` to see the latest announcements!`);
		defaultChannel.send({
			embed
		});
	}

};
