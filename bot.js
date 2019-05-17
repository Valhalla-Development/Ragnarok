const { Client, Collection, MessageEmbed } = require('discord.js');
const { token, logging } = require('./storage/config.json');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const bot = new Client();

['aliases', 'commands'].forEach(x => (bot[x] = new Collection()));
['console', 'command', 'event'].forEach(x => require(`./handlers/${x}`)(bot));

// welcome
bot.on('guildMemberAdd', member => {
	const setwelcome = db
		.prepare(`SELECT * FROM setwelcome WHERE guildid = ${member.guild.id};`)
		.get();
	if (!setwelcome) return;
	const title = setwelcome.title;
	const author = setwelcome.author;
	const description = setwelcome.description;
	if (!description) {
		db.prepare('DELETE FROM setwelcome WHERE guildid = ?').run(member.guild.id);
		return;
	}
	else {
		const sendchannel = setwelcome.channel;
		const chnsen = member.guild.channels.find(
			channel => channel.id === sendchannel
		);
		if (!chnsen) {
			db.prepare('DELETE FROM setwelcome WHERE guildid = ?').run(
				member.guild.id
			);
			return;
		}
		const embed = new MessageEmbed()
			.setTitle(`${title}`)
			.setAuthor(`${author}`, member.user.avatarURL())
			.setColor(3447003)
			.setDescription(`${description} ${member.user}`)
			.setThumbnail(member.user.avatarURL());
		bot.channels.get(sendchannel).send({
			embed,
		});
	}
});

// autorole
bot.on('guildMemberAdd', member => {
	const autoroletable = db
		.prepare(`SELECT role FROM autorole WHERE guildid = ${member.guild.id};`)
		.get();
	if (!autoroletable) return;
	const autorole = autoroletable.role;
	if (!autorole) {
		return;
	}
	else {
		const myRole = member.guild.roles.find(role => role.name === autorole);
		member.roles.add(myRole);
	}
});

if (process.version.slice(1).split('.')[0] < 8) {
	console.log(
		new Error(
			'[Ragnarok] You must have NodeJS 8 or higher installed on your PC.'
		)
	);
	process.exit(1);
}

if (logging !== true && logging !== false) {
	console.log(
		new TypeError('[Ragnarok] The \'logging\' value must be true or false.')
	);
	process.exit(1);
}

if (logging === true) {
	console.log(
		'[Ragnarok] Logging enabled! When someone executes a command, I will log that here.'
	);
}

// error notifiers
bot.on('error', e => {
	console.error(e);
});

bot.on('warn', e => {
	console.warn(e);
});

process.on('unhandledRejection', error => {
	console.error(`Error: \n${error.stack}`);
});

bot.login(token);
