const Event = require('../../Structures/Event');
const { MessageEmbed, MessageAttachment, Permissions } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const Canvas = require('canvas');
const ordinal = require('ordinal');
const fetch = require('node-fetch-cjs');
const moment = require('moment');

module.exports = class extends Event {

	async run(member) {
		this.client.user.setActivity(`${this.client.prefix}help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
			{
				type: 'WATCHING'
			}
		);

		// AirReps Alert
		if (member.guild.id === '495602800802398212') {
			if (member.guild.memberCount === 31) {
				if (member.guild.roles.cache.find((r) => r.name === '10,000th Member')) return;
				this.client.channels.cache.get('657241621112553474').send(`We just hit 10,000 members!\n`);
				member.guild.roles.create(
					{ name: '10,000th Member', reason: '10,000th Member', color: 'BLUE' }
				).then((role) => member.roles.add(role)).catch(console.error);
			}
		}

		// welcome
		async function welcomeMessage(clientGrab) {
			// Return if user is my testing alt
			if (member.user.id === '488717256897855519') return;

			const setwelcome = db.prepare(`SELECT * FROM setwelcome WHERE guildid = ${member.guild.id};`).get();
			if (!setwelcome) return;

			const sendchannel = setwelcome.channel;
			const chnsen = member.guild.channels.cache.find((channel) => channel.id === sendchannel);

			if (!chnsen) {
				db.prepare('DELETE FROM setwelcome WHERE guildid = ?').run(member.guild.id);
				return;
			}

			let img;
			if (setwelcome.image) {
				await fetch.default(setwelcome.image)
					.then(res => {
						if (res.ok) {
							img = setwelcome.image;
						} else {
							img = './Storage/Canvas/Images/welcome.jpg';
						}
					});
			} else {
				img = './Storage/Canvas/Images/welcome.jpg';
			}

			const canvas = Canvas.createCanvas(700, 300);
			const ctx = canvas.getContext('2d');

			const background = await Canvas.loadImage(img);

			ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

			// bars
			ctx.globalAlpha = 0.4;
			ctx.rect(-1, 7, 702, 52);
			ctx.fillStyle = '#000000';
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#ffffff';
			ctx.stroke();

			ctx.rect(-1, 240, 702, 52);
			ctx.fillStyle = '#000000';
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#ffffff';
			ctx.stroke();
			ctx.globalAlpha = 1;

			// text
			ctx.font = '42px Note';
			ctx.fillStyle = '#ffffff';
			ctx.textAlign = 'center';
			ctx.fillText('Welcome to the server', canvas.width / 2, 45);

			ctx.font = '42px Note';
			ctx.fillStyle = '#ffffff';
			ctx.textAlign = 'center';
			ctx.fillText(`${member.user.username}`, canvas.width / 2, 280);

			ctx.font = 'bold 20px Courier';
			ctx.fillStyle = '#ffffff';
			ctx.textAlign = 'left';
			ctx.fillText(`${ordinal(member.guild.memberCount - member.guild.members.cache.filter((m) => m.user.bot).size)} member!`, 5, 232);

			ctx.beginPath();
			ctx.arc(350, 150, 85, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();

			const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png' }));

			ctx.strokeStyle = '#ffffff';
			ctx.strokeRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(avatar, 257.5, 57.5, 180, 180);

			const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.jpg');

			clientGrab.channels.cache.get(sendchannel).send({ files: [attachment] }).catch((err) => console.error(err));
		}
		welcomeMessage(this.client);

		// autorole
		function autoRole() {
			const autoroletable = db.prepare(`SELECT role FROM autorole WHERE guildid = ${member.guild.id};`).get();
			if (!autoroletable) return;

			const autorole = autoroletable.role;
			if (!autorole) return;

			const myRole = member.guild.roles.cache.find((role) => role.name === autorole);
			if (!myRole) return;

			member.roles.add(myRole);
		}
		autoRole();

		// Invite Manager
		async function inviteManager(grabClient) {
			const inviteID = db.prepare(`SELECT channel FROM invmanager WHERE guildid = ${member.guild.id};`).get();
			if (!inviteID) return;

			if (!member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
				db.prepare('DELETE FROM invmanager WHERE guildid = ?').run(member.guild.id);
				return;
			}

			if (member.user.bot) return;

			const cachedInvites = grabClient.invites.get(member.guild.id);
			const newInvites = await member.guild.invites.fetch();

			grabClient.invites.set(member.guild.id, newInvites);

			const usedInvites = newInvites.find(invite => cachedInvites.get(invite.code).uses < invite.uses);

			if (!usedInvites) return;

			const logChannel = member.guild.channels.cache.find(channel => channel.id === inviteID.channel);

			if (!logChannel) return;

			const { uses, inviter } = usedInvites;

			const embed = new MessageEmbed()
				.setColor(grabClient.utils.color(member.guild.me.displayHexColor))
				.setAuthor({ name: `${member.guild.name}`, iconURL: member.user.avatarURL() })
				.addField(`**Invite Manager**`,
					`**◎ ${member.user} joined**; Invited by ${inviter} (${uses} invites)`)
				.setFooter({ text: `ID: ${member.user.id}` })
				.setTimestamp();
			logChannel.send({ embeds: [embed] });
		}
		inviteManager(this.client);

		// Logs
		function logging(grabClient) {
			const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${member.guild.id};`).get();
			if (!id) return;

			const logs = id.channel;
			if (!logs) return;

			const logembed = new MessageEmbed()
				.setColor(grabClient.utils.color(member.guild.me.displayHexColor))
				.setAuthor({ name: `${member.guild.name}`, iconURL: member.user.avatarURL() })
				.setDescription(`**◎ Member Joined:** <@${member.user.id}> - ${member.user.tag}\n**◎ Account Created:** \`${moment(member.user.createdTimestamp).format('ddd, MMM Do YYYY')}\` - ${moment(member.user.createdTimestamp).fromNow()}`)
				.setFooter({ text: `ID: ${member.user.id}` })
				.setTimestamp();
			grabClient.channels.cache.get(logs).send({ embeds: [logembed] });
		}
		logging(this.client);

		// Member Count
		const memStat = db.prepare(`SELECT * FROM membercount WHERE guildid = ${member.guild.id};`).get();
		if (memStat) {
			const channelA = this.client.channels.cache.find((a) => a.id === memStat.channela);
			const channelB = this.client.channels.cache.find((b) => b.id === memStat.channelb);
			const channelC = this.client.channels.cache.find((c) => c.id === memStat.channelc);

			if (channelA) {
				channelA.setName(`Users: ${(member.guild.memberCount - member.guild.members.cache.filter((m) => m.user.bot).size).toLocaleString('en')}`);
			} else {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
			}
			if (channelB) {
				channelB.setName(`Bots: ${member.guild.members.cache.filter((m) => m.user.bot).size}`);
			} else {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
			}
			if (channelC) {
				channelC.setName(`Total: ${member.guild.memberCount.toLocaleString('en')}`);
			} else {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
			}
		}
	}

};
