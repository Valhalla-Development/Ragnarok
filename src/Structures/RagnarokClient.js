const { Client, Collection } = require('discord.js');
const Util = require('./Util.js');
const Canvas = require('canvas');
Canvas.registerFont('./Storage/Canvas/Fonts/Notethis.ttf', {
	family: 'Note'
});

module.exports = class RagnarokClient extends Client {

	constructor(options = {}) {
		super({
			disableMentions: 'everyone'
		});
		this.validate(options);

		this.commands = new Collection();

		this.aliases = new Collection();

		this.utils = new Util(this);

		this.owners = options.ownerID;

		this.once('ready', () => {
			console.log(`Logged in as ${this.user.username}!`);

			const guildInvites = new Map();
			this.invites = guildInvites;

			this.guilds.cache.forEach(guild => {
				guild.fetchInvites()
					.then(invite => this.invites.set(guild.id, invite) // erros atm, fix bub
						.catch(error => console.log(error)));
			});
		});

		this.once('invite', async (invite) => {
			this.invites.set(invite.guild.id, await invite.guild.fetchInvites());
		});

		this.once('guildMemberUpdate', async (member) => {
			if (member.user.bot) return;

			const cachedInvites = this.invites.get(member.guild.id);

			const newInvites = await member.guild.fetchInvites();
			this.invites.set(member.guild.id, newInvites);

			const usedInvite = newInvites.find(invite => cachedInvites.get(invite.code).uses < invite.uses);

			const { MessageEmbed } = require('discord.js');

			const logChannel = member.guild.channels.cache.find(channel => channel.name === 'owner-testing');

			if (!logChannel) return;

			const { inviter } = usedInvite;
			const inviteUses = usedInvite.uses;

			const embed = new MessageEmbed()
				.setAuthor('Invite Manager', member.user.displayAvatarURL())
				.setDescription(`${member.user} **joined**; Invited by ${inviter.username} (${inviteUses} invites)`)
				.setColor('36393F');

			logChannel.send(embed);
		});

		this.on('message', async (message) => {
			const mentionRegex = RegExp(`^<@!${this.user.id}>$`);

			if (!message.guild || message.author.bot) return;

			if (message.content.match(mentionRegex)) message.channel.send(`My prefix for ${message.guild.name} is \`${this.prefix}\`.`);

			const { prefix } = this;

			if (!message.content.startsWith(prefix)) return;

			// eslint-disable-next-line no-unused-vars
			const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

			const command = this.commands.get(cmd.toLowerCase()) || this.commands.get(this.aliases.get(cmd.toLowerCase()));
			if (command) {
				command.run(message, args);
			}
		});

		// error notifiers
		this.on('error', (err) => {
			console.error(err);
		});

		this.on('warn', (err) => {
			console.warn(err);
		});

		if (process.version.slice(1).split('.')[0] < 12) {
			console.log(new Error('[Ragnarok] You must have NodeJS 12 or higher installed on your PC.'));
			process.exit(1);
		}

		process.on('unhandledRejection', (error) => {
			if (this.id === '508756879564865539') {
				this.channels.cache.get('685973401772621843').send(`${error.stack}`, { code: 'js' });
			}
			console.error(`Error: \n${error.stack}`);
		});
	}

	validate(options) {
		if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

		if (!options.token) throw new Error('You must pass the token for the client.');
		this.token = options.token;

		if (options.logging !== true && options.logging !== false) throw new Error('The \'logging\' value must be true or false.');
		this.logging = options.logging;

		if (!options.prefix) throw new Error('You must pass a prefix for the client.');
		if (typeof options.prefix !== 'string') throw new TypeError('Prefix should be a type of String.');
		this.prefix = options.prefix;
	}

	async start(token = this.token) {
		this.utils.loadCommands();
		super.login(token);
	}

};
