const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays eco information',
			category: 'Economy'
		});
	}

	async run(message) {
		this.client.utils.messageDelete(message, 0);

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setAuthor(`${message.guild.name} - Eco`, message.guild.iconURL({ dynamic: true }))
			.setDescription([
				`** NOTE: This is a beta release for the economy system! Prices-rates are subject to change at any moment!**`,
				`** These are the planned features for full-release**`,
				`\u3000`,
				`\u3000`,
				`**◎ 1:** \`-farm\` this will require to buy seeds and plant them, the higher quality seeds will grant higher percentages`,
				`\u200b at the start you can farm for free, and buy tools for better quality produce, however you will also be able to level up your farming level and buy new fields with better yield`,
				`\u200b also your crops will decay if you do not farm them, and you will lose money (the price of the seeds you plant)`,
				`\u3000`,
				`**◎ 2:** \`-work\` *details unknown*`,
				`\u3000`,
				`**◎ 3:** \`-shop\` will include items you can buy, such as tools/weapons`,
				`\u200b It will also include boosts, such as increaes steal percent`,
				`\u200b also the ability to upgrade tools/weapons to increase chances of higher quality items`,
				`\u200b purchasable temporary passive mode, you can not steal or join a bankrob, you also can not be robbed or have someone rob your bank`,
				`\u3000`,
				`**◎ 4:** \`-fish\` will grant the ability to fish items at a lower percentage than fish of course, you will also be required to buy bait, the higher quality bait will grant higher percentages`,
				`\u200b like \`-farm\`, you will able to level up your fishing level, granting higher quality fish`,
				`\u3000`,
				`**◎ 5:** \`-craft\` you will be able to craft temporary boosts, for example the rate at which you earn money, increased percentages etc, some will also decay and become unusable`,
				`\u3000`,
				`**◎ 6:** \`-bankrob\` the ability to rob someones bank, however several players (not decided on number yet) must join the heist`,
				`\u3000`,
				`**◎ 7:** \`-lottery\` a lottery that runs every hour, minimum 4 players, winner takes all`,
				`\u3000`,
				`**◎ 8:** A command that will create a role and give it to the richest person in the server, can be enabled or disabled by server managers`,
				`\u3000`,
				`**◎ 9:** There will be a limit on how many items you can have at once, at and you will be able to upgrade your storage`,
				`\u3000`,
				`**◎ 10:** \`-farm\` & \`-fish\` --- these items will slowly decay when in your inventory, you must sell them as the price will lower over time`,
				`\u3000`
			]);
		message.channel.send(embed);
	}

};
