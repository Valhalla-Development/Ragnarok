const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'queue',
    usage: '${prefix}queue',
    category: 'music',
    description: 'Displays current queue list.',
    accessableby: 'Everyone',
    aliases: ['q'],
  },

  run: async (bot, message, args) => {
    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    const dlRoleGrab = db
      .prepare(
        `SELECT role FROM music WHERE guildid = ${message.guild.id}`,
      )
      .get();

    let role;
    if (dlRoleGrab) {
      role = message.guild.roles.cache.find((r) => r.id === dlRoleGrab.role);
    } else {
      role = message.guild.roles.cache.find((x) => x.name === 'DJ');
    }

    if (!role) {
      const noRoleMessage = language.music.noRole;
      const noRolePrefix = noRoleMessage.replace('${prefix}', prefix);
      const noRoleF = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${noRolePrefix}`);
      message.channel.send(noRoleF);
      return;
    }

    const player = bot.music.players.get(message.guild.id);
    if (!player) {
      return message.channel.send({
        embed: {
          description: 'No song is currently playing in this guild.',

        },
      }).catch((err) => message.channel.send(err.message));
    }

    if (player.queue.length < 1) return message.channel.send('**:x: There is no queue**');

    const { title, requester, uri } = player.queue[0];

    const { queue } = player;

    if (args[0] === 'clear') {
      if (player.queue.length < 1) return message.channel.send('**:x: Nothing playing in this server**');
      player.queue.clear()
      message.channel.send('Queue cleared')
      return;
    }

    if (!player.queue[1]) {
      return message.channel.send('', {
        embed: {
          description: `🎧 Now Playing:\n[${title}](${uri}) [<@${requester.id}>]`,
          author: {
            name: `${message.guild.name}'s Queue.`,
            icon_url: message.guild.iconURL,
          },
          color: 3447003,
        },
      });
    }

    let x;
    if (args > 1) {
      x = Math.floor(args) * 10 + 1;
    } else {
      x = Math.floor(11);
    }
    let i;
    if (args > 1) {
      i = x - 11;
    } else {
      i = 0;
    }
    let queuelist = player.queue.slice(x - 10, x).map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`).join('\n');
    if (!queuelist) return message.channel.send('Page doesn\'t exist!');
    const embed = new MessageEmbed();
    embed.setDescription(`🎧 Now Playing:\n [${title}](${uri}) [<@${requester.id}>]\n__Up Next__:\n${queuelist}`);
    embed.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png');
    embed.setAuthor(`${message.guild.name}'s Queue (${Math.floor(x / 10)} / ${Math.floor((player.queue.slice(1).length + 10) / 10)})`);
    embed.setFooter(`Total items in queue: ${player.queue.length}`);
    message.channel.send(embed).then(async (msg) => {
      if (Math.floor((player.queue.slice(1).length + 10) / 10) > 1) {
        await msg.react('⏪');
        await msg.react('◀');
        await msg.react('🟣');
        await msg.react('▶');
        await msg.react('⏩');
        const pages = Math.floor((player.queue.slice(1).length + 10) / 10);
        let page = Math.floor(x / 10);
        const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '◀' && user.id === message.author.id, { time: 60000 });
        const doubleback = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏪' && user.id === message.author.id, { time: 60000 });
        const doubleforwad = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏩' && user.id === message.author.id, { time: 60000 });
        const forwad = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '▶' && user.id === message.author.id, { time: 60000 });
        const middle = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '🟣' && user.id === message.author.id, { time: 60000 });
        msg.delete({ timeout: 60000 });
        back.on('collect', async (r) => {
          if (page === 1) return r.users.remove(message.author);
          await r.users.remove(message.author);
          await page--;
          x = Math.floor(page) * 10 + 1;
          i = x - 11;
          queuelist = player.queue.slice(x - 10, x).map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`).join('\n');
          embed.setDescription(`🎧 Now Playing:\n [${title}](${uri}) [<@${requester.id}>]\n__Up Next__:\n${queuelist}`);
          embed.setAuthor(`${message.guild.name}'s Queue (${page} / ${pages})`);
          msg.edit(embed);
        });
        forwad.on('collect', async (r) => {
          if (page === pages) return r.users.remove(message.author);
          await r.users.remove(message.author);
          await page++;
          x = Math.floor(page) * 10 + 1;
          i = x - 11;
          queuelist = player.queue.slice(x - 10, x).map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`).join('\n');
          embed.setDescription(`🎧 Now Playing:\n [${title}](${uri}) [<@${requester.id}>]\n__Up Next__:\n${queuelist}`);
          embed.setAuthor(`${message.guild.name}'s Queue (${page} / ${pages})`);
          msg.edit(embed);
        });
        doubleback.on('collect', async (r) => {
          if (page === 1) return r.users.remove(message.author);
          await r.users.remove(message.author);
          page = 1;
          x = Math.floor(page) * 10 + 1;
          i = x - 11;
          queuelist = player.queue.slice(x - 10, x).map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`).join('\n');
          embed.setDescription(`🎧 Now Playing:\n [${title}](${uri}) [<@${requester.id}>]\n__Up Next__:\n${queuelist}`);
          embed.setAuthor(`${message.guild.name}'s Queue (${page} / ${pages})`);
          msg.edit(embed);
        });
        doubleforwad.on('collect', async (r) => {
          if (page === pages) return r.users.remove(message.author);
          await r.users.remove(message.author);
          page = pages;
          x = Math.floor(page) * 10 + 1;
          i = x - 11;
          queuelist = player.queue.slice(x - 10, x).map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`).join('\n');
          embed.setDescription(`🎧 Now Playing:\n [${title}](${uri}) [<@${requester.id}>]\n__Up Next__:\n${queuelist}`);
          embed.setAuthor(`${message.guild.name}'s Queue (${page} / ${pages})`);
          msg.edit(embed);
        });
        middle.on('collect', async (r) => r.users.remove(message.author));
      }
    });
  },
};
