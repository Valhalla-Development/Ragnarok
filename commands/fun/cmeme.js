/* eslint-disable no-use-before-define */
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  config: {
    name: 'cmeme',
    usage: '${prefix}cmeme',
    category: 'fun',
    description: 'Posts a comic meme',
    aliases: ['comicmeme'],
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const msg = await message.channel.send('Generating...');
    message.channel.startTyping();

    fetch('https://www.reddit.com/r/comicbookmemes/random.json')
      .then((res) => res.json())
      .then((res) => res[0].data.children)
      .then((res) => res.map((post) => ({
        link: post.data.url,
        title: post.data.title,
      })))
      .then((res) => res.map(render));

    const render = (post) => {
      const embed = new MessageEmbed()
        .setTitle(post.title)
        .setColor('36393F')
        .setImage(`${post.link}`);
      message.channel.send(embed);
    };
    message.channel.stopTyping();
    msg.delete();
  },
};
