/* eslint-disable no-inline-comments */
/* eslint-disable no-mixed-operators */
const { Client, Collection, MessageEmbed, Permissions, Intents } = require('discord.js');
const Util = require('./Util.js');
const Canvas = require('canvas');
Canvas.registerFont('./Storage/Canvas/Fonts/Notethis.ttf', {
	family: 'Note'
});
const db = require('quick.db');
if (!Array.isArray(db.get('giveaways'))) db.set('giveaways', []);
const { GiveawaysManager } = require('discord-giveaways');
const { Manager } = require('erela.js');
const Spotify = require('erela.js-spotify');
const prettyMilliseconds = require('pretty-ms');
const { stripIndents } = require('common-tags');
const discordModals = require('discord-modals');

module.exports = class RagnarokClient extends Client {

	constructor(options = {}) {
		super({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
		this.validate(options);

		this.commands = new Collection();

		this.aliases = new Collection();

		this.events = new Collection();

		this.utils = new Util(this);

		this.owners = options.ownerID;

		// Modals (remove when v13.7 releases)
		discordModals(this);

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
				.on('nodeCreate', () => console.log('Successfully created a new Erela Node.'))
				.on('nodeDestroy', () => console.log('Successfully destroyed the Erela Node.'))
				.on('nodeConnect', () => console.log('Successfully created a new Erela Node.'))
				.on('nodeReconnect', () => console.log('Connection restored to Erela Node.'))
				.on('nodeDisconnect', () => console.log('Lost connection to Erela Node.'))
				.on('nodeError', (node, error) => console.error(`Node error: ${error.message}`))
				.on('playerMove', async (player, oldChannel, newChannel) => {
					const textChannel = player.get('textChannel');

					if (!newChannel) {
						player.destroy();
						const embed = new MessageEmbed()
							.addField(`**${grabClient.user.username} - Music**`,
								`**◎ Error:** <:MusicLogo:684822003110117466> I was removed from the voice channel. Ending playback.`)
							.setColor(textChannel.guild.me.displayHexColor || '36393F');
						grabClient.channels.cache.get(player.textChannel).send({ embeds: [embed] });
						return;
					}
					await player.setVoiceChannel(newChannel);

					const getOld = grabClient.channels.cache.get(oldChannel);
					const getNew = grabClient.channels.cache.get(newChannel);

					if (getNew.members.size <= 1) return;

					const embed = new MessageEmbed()
						.addField(`**${grabClient.user.username} - Music**`,
							`**◎ Success:** <:MusicLogo:684822003110117466> I was moved from <:VoiceChannel:855591004300115998>\`${getOld.name}\` to <:VoiceChannel:855591004300115998>\`${getNew.name}\`\nResuming playback.`)
						.setColor(textChannel.guild.me.displayHexColor || '36393F');
					grabClient.channels.cache.get(player.textChannel).send({ embeds: [embed] });

					player.pause(true);
					await setTimeout(() => {
						player.pause(false);
					}, 1000);
				})
				.on('queueEnd', (player) => {
					if (player.queueRepeat) {
						return;
					}
					const textChannel = player.get('textChannel');
					const embed = new MessageEmbed()
						.addField(`**${grabClient.user.username} - Music**`,
							`**◎ Success:** <:MusicLogo:684822003110117466> Queue has ended.`)
						.setColor(textChannel.guild.me.displayHexColor || '36393F');
					grabClient.channels.cache.get(player.textChannel).send({ embeds: [embed] });
					player.destroy(player.guild.id);
					return;
				})
				.on('trackStart', (player, track) => {
					if (player.trackRepeat) {
						return;
					}
					const textChannel = player.get('textChannel');

					const { title, duration, requester, uri, thumbnail } = track;

					const embed = new MessageEmbed()
						.setAuthor({ name: 'Now Playing', iconURL: 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png' })
						.setColor(textChannel.guild.me.displayHexColor || '36393F')
						.setThumbnail(`${thumbnail}`)
						.setDescription(stripIndents`
            [${title}](${uri})\n\nDuration: \`${prettyMilliseconds(duration, { colonNotation: true })}\`\n\n Requested by: ${requester.tag}`);
					grabClient.channels.cache.get(player.textChannel).send({ embeds: [embed] });
				})
				.on('trackEnd', (player) => {
					if (player.trackRepeat) {
						return;
					}
					const textChannel = player.get('textChannel');
					if (player.queue.size < 0) {
						player.destroy(player.guild.id);

						const embed = new MessageEmbed()
							.addField(`**${grabClient.user.username} - Music**`,
								`**◎ Success:** <:MusicLogo:684822003110117466> Track has ended.`)
							.setColor(textChannel.guild.me.displayHexColor || '36393F');
						grabClient.channels.cache.get(player.textChannel).send({ embeds: [embed] });
						return;
					}
				})
				.on('trackStuck', (player) => {
					const textChannel = player.get('textChannel');
					if (player.queue.size) {
						const embed = new MessageEmbed()
							.addField(`**${grabClient.user.username} - Music**`,
								`**◎ Error:** <:MusicLogo:684822003110117466> An error occured, skipping playback.`)
							.setColor(textChannel.guild.me.displayHexColor || '36393F');
						grabClient.channels.cache.get(player.textChannel).send({ embeds: [embed] });
						player.stop();
						return;
					}
					const embed = new MessageEmbed()
						.addField(`**${grabClient.user.username} - Music**`,
							`**◎ Error:** <:MusicLogo:684822003110117466> An error occured, ending playback.`)
						.setColor(textChannel.guild.me.displayHexColor || '36393F');
					grabClient.channels.cache.get(player.textChannel).send({ embeds: [embed] });
					player.destroy(player.guild.id);
				})
				.on('trackError', (player) => {
					const textChannel = player.get('textChannel');
					if (player.queue.size) {
						const embed = new MessageEmbed()
							.addField(`**${grabClient.user.username} - Music**`,
								`**◎ Error:** <:MusicLogo:684822003110117466> An error occured, skipping playback.`)
							.setColor(textChannel.guild.me.displayHexColor || '36393F');
						grabClient.channels.cache.get(player.textChannel).send({ embeds: [embed] });
						player.stop();
						return;
					}
					const embed = new MessageEmbed()
						.addField(`**${grabClient.user.username} - Music**`,
							`**◎ Error:** <:MusicLogo:684822003110117466> An error occured, ending playback.`)
						.setColor(textChannel.guild.me.displayHexColor || '36393F');
					grabClient.channels.cache.get(player.textChannel).send({ embeds: [embed] });
					player.destroy(player.guild.id);
				});
		}
		erelaClient(this);

		const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {

			// This function is called when the manager needs to get all giveaways which are stored in the database.
			async getAllGiveaways() {
				// Get all giveaways from the database
				return db.get('giveaways');
			}

			// This function is called when a giveaway needs to be saved in the database.
			async saveGiveaway(messageId, giveawayData) {
				// Add the new giveaway to the database
				db.push('giveaways', giveawayData);
				// Don't forget to return something!
				return true;
			}

			// This function is called when a giveaway needs to be edited in the database.
			async editGiveaway(messageId, giveawayData) {
				// Get all giveaways from the database
				const giveaways = db.get('giveaways');
				// Remove the unedited giveaway from the array
				const newGiveawaysArray = giveaways.filter((giveaway) => giveaway.messageId !== messageId);
				// Push the edited giveaway into the array
				newGiveawaysArray.push(giveawayData);
				// Save the updated array
				db.set('giveaways', newGiveawaysArray);
				// Don't forget to return something!
				return true;
			}

			// This function is called when a giveaway needs to be deleted from the database.
			async deleteGiveaway(messageId) {
				// Get all giveaways from the database
				const giveaways = db.get('giveaways');
				// Remove the giveaway from the array
				const newGiveawaysArray = giveaways.filter((giveaway) => giveaway.messageId !== messageId);
				// Save the updated array
				db.set('giveaways', newGiveawaysArray);
				// Don't forget to return something!
				return true;
			}

		};

		// Create a new instance of your new class
		const manager = new GiveawayManagerWithOwnDatabase(this, {
			default: {
				botsCanWin: false,
				embedColor: '#FF0000',
				embedColorEnd: '#000000',
				reaction: '🎉'
			}
		});

		// We now have a giveawaysManager property to access the manager everywhere!
		this.giveawaysManager = manager;

		// Error function for notifiers
		function sendError(client, message) {
			if (client.user && client.user.id === '508756879564865539') {
				const channel = client.channels.cache.get('685973401772621843');
				if (!channel) return;

				channel.send(`\`\`\`js\n${message}\`\`\``);
			}
		}

		// Error Notifiers
		this.on('disconnect', () => console.log('Bot is disconnecting . . .'))
			.on('reconnecting', () => console.log('Bot reconnecting . . .'))
			.on('error', (e) => console.error(e))
			/* .on('debug', (info) => {
				// console.log(info)
				const loading = info.match(/\[WS => Shard (\d+)] \[CONNECT]/),
					sessions = info.match(/Remaining: (\d+)$/),
					reconnect = info.match(/\[WS => Shard (\d+)] \[RECONNECT] Discord asked us to reconnect/),
					swept = info.match(/Swept \d+ messages older than \d+ seconds in \d+ text-based channels/),
					discard = info.match(/\[WS => (Shard (\d+)|Manager)]/);
				if (loading) {
					console.log(`Loading . . .`);
					return;
				}
				if (sessions) {
					console.log(`Session ${1000 - parseInt(sessions[1], 10)} of 1000`);
					return;
				}
				if (reconnect) {
					console.log(`Discord asked shard ${reconnect[1]} to reconnect`);
					return;
				}
				if (swept) {
					console.log(info);
					return;
				}
				if (discard) return;

				if (info.match(/\[WS => Shard \d+] (?:\[HeartbeatTimer] Sending a heartbeat\.|Heartbeat acknowledged, latency of \d+ms\.)/)) {
					return;
				}
				if (info.startsWith('429 hit on route')) return;
			})*/
			.on('warn', (info) => console.log(info));
		// .on('shardReady', () => console.log(`Connected!`))
		// .on('shardResume', () => console.log(`Connected!`));

		process.on('unhandledRejection', (error) => {
			console.error(error);
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
		this.utils.loadFunctions();
		super.login(token);
	}

};
