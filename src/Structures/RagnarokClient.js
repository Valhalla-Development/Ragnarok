const { Client, Collection, MessageEmbed, Permissions } = require('discord.js');
const Util = require('./Util.js');
const Canvas = require('canvas');
Canvas.registerFont('./Storage/Canvas/Fonts/Notethis.ttf', {
	family: 'Note'
});
const { GiveawaysManager } = require('discord-giveaways');
const db = require('quick.db');
if (!db.get('giveaways')) db.set('giveaways', []);
const { Manager } = require('erela.js');
const Spotify = require('erela.js-spotify');
const prettyMilliseconds = require('pretty-ms');

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

		// Music
		const clientID = 'fee99683e65f44939358d0fb4f66837b';
		const clientSecret = '6038f0595e944b8896a5ac05d1741c46';

		function erelaClient(grabClient) {
			grabClient.manager = new Manager({
				plugins: [new Spotify({ clientID, clientSecret })],
				// Auto plays tracks after one ends, defaults to "false".
				autoPlay: true,
				// A send method to send data to the Discord WebSocket using your library.
				// Getting the shard for the guild and sending the data to the WebSocket.
				send(id, payload) {
					const guild = grabClient.guilds.cache.get(id);
					if (guild) guild.shard.send(payload);
				}
			})
				.on('nodeCreate', () => console.log('Successfully created a new Erela Node.'))
				.on('nodeDestroy', () => console.log('Successfully destroyed the Erela Node.'))
				.on('nodeConnect', () => console.log('Successfully created a new Erela Node.'))
				.on('nodeReconnect', () => console.log('Connection restored to Erela Node.'))
				.on('nodeDisconnect', () => console.log('Lost connection to Erela Node.'))
				.on('nodeError', (node, error) => console.log(`Node error: ${error.message}`))
				.on('queueEnd', (player) => {
					if (player.queueRepeat) {
						return;
					}
					const textChannel = player.get('textChannel');
					const embed = new MessageEmbed()
						.addField(`**${grabClient.user.username} - Music**`,
							`**◎ Success:** <:MusicLogo:684822003110117466> Queue has ended.`)
						.setColor(textChannel.guild.me.displayHexColor || '36393F');
					grabClient.channels.cache.get(player.textChannel).send(embed);
					player.destroy(player.guild.id);
					return;
				})
				.on('trackStart', (player, track) => {
					if (player.trackRepeat) {
						return;
					}
					const textChannel = player.get('textChannel');
					const embed = new MessageEmbed()
						.setAuthor('Now Playing:', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
						.setColor(textChannel.guild.me.displayHexColor || '36393F')
						.setDescription(`Now playing: \`${track.title}\`\nDuration: \`${prettyMilliseconds(track.duration, { colonNotation: true })}\`\nRequested by: ${track.requester}`);
					grabClient.channels.cache.get(player.textChannel).send(embed);
				})
				.on('trackEnd', (player) => {
					if (player.trackRepeat) {
						return;
					}
					const textChannel = player.get('textChannel');
					if (player.queue.size >= 1) {
						const embed = new MessageEmbed()
							.addField(`**${grabClient.user.username} - Music**`,
								`**◎ Success:** <:MusicLogo:684822003110117466> Track has ended.`)
							.setColor(textChannel.guild.me.displayHexColor || '36393F');
						grabClient.channels.cache.get(player.textChannel).send(embed);
						return;
					}
					player.destroy(player.guild.id);
				})
				.on('trackStuck', (player) => {
					const textChannel = player.get('textChannel');
					const embed = new MessageEmbed()
						.addField(`**${grabClient.user.username} - Music**`,
							`**◎ Error:** <:MusicLogo:684822003110117466> An error occured, ending playback.`)
						.setColor(textChannel.guild.me.displayHexColor || '36393F');
					grabClient.channels.cache.get(player.textChannel).send(embed);
					player.destroy(player.guild.id);
				})
				.on('trackError', (player) => {
					const textChannel = player.get('textChannel');
					const embed = new MessageEmbed()
						.addField(`**${grabClient.user.username} - Music**`,
							`**◎ Error:** <:MusicLogo:684822003110117466> An error occured, ending playback.`)
						.setColor(textChannel.guild.me.displayHexColor || '36393F');
					grabClient.channels.cache.get(player.textChannel).send(embed);
					player.destroy(player.guild.id);
				})
				.on('socketClosed', (player) => {
					player.destroy(player.guild.id);
				});
		}
		erelaClient(this);

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
				embedColor: 'A10000',
				reaction: '🎉'
			}
		});
		this.giveawaysManager = manager;

		// Invite Manager
		const guildInvites = new Collection();
		this.invites = guildInvites;

		// error notifiers
		this.on('error', (err) => {
			console.error(err);
		});

		this.on('warn', (err) => {
			console.warn(err);
		});

		if (process.version.slice(1).split('.')[0] < 12) {
			console.log(new Error(`[${this.user.username}] You must have NodeJS 12 or higher installed on your PC.`));
			process.exit(1);
		}

		process.on('unhandledRejection', (error) => {
			if (this.user.id === '508756879564865539') {
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

		if (!options.defaultPerms) throw new Error('You must pass default perm(s) for the Client.');
		this.defaultPerms = new Permissions(options.defaultPerms).freeze();
	}

	async start(token = this.token) {
		this.utils.loadCommands();
		this.utils.loadEvents();
		super.login(token);
	}

};
