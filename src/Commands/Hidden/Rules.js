const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Posts server rules',
			category: 'Hidden',
			ownerOnly: true
		});
	}

	async run(message) {
		this.client.utils.messageDelete(message, 0);
		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setThumbnail(message.guild.iconURL({ dynamic: true }))
			.addField(`${message.guild.name} - Review for \`Hicityy v4.5\``, [
				`**Review By:** ${message.author}`,
				`\u3000`,
				`**◎ Shipping:**`,
				`\u3000 Shipping to the UK was suprisingly fast, I ordered on\`28th August\` and received them on \`INSERT DATE\`. Overall the shipping experience was fantastic.`,
				`**◎ Packaging:**`,
				`\u3000 They came securely packaged, I noticed no marks/dents on any packaging. I had Apple branding, I had no issues with customs, the package does not appear to have been opened.`,
				`**◎ Quality:**`,
				`\u3000 I am constantly surprised with the quality of improvements on these replicas, I have no retail pair to compare however, I can assue you the build quality is excellent and has a premium feel to them. `,
				`**◎ Sound:**`,
				`\u3000 I only have a \`v3.8\` from a different seller to compare however, the audio in my opinion is to an excellent standard! You can expect premium sound quality for this premium product!`,
				`**◎ Controls:**`,
				`\u3000 `,
				`**◎ In Ear Detection:**`,
				`\u3000 I included this category, as my current pair are really terrible when it comes to detection and will auto-pause with them in my ear. I had to disable via iOS, but with this pair it works as intended! I have had no issues with the detection.`,
				`**◎ ANC:**`,
				`\u3000 `,
				`**◎ Conclusion:**`,
				`\u3000 `
			]);
		message.channel.send(embed);

		/* // Disable for all servers except The Treehouse :)
		const channel = message.guild.channels.cache.find((chan) => chan.name === 'testing');

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setAuthor(`${message.guild.name} - Rules`, message.guild.iconURL({ dynamic: true }))
			.setDescription([
				`**◎ 1:** Any and all forms of racism will **NOT** be tolerated.`,
				`\u3000`,
				`**◎ 2:** Do **NOT** mass tag users/roles.`,
				`\u3000`,
				`**◎ 3:** Do **NOT** spam any channel.`,
				`\u3000`,
				`**◎ 4:** If using any bot in this guild, please keep testing to ${channel}.`,
				`\u3000`
			]);
		message.channel.send(embed);*/
	}

};
