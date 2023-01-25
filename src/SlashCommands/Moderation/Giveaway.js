import ms from 'ms';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Use Giveaway module')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('start')
      .setDescription('Start a Giveaway')
      .addStringOption((option) => option.setName('time').setDescription('How long the Giveaway should last').setRequired(true))
      .addIntegerOption((option) => option.setName('amount').setDescription('How many winners in the Giveaway').setMinValue(1).setRequired(true))
      .addStringOption((option) => option.setName('prize').setDescription('The prize of the Giveaway').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('reroll')
      .setDescription('Reroll a Giveaway')
      .addStringOption((option) => option.setName('message').setDescription('ID of the Giveaway message to reroll').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('stop')
      .setDescription('Stop a Giveaway')
      .addStringOption((option) => option.setName('message').setDescription('ID of the Giveaway message to stop').setRequired(true))
  );

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Use Giveaway module',
      category: 'Moderation',
      options: data,
      userPerms: ['ManageMessages'],
      botPerms: ['AddReactions']
    });
  }

  async run(interaction) {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === 'start') {
      const gTime = interaction.options.getString('time');
      const gAmount = interaction.options.getInteger('amount');
      const gPrize = interaction.options.getString('prize');

      if (!gTime.match('[dhm]')) {
        const incorrectFormat = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Giveaway**`,
          value:
            '**◎ Error:** You did not use the correct formatting for the time! The valid options are `d`, `h`, or `m`.\nAn example would be `/giveaway start 1d`'
        });
        interaction.reply({ ephemeral: true, embeds: [incorrectFormat] });
        return;
      }

      if (ms(gTime) > '7889400000') {
        const valueHigh = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** Please input a value lower than 3 months!' });
        interaction.reply({ ephemeral: true, embeds: [valueHigh] });
        return;
      }

      if (ms(gTime) < '60000') {
        const valueLow = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** Please input a value higher than 1 minute!' });
        interaction.reply({ ephemeral: true, embeds: [valueLow] });
        return;
      }

      if (Number.isNaN(ms(gTime))) {
        const invalidDur = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** Please input a valid duration!' });
        interaction.reply({ ephemeral: true, embeds: [invalidDur] });
        return;
      }

      const duration = ms(gTime);
      const winnerCount = parseInt(gAmount);
      const prize = gPrize;

      this.client.giveawaysManager.start(interaction.channel, {
        duration,
        winnerCount,
        prize,
        lastChance: {
          enabled: true,
          content: '⚠️ **LAST CHANCE TO ENTER !** ⚠️',
          threshold: 5000,
          embedColor: '#FF0000'
        }
      });

      const invalidDur = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Success:** Giveaway has started' });
      interaction.reply({ ephemeral: true, embeds: [invalidDur] });
    }

    if (subCommand === 'reroll') {
      const gReroll = interaction.options.getString('message');

      const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.GuildId === interaction.guild.id && g.messageId === gReroll);
      console.log(giveaway);
      if (!giveaway) {
        const noGiveaway = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Giveaway**`,
          value: `**◎ Error:** Unable to find a giveaway with ID: \`${gReroll}\`.`
        });
        interaction.reply({ ephemeral: true, embeds: [noGiveaway] });
        return;
      }

      this.client.giveawaysManager
        .reroll(giveaway.messageId)
        .then(() => {
          const rerolled = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Success:** Giveaway rerolled!' });
          interaction.reply({ ephemeral: true, embeds: [rerolled] });
        })
        .catch((e) => {
          if (e.startsWith(`Giveaway with message ID ${giveaway.messageId} is not ended.`)) {
            const notEnded = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** This giveaway has not ended!' });
            interaction.reply({ ephemeral: true, embeds: [notEnded] });
          } else {
            console.error(e);
            const error = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** An error occured!' });
            interaction.reply({ ephemeral: true, embeds: [error] });
          }
        });
    }

    if (subCommand === 'stop') {
      const gStop = interaction.options.getString('message');

      const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.GuildId === interaction.guild.id && g.messageId === gStop);

      if (!giveaway) {
        const noGiveaway = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Giveaway**`,
          value: `**◎ Error:** Unable to find a giveaway with ID: \`${gStop}\`.`
        });
        interaction.reply({ ephemeral: true, embeds: [noGiveaway] });
        return;
      }

      this.client.giveawaysManager
        .edit(giveaway.messageId, {
          setEndTimestamp: Date.now()
        })
        .then(() => {
          const stopped = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Giveaway**`,
            value: `**◎ Success:** Giveaway will end in less than ${this.client.giveawaysManager.options.forceUpdateEvery / 1000} seconds.`
          });
          interaction.reply({ ephemeral: true, embeds: [stopped] });
        })
        .catch((e) => {
          if (e.startsWith(`Giveaway with message ID ${giveaway.messageId} is already ended.`)) {
            const alreadyEnded = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** This giveaway has already ended!' });
            interaction.reply({ ephemeral: true, embeds: [alreadyEnded] });
          } else {
            console.error(e);
            const error = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** An error occured!' });
            interaction.reply({ ephemeral: true, embeds: [error] });
          }
        });
    }
  }
};

export default SlashCommandF;
