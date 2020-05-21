/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-unused-vars */
/* jshint -W061 */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { readdirSync } = require('fs');
const { join } = require('path');
const { ownerID } = require('../../storage/config.json');

module.exports = {
  config: {
    name: 'reload',
    usage: '${prefix}reload <plugin>',
    category: 'owner',
    description: ' ',
    accessableby: 'Owner',
  },
  run: async (bot, message, args) => {
    if (message.author.id !== ownerID) return;

    if (!args[0]) {
      const noArgs = new MessageEmbed()
        .setColor('36393F')
        .setDescription('Please provide a command to reload!');
      message.channel.send(noArgs);
      return;
    }
    const commandName = args[0].toLowerCase();
    if (!bot.commands.get(commandName)) {
      const notaCommand = new MessageEmbed()
        .setColor('36393F')
        .setDescription(':x: That command does not exist! Try again.');
      message.channel.send(notaCommand);
      return;
    }
    readdirSync(join(__dirname, '..')).forEach((f) => {
      const files = readdirSync(join(__dirname, '..', f));
      if (files.includes(`${commandName}.js`)) {
        try {
          delete require.cache[
            require.resolve(join(__dirname, '..', f, `${commandName}.js`))
          ];
          bot.commands.delete(commandName);
          const pull = require(`../${f}/${commandName}.js`);
          bot.commands.set(commandName, pull);
          const success = new MessageEmbed()
            .setColor('36393F')
            .setDescription(`Successfully reloaded \`${commandName}\``);
          return message.channel.send(success);
        } catch (e) {
          const errorCatch = new MessageEmbed()
            .setColor('36393F')
            .setDescription(`Could not reload: \`${args[0].toUpperCase()}\``);
          return message.channel.send(errorCatch);
        }
      }
    });
  },
};
