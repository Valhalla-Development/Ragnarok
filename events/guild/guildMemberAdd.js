const { MessageEmbed, MessageAttachment } = require('discord.js');
const SQLite = require('better-sqlite3');
const Canvas = require('canvas');
const { prefix } = require('../../storage/config.json');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, member) => {
  bot.user.setActivity(
    `${prefix}help | ${(bot.guilds.cache.size).toLocaleString('en')} Guilds ${(bot.users.cache.size).toLocaleString('en')} Users`,
    {
      type: 'WATCHING',
    },
  );

  // welcome
  async function welcomeMessage() {
    const setwelcome = db
      .prepare(`SELECT * FROM setwelcome WHERE guildid = ${member.guild.id};`)
      .get();
    if (!setwelcome) {
      return;
    }

    const sendchannel = setwelcome.channel;
    const chnsen = member.guild.channels.cache.find(
      (channel) => channel.id === sendchannel,
    );
    if (!chnsen) {
      db.prepare('DELETE FROM setwelcome WHERE guildid = ?').run(
        member.guild.id,
      );
      return;
    }

    const canvas = Canvas.createCanvas(700, 300);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage(
      './storage/canvas/images/welcome.jpg',
    );

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.font = '42px Note';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Welcome to the server', canvas.width / 2, 45);

    ctx.font = '42px Note';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${member.user.username}`, canvas.width / 2, 280);

    ctx.beginPath();
    ctx.arc(350, 150, 85, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(
      member.user.displayAvatarURL({ format: 'png' }),
    );
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(avatar, 257.5, 57.5, 180, 180);

    const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.jpg');

    bot.channels.cache.get(sendchannel).send(`Welcome, ${member}!`, attachment).catch((err) => console.log(err));
  }
  welcomeMessage();

  // autorole
  function autoRole() {
    const autoroletable = db
      .prepare(`SELECT role FROM autorole WHERE guildid = ${member.guild.id};`)
      .get();
    if (!autoroletable) return;
    const autorole = autoroletable.role;
    if (!autorole) {
      return;
    }
    const myRole = member.guild.roles.cache.find((role) => role.name === autorole);
    member.roles.add(myRole);
  }
  autoRole();

  // Logs
  const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${member.guild.id};`).get();
  if (id) {
    const logs = id.channel;
    if (logs) {
      const logembed = new MessageEmbed()
        .setAuthor('Member Joined', member.user.avatarURL())
        .setDescription(`<@${member.user.id}> - ${member.user.tag}`)
        .setColor('990000')
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();
      bot.channels.cache.get(logs).send(logembed);
    }
  }

  // Member Count
  const memStat = db.prepare(`SELECT * FROM membercount WHERE guildid = ${member.guild.id};`).get();
  if (memStat) {
    const channelA = bot.channels.cache.find((a) => a.id === memStat.channela);
    const channelB = bot.channels.cache.find((b) => b.id === memStat.channelb);
    const channelC = bot.channels.cache.find((c) => c.id === memStat.channelc);

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
      channelC.setName(`Total: ${(member.guild.memberCount).toLocaleString('en')}`);
    } else {
      db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
    }
  }
};
