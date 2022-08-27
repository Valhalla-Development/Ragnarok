import { EmbedBuilder, SlashCommandBuilder, parseEmoji } from 'discord.js';
import { parse } from 'twemoji-parser';

import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('bigemote')
  .setDescription('Displays an emote at full size')
  .addStringOption((option) => option.setName('emoji').setDescription('Select an emoji').setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays an emote at full size',
      category: 'Fun',
      options: data
    });
  }

  async run(interaction) {
    const emoji = interaction.options.getString('emoji');

    const custom = parseEmoji(emoji);

    if (custom.id) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .setTitle(
          `BigEmote - Requesed By ${
            interaction.guild.members.cache.get(interaction.user.id).nickname
              ? interaction.guild.members.cache.get(interaction.user.id).nickname
              : interaction.user.username
          }`
        )
        .setImage(`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? 'gif' : 'png'}`);
      interaction.reply({ embeds: [embed] });
    } else {
      const parsed = parse(emoji, { assetType: 'png' });
      if (!parsed[0]) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `BigEmote - Requesed By ${
            interaction.guild.members.cache.get(interaction.user.id).nickname
              ? interaction.guild.members.cache.get(interaction.user.id).nickname
              : interaction.user.username
          }`,
          value: '**◎ Error:** Invalid emoji!'
        });
        interaction.reply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .setTitle(
          `BigEmote - Requesed By ${
            interaction.guild.members.cache.get(interaction.user.id).nickname
              ? interaction.guild.members.cache.get(interaction.user.id).nickname
              : interaction.user.username
          }`
        )
        .setImage(parsed[0].url);
      interaction.reply({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
