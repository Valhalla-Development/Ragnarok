const { Client, Collection, MessageEmbed } = require('discord.js');
const Util = require('./Util.js');
const Canvas = require('canvas');
Canvas.registerFont('./Storage/Canvas/Fonts/Notethis.ttf', {
	family: 'Note'
});
const { GiveawaysManager } = require('discord-giveaways');
const db = require('quick.db');
if (!db.get('giveaways')) db.set('giveaways', []);

module.exports = class RagnarokClient extends Client {

	constructor(options = {}) {
		super({
			disableMentions: 'everyone'
		});
		this.validate(options);

		this.commands = new Collection();

		this.aliases = new Collection();

		this.events = new Collection();

		this.utils = new Util(this);

		this.owners = options.ownerID;

		const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {

			async getAllGiveaways() {
				return db.get('giveaways');
			}

			async saveGiveaway(messageID, giveawayData) {
				db.push('giveaways', giveawayData);
				return true;
			}

			async editGiveaway(messageID, giveawayData) {
				const giveaways = db.get('giveaways');
				const newGiveawaysArray = giveaways.filter((giveaway) => giveaway.messageID !== messageID);
				newGiveawaysArray.push(giveawayData);
				db.set('giveaways', newGiveawaysArray);
				return true;
			}

			async deleteGiveaway(messageID) {
				const newGiveawaysArray = db.get('giveaways').filter((giveaway) => giveaway.messageID !== messageID);
				db.set('giveaways', newGiveawaysArray);
				return true;
			}

		};

		// Create a new instance of your new class
		const manager = new GiveawayManagerWithOwnDatabase(this, {
			storage: false,
			updateCountdownEvery: 5000,
			default: {
				botsCanWin: false,
				exemptPermissions: ['MANAGE_MESSAGES', 'ADMINISTRATOR'],
				embedColor: '36393F',
				reaction: '🎉'
			}
		});
		this.giveawaysManager = manager;

		this.once('guildCreate', async (guild) => {
			this.invites.set(guild.id, await guild.fetchInvites());
		});

		this.once('guildMemberAdd', async (member) => {
			if (member.user.bot) return;

			const cachedInvites = this.invites.get(member.guild.id);
			const newInvites = await member.guild.fetchInvites();
			this.invites.set(member.guild.id, newInvites);

			const usedInvite = newInvites.find(invite => cachedInvites.get(invite.code).uses < invite.uses);

			const logChannel = member.guild.channels.cache.find(channel => channel.name === 'general');

			if (!logChannel) return;

			const { inviter } = usedInvite;
			const inviteUses = usedInvite.uses;

			const embed = new MessageEmbed()
				.setAuthor('Invite Manager', member.user.displayAvatarURL())
				.setDescription(`${member.user} **joined**; Invited by ${inviter.username} (${inviteUses} invites)`)
				.setColor(member.guild.me.displayHexColor || '36393F');

			logChannel.send(embed);
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

		this.filterList = options.filterList;

		if (options.logging !== true && options.logging !== false) throw new Error('The \'logging\' value must be true or false.');
		this.logging = options.logging;

		if (!options.prefix) throw new Error('You must pass a prefix for the client.');
		if (typeof options.prefix !== 'string') throw new TypeError('Prefix should be a type of String.');
		this.prefix = options.prefix;
	}

	async start(token = this.token) {
		this.utils.loadCommands();
		this.utils.loadEvents();
		super.login(token);
	}

};
