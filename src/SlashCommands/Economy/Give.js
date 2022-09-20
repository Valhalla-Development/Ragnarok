import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('give')
  .setDescription('Gives money to specified user from your bank')
  .addUserOption((option) => option.setName('user').setDescription('The user').setRequired(true))
  .addIntegerOption((option) => option.setName('amount').setDescription('Amount to give').setMinValue(10).setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Gives money to specified user from your bank',
      category: 'Economy',
      options: data
    });
  }

  async run(interaction) {
    const user = interaction.options.getMember('user');
    const amt = interaction.options.getInteger('amount');

    const balance = this.client.getBalance.get(`${interaction.user.id}-${interaction.guild.id}`);
    const otherB = this.client.getBalance.get(`${user.id}-${interaction.guild.id}`);

    if (user.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Give**`,
          value: '**◎ Error:** You can not give yourself money. <:wut:745408596233289839>'
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (user.bot) return;

    if (!otherB) {
      const errorE = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Give**`,
          value: `**◎ Error:** ${user} does not have an economy account. They will instantly open one when they speak.`
        });
      interaction.reply({ ephemeral: true, embeds: [errorE] });
      return;
    }

    if (balance.bank === 0) {
      const noBal = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Give**`, value: '**◎ Error:** Uh oh! You currently have no money in your bank!' });
      interaction.reply({ ephemeral: true, embeds: [noBal] });
      return;
    }

    if (amt > balance.bank) {
      const wrongUsage = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Give**`,
          value: `**◎ Error:** You only have <:coin:706659001164628008> \`${balance.bank.toLocaleString(
            'en'
          )}\`. Please try again with a valid amount.`
        });
      interaction.reply({ ephemeral: true, embeds: [wrongUsage] });
      return;
    }

    const numberCov = Number(amt);

    const totaCalc1 = otherB.total + numberCov;

    otherB.bank += numberCov;
    otherB.total = totaCalc1;
    this.client.setUserBalance.run(otherB);

    const totaCalc2 = balance.total - numberCov;

    balance.bank -= numberCov;
    balance.total = totaCalc2;
    this.client.setBalance.run(balance);

    const depArg = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Give**`,
        value: `**◎ Success:** You have paid ${user} the sum of: <:coin:706659001164628008> \`${numberCov.toLocaleString('en')}\`.`
      });
    interaction.reply({ embeds: [depArg] });
  }
};

export default SlashCommandF;
