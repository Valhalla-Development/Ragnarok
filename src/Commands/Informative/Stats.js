const Command = require('../../Structures/Command');
const { MessageEmbed, version } = require('discord.js');
const si = require('systeminformation');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Lists statistics on the bot.',
			category: 'Informative',
			usage: 'Stats'
		});
	}

	async run(message) {
		const dbGrab = db.prepare('SELECT msg FROM announcement').get();
		const dbMessage = dbGrab.msg;
		const msg = await message.channel.send('Generating...');
		message.channel.startTyping();
		const ping = Math.round(this.client.ws.ping);
		const memory = await si.mem();
		const totalMemory = Math.floor(memory.total / 1024 / 1024);
		const cachedMem = Math.floor(memory.buffcache / 1024 / 1024);
		const memoryUsed = Math.floor(memory.used / 1024 / 1024);
		const realMemUsed = Math.floor(memoryUsed - cachedMem);
		const memPercent = Math.floor((realMemUsed / totalMemory) * 100);
		const load = await si.currentLoad();
		const cpuUsage = Math.floor(load.currentload_user);
		const os = await si.osInfo();
		const osVersion = os.distro;
		const vers = await si.versions();
		const nodeVersion = vers.node;

		msg.delete();
		const serverembed = new MessageEmbed()
			.setAuthor('Ragnarok Info', this.client.user.avatarURL())
			.setFooter('Bot Created • November 4, 2018')
			.setColor('36393F')
			.setThumbnail(this.client.user.avatarURL())
			.addFields({
				name: 'Owner',
				value: 'Ragnar Lothbrok#1948',
				inline: true
			}, {
				name: 'Uptime',
				value: ms(this.client.uptime, { long: true })
			}, {
				name: 'Memory Usage',
				value: `${realMemUsed} / ${totalMemory} - ${memPercent}%`,
				inline: true
			}, {
				name: 'CPU Usage',
				value: `${cpuUsage}%`,
				inline: true
			}, {
				name: 'Ping',
				value: `${ping}ms`,
				inline: true
			}, {
				name: 'Users',
				value: `${this.client.users.cache.size.toLocaleString('en')}`,
				inline: true
			}, {
				name: 'Versions',
				value: `OS: ${osVersion}\nNode.js: ${nodeVersion}\nDiscord.js: ${version}`,
				inline: true
			}, {
				name: 'Guilds',
				value: `${this.client.guilds.cache.size.toLocaleString('en')}`,
				inline: true
			}, {
				name: 'Announcements',
				value: `\`\`\`${dbMessage}\`\`\``
			});
		message.channel.send(serverembed);
		message.channel.stopTyping();
	}

};
