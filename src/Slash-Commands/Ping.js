const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Displays bot and API ping.',
	async run({ interaction }) {
		const now = Date.now();
		await interaction.reply('Pinging...').then(m => {
			const after = Date.now();
			const latency = after - now;
			const embed = new MessageEmbed()
				.setColor('A10000')
				.addField(`**Ragnarok - Ping**`,
					`**◎ My ping is:** \`${latency}\`ms`);
			m.edit('', { embed: embed });
		});
	}
};
