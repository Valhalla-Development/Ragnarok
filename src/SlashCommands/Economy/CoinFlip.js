import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('coinflip')
  .setDescription('Flip a coin')
  .addSubcommand((subcommand) => subcommand.setName('all').setDescription('Bet your entire balance'))
  .addSubcommand((subcommand) =>
    subcommand
      .setName('amount')
      .setDescription('The amount to gamble')
      .addIntegerOption((option) => option.setName('amount').setDescription('The amount to gamble').setMinValue(10).setRequired(true))
  );

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Flip a coin',
      category: 'Economy',
      options: data
    });
  }

  async run(interaction) {
    const subOptions = interaction.options.getSubcommand();

    const balance = this.client.getBalance.get(`${interaction.user.id}-${interaction.guild.id}`);

    if (!balance) {
      const limitE = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Coin Flip**`, value: '**◎ Error:** You do not have any balance!' });
      interaction.reply({ ephemeral: true, embeds: [limitE] });
      return;
    }

    let betAmt;

    if (subOptions === 'all') {
      betAmt = balance.bank;
    } else if (subOptions === 'amount') {
      betAmt = interaction.options.getInteger('amount');
    }

    if (Number(betAmt) > balance.bank) {
      const wrongUsage = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Coin Flip**`,
          value: `**◎ Error:** You do not have enough to bet <:coin:706659001164628008> \`${Number(betAmt).toLocaleString(
            'en'
          )}\`, you have <:coin:706659001164628008> \`${Number(balance.bank).toLocaleString('en')}\` available in your bank.`
        });
      interaction.reply({ ephemeral: true, embeds: [wrongUsage] });
      return;
    }

    const flip = ['heads', 'tails'];
    const answer = flip[Math.floor(Math.random() * flip.length)];
    const houseBet = betAmt;

    const buttonA = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Heads!').setCustomId('heads');
    const buttonB = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Tails!').setCustomId('tails');
    const buttonC = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Cancel').setCustomId('cancel');
    const row = new ActionRowBuilder().addComponents(buttonA, buttonB, buttonC);

    const buttonANew = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Heads!').setCustomId('heads').setDisabled(true);
    const buttonBNew = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Tails!').setCustomId('tails').setDisabled(true);
    const buttonCNew = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Cancel').setCustomId('cancel').setDisabled(true);
    const rowNew = new ActionRowBuilder().addComponents(buttonANew, buttonBNew, buttonCNew);

    const initial = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Coin Flip**`,
        value: `**◎** ${interaction.user} bet <:coin:706659001164628008> \`${Number(betAmt).toLocaleString(
          'en'
        )}\`\n**◎** The house bet <:coin:706659001164628008> \`${Number(houseBet).toLocaleString('en')}\``
      });

    const win = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Coin Flip**`,
        value: `**◎** ${interaction.user} won! <:coin:706659001164628008> \`${Number(houseBet).toLocaleString(
          'en'
        )}\` has been credited to your bank!`
      });

    const lose = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Coin Flip**`,
        value: `**◎** ${interaction.user} lost <:coin:706659001164628008> \`${Number(betAmt).toLocaleString('en')}\``
      });

    const m = await interaction.reply({ components: [row], embeds: [initial] });
    const filter = (but) => but.user.id === interaction.user.id;

    const collector = m.createMessageComponentCollector({ filter, time: 20000 });

    collector.on('collect', async (b) => {
      if (b.customId === 'heads') {
        if (answer === 'heads') {
          b.update({ components: [rowNew], embeds: [win] });
          balance.bank += Number(houseBet);
          balance.total += Number(houseBet);
          this.client.setBalance.run(balance);
          collector.stop('win');
          return;
        }
        b.update({ components: [rowNew], embeds: [lose] });
        balance.bank -= Number(betAmt);
        balance.total -= Number(betAmt);
        this.client.setBalance.run(balance);
        collector.stop('lose');
        return;
      }
      if (b.customId === 'tails') {
        if (answer === 'tails') {
          b.update({ components: [rowNew], embeds: [win] });
          balance.bank += Number(houseBet);
          balance.total += Number(houseBet);
          this.client.setBalance.run(balance);
          collector.stop('win');
          return;
        }
        b.update({ components: [rowNew], embeds: [lose] });
        balance.bank -= Number(betAmt);
        balance.total -= Number(betAmt);
        this.client.setBalance.run(balance);
        collector.stop('lose');
        return;
      }
      if (b.customId === 'cancel') {
        collector.stop('cancel');
      }
    });
    collector.on('end', (_, reason) => {
      if (reason === 'cancel' || reason === 'time') {
        interaction.deleteReply();
      }
    });
  }
};

export default SlashCommandF;
