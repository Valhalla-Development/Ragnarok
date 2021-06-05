/* eslint-disable no-inline-comments */
/* eslint-disable no-mixed-operators */
const { Client, Collection, MessageEmbed, Permissions, Intents } = require('discord.js');
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
const { SlashCreator } = require('slash-create');
const disbut = require('discord-buttons');


module.exports = class RagnarokClient extends Client {

	constructor(options = {}) {
		super({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING] });
		this.validate(options);

		this.commands = new Collection();

		this.aliases = new Collection();

		this.events = new Collection();

		this.utils = new Util(this);

		this.owners = options.ownerID;

		this.logger = require('./Logger.js');

		disbut(this);

		// Slash Commands
		const creator = new SlashCreator({
			applicationID: options.applicationID,
			publicKey: options.publicKey,
			token: options.token
		});

		this.slashClient = creator;

		// Music
		const clientID = options.musicClientID;
		const clientSecret = options.musicClientSecret;

		const balancePrice = {
			// Amount you earn per message & cooldown
			maxPerM: 40,
			minPerM: 10,
			// Time new users have to wait until using the claim command
			newUserTime: 604800000, // 7 Days
			// Claim amount
			hourlyClaimMin: 50,
			hourlyClaimMax: 150,
			dailyClaimMin: 150,
			dailyClaimMax: 300,
			weeklyClaimMin: 750,
			weeklyClaimMax: 1000,
			monthlyClaimMin: 4000,
			monthlyClaimMax: 6000,
			// Fishing related prices
			fishBagFirst: 50,
			fishBagLimit: 1000,
			fishBagPrice: 30, // Price is current capacity * price (Upgrade adds 25 to capacity)
			fishingRod: 15000,
			treasure: 50000,
			pufferfish: 3000,
			swordfish: 1500,
			kingSalmon: 500,
			trout: 150,
			// Fishing related timeouts
			fishWinTime: 600000, // 10 Minutes
			fishFailtime: 900000, // 15 Minutes
			// Farming with tools prices
			farmPlotFirst: 10,
			farmPlotLimit: 1000,
			farmPlotPrice: 50, // Price is current capacity * price (Upgrade adds 25 to capacity)
			freeFarmLimit: 10,
			farmingTools: 15000,
			farmBagFirst: 50, // Inital bag purchase
			farmBagLimit: 10000, // Max upgrade possible
			farmBagPrice: 20, // Price is current capacity * price (Upgrade adds 25 to capacity)
			goldBar: 25000,
			corn: 2500,
			wheat: 1000,
			potatoes: 330,
			tomatoes: 100,
			// Planting Times
			cornPlant: 600000, // 10 minutes
			wheatPlant: 450000, // 7 min 30
			potatoPlant: 210000, // 3 min 30
			tomatoPlant: 90000, // 1 min 30
			// Decay rate
			decayRate: 0.001,
			// Farming without tools prices
			goldNugget: 15000,
			barley: 1200,
			spinach: 600,
			strawberries: 200,
			lettuce: 60,
			// Farming without tools timeouts
			farmWinTime: 600000, // 10 Minutes
			farmFailTime: 900000, // 15 Minutes,
			// Seed prices
			seedBagFirst: 50, // Inital bag purchase
			seedBagLimit: 1000, // Max upgrade possible
			seedBagPrice: 10, // Price is current capacity * price (Upgrade adds 25 to capacity)
			cornSeed: 5000, // You get 10 per pack
			wheatSeed: 2000,
			potatoSeed: 660,
			tomatoSeed: 200,
			// Beg timeout
			begTimer: 120000
		};

		this.ecoPrices = balancePrice;

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
				.on('nodeCreate', () => grabClient.logger.ready('Successfully created a new Erela Node.'))
				.on('nodeDestroy', () => grabClient.logger.ready('Successfully destroyed the Erela Node.'))
				.on('nodeConnect', () => grabClient.logger.ready('Successfully created a new Erela Node.'))
				.on('nodeReconnect', () => grabClient.logger.ready('Connection restored to Erela Node.'))
				.on('nodeDisconnect', () => grabClient.logger.warn('Lost connection to Erela Node.'))
				.on('nodeError', (node, error) => grabClient.logger.error(`Node error: ${error.message}`))
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
					if (!player.queue.size) {
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
					if (player.queue.size) {
						const embed = new MessageEmbed()
							.addField(`**${grabClient.user.username} - Music**`,
								`**◎ Error:** <:MusicLogo:684822003110117466> An error occured, skipping playback.`)
							.setColor(textChannel.guild.me.displayHexColor || '36393F');
						grabClient.channels.cache.get(player.textChannel).send(embed);
						player.stop();
						return;
					}
					const embed = new MessageEmbed()
						.addField(`**${grabClient.user.username} - Music**`,
							`**◎ Error:** <:MusicLogo:684822003110117466> An error occured, ending playback.`)
						.setColor(textChannel.guild.me.displayHexColor || '36393F');
					grabClient.channels.cache.get(player.textChannel).send(embed);
					player.destroy(player.guild.id);
				})
				.on('trackError', (player) => {
					const textChannel = player.get('textChannel');
					if (player.queue.size) {
						const embed = new MessageEmbed()
							.addField(`**${grabClient.user.username} - Music**`,
								`**◎ Error:** <:MusicLogo:684822003110117466> An error occured, skipping playback.`)
							.setColor(textChannel.guild.me.displayHexColor || '36393F');
						grabClient.channels.cache.get(player.textChannel).send(embed);
						player.stop();
						return;
					}
					const embed = new MessageEmbed()
						.addField(`**${grabClient.user.username} - Music**`,
							`**◎ Error:** <:MusicLogo:684822003110117466> An error occured, ending playback.`)
						.setColor(textChannel.guild.me.displayHexColor || '36393F');
					grabClient.channels.cache.get(player.textChannel).send(embed);
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

		// Error function for notifiers
		function sendError(client, message) {
			if (client.user && client.user.id === '508756879564865539') {
				const channel = client.channels.cache.get('685973401772621843');
				if (!channel) return;

				channel.send(message, { code: 'js' });
			}
		}

		// Error Notifiers
		this.on('disconnect', () => this.logger.warn('Bot is disconnecting . . .'))
			.on('reconnecting', () => this.logger.log('Bot reconnecting . . .'))
			.on('error', (e) => this.logger.error(e))
			.on('debug', (info) => {
				// this.logger.debug(info)
				const loading = info.match(/\[WS => Shard (\d+)] \[CONNECT]/),
					sessions = info.match(/Remaining: (\d+)$/),
					reconnect = info.match(/\[WS => Shard (\d+)] \[RECONNECT] Discord asked us to reconnect/),
					swept = info.match(/Swept \d+ messages older than \d+ seconds in \d+ text-based channels/),
					discard = info.match(/\[WS => (Shard (\d+)|Manager)]/);
				if (loading) {
					this.logger.log(`Loading . . .`);
					return;
				}
				if (sessions) {
					this.logger.debug(`Session ${1000 - parseInt(sessions[1], 10)} of 1000`);
					return;
				}
				if (reconnect) {
					this.logger.log(`Discord asked shard ${reconnect[1]} to reconnect`);
					return;
				}
				if (swept) {
					this.logger.log(info);
					return;
				}
				if (discard) return;

				if (info.match(/\[WS => Shard \d+] (?:\[HeartbeatTimer] Sending a heartbeat\.|Heartbeat acknowledged, latency of \d+ms\.)/)) {
					return;
				}
				if (info.startsWith('429 hit on route')) return;
			})
			.on('warn', (info) => this.logger.warn(info))
			.on('shardReady', () => this.logger.ready(`Connected!`))
			.on('shardResume', () => this.logger.ready(`Connected!`));

		process.on('unhandledRejection', (error) => {
			this.logger.error(error);
			sendError(this, error.stack);
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
