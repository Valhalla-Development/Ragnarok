/* eslint-disable no-use-before-define */
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  config: {
    name: 'doctorwho',
    usage: '${prefix}doctorwho',
    category: 'fun',
    description: 'Fetches a random Doctor Who meme!',
    accessableby: 'Everyone',
    aliases: ['drwho'],
  },
  run: async (bot, message) => {
    const msg = await message.channel.send('Generating...');
    message.channel.startTyping();

    fetch('https://www.reddit.com/r/DoctorWhumour/random.json')
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
        .setColor('Top')
        .setImage(`${post.link}`);
      message.channel.send(embed);
    };
    message.channel.stopTyping();
    msg.delete();
  },
};
