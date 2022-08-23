import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import Hastebin from 'hastebin.js';
import fetch from 'node-fetch';
import SQLite from 'better-sqlite3';
import urlRegexSafe from 'url-regex-safe';
import prettier from 'prettier';
import SlashCommand from '../../Structures/SlashCommand.js';

const haste = new Hastebin({ url: 'https://pastie.io' });

const db = new SQLite('./Storage/DB/db.sqlite');

const data = new SlashCommandBuilder()
  .setName('hastebin')
  .setDescription('Fetches search results from r/AirReps')
  .addStringOption((option) => option.setName('text').setDescription('Text you wish to upload'))
  .addAttachmentOption((option) => option.setName('attachment').setDescription('The file you wish to upload'));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Posts text/file to paste.io.',
      category: 'Fun',
      options: data,
      usage: '<text/attachment>'
    });
  }

  async run(interaction) {
    if (!interaction.options.getAttachment('attachment') && !interaction.options.getString('text')) {
      const error = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Hastebin**`,
        value: '**◎ Error:** You must select either the `text` or `attachment` option!'
      });
      interaction.reply({ ephemeral: true, embeds: [error] });
      return;
    }

    this.client.getTable = db.prepare('SELECT * FROM hastebin WHERE guildid = ?');
    const status = this.client.getTable.get(interaction.guild.id);

    const parseAttachment = interaction.options.getAttachment('attachment');
    if (parseAttachment) {
      const file = parseAttachment.url;
      const fileExtension = file.substring(file.lastIndexOf('.') + 1);

      let extension;
      if (fileExtension === 'txt') {
        extension = 'js';
      } else {
        extension = fileExtension;
      }

      const validExtensions = [
        'bat',
        'c',
        'cpp',
        'css',
        'html',
        'ini',
        'java',
        'js',
        'jsx',
        'json',
        'lua',
        'md',
        'php',
        'py',
        'pyc',
        'scss',
        'sql',
        'txt',
        'xml',
        'yaml'
      ];

      if (!validExtensions.includes(fileExtension)) {
        const invalidExt = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Hastebin**`,
          value: `**◎ Error:** \`.${fileExtension}\` is not a valid file type!\n\n**Acceptable files:**\n\`${validExtensions.join(', ')}\``
        });
        interaction.reply({ ephemeral: true, embeds: [invalidExt] });
        return;
      }

      await fetch(file)
        .then((res) => res.text())
        .then((body) => {
          if (!body) {
            const emptyFile = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Hastebin**`, value: '**◎ Error:** You can not upload an empty file!' });
            interaction.reply({ ephemeral: true, embeds: [emptyFile] });
            return;
          }

          haste
            .post(body, extension)
            .then((res) => {
              const hastEmb = new EmbedBuilder()
                .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - HasteBin**`, value: `**◎ Link:** ${res}\nPosted By: ${interaction.user}` })
                .setURL(res);
              interaction.reply({ embeds: [hastEmb] });
            })
            .catch(() => {
              const error = new EmbedBuilder()
                .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - HasteBin**`, value: '**◎ Error:** An error occured!' });
              interaction.reply({ ephemeral: true, embeds: [error] });
            });
        })
        .catch(() => {
          const error = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - HasteBin**`, value: '**◎ Error:** An error occured!' });
          interaction.reply({ ephemeral: true, embeds: [error] });
        });
    }

    const parseText = interaction.options.getString('text');
    if (parseText) {
      let cnt;

      const text = parseText;
      const user = interaction.guild.members.cache.get(interaction.user.id);

      if (status) {
        if (user.permissions.has(PermissionsBitField.Flags.ManageGuild) || user.permissions.has(PermissionsBitField.Flags.Administrator)) {
          const matches = text.match(urlRegexSafe());
          cnt = text.replace(matches, ' || Discord Link Removed By Server Config. If this is a mistake, please contact a server administrator. || ');
        } else {
          try {
            cnt = prettier.format(parseText, { semi: true, singleQuote: true, parser: 'babel' });
          } catch {
            cnt = parseText;
          }
        }
      } else {
        try {
          cnt = prettier.format(parseText, { semi: true, singleQuote: true, parser: 'babel' });
        } catch {
          cnt = parseText;
        }
      }

      await haste
        .post(cnt, 'js')
        .then((link) => {
          const hastEmb = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - HasteBin**`, value: `**◎ Link:** ${link}\nPosted By: ${interaction.user}` })
            .setURL(link);
          interaction.reply({ embeds: [hastEmb] });
        })
        .catch(() => {
          const error = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - HasteBin**`, value: '**◎ Error:** An error occured!' });
          interaction.reply({ ephemeral: true, embeds: [error] });
        });
    }
  }
};

export default SlashCommandF;
