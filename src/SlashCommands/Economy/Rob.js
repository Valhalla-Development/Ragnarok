import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import ms from 'ms';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

const data = new SlashCommandBuilder()
  .setName('balance')
  .setDescription('Steals money from specified user')
  .addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Steals money from specified user',
      category: 'Economy',
      options: data
    });
  }

  async run(interaction) {
    const user = interaction.options.getMember('user');

    if (user.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Steal**`, value: '**◎ Error:** You can not rob yourself. <:wut:745408596233289839>' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (user.bot) return;

    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });
    const otherB = await Balance.findOne({ IdJoined: `${user.id}-${interaction.guild.id}` });

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

    if (Date.now() > balance.StealCool) {
      balance.StealCool = null;

      if (otherB.Cash < 10) {
        const wrongUsage = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Steal**`,
            value: '**◎ Error:** The targeted user does not have enough Cash to steal!'
          });
        interaction.reply({ ephemeral: true, embeds: [wrongUsage] });
        return;
      }

      let maxPerc;
      let minPerc;
      let totalCalc;
      let calc;
      let totalCalc2;
      let calc2;
      let stealAmount;

      const stealChance = Math.random(); // give you a random number between 0 and 1
      if (stealChance < 0.75) {
        // there’s a 75% chance of this happening
        maxPerc = (otherB.Cash / 100) * 85;
        minPerc = (otherB.Cash / 100) * 35;

        stealAmount = Math.floor(Math.random() * (maxPerc - minPerc + 1) + minPerc); // * (max - min + 1) + min);

        totalCalc = otherB.Total - stealAmount;
        calc = otherB.Cash - stealAmount;
        totalCalc2 = balance.Total + stealAmount;
        calc2 = balance.Cash + stealAmount;

        otherB.Cash = calc;
        otherB.Total = totalCalc;
        await otherB.save();

        const endTime = new Date().getTime() + 120000;

        balance.StealCool = endTime;
        balance.Cash = calc2;
        balance.Total = totalCalc2;
        await balance.save();

        const succMessage = [
          // 30
          `You held ${user} at gun-point and stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
          `You stabbed ${user} and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from their wallet.`,
          `You hired someone to mug ${user}, you received <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
          `${user} said they watch anime, you kicked them in the face and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
          `You snuck up on ${user} and pick-pocketed <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
          `*slaps ${user} with a large trout*, they dropped <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
          `You tricked ${user} into giving you <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
          `You petrified ${user}, they ran away and dropped <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
          `You went to ${user}'s house and stole his college fund worth <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
          `You noticed ${user} was drunk so you stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from them.`,
          `${user} tried to mug you, but you had an uno reverse card. You stole <:coin:706659001164628008> \`${stealAmount.toLocaleString(
            'en'
          )}\` from them.`,
          `You successfully snuck into ${user}'s vault and made off with <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}.`,
          `You and your crew pulled off a daring heist, robbing ${user}'s safe and getting away with <:coin:706659001164628008> ${stealAmount.toLocaleString(
            'en'
          )}.`,
          `You hacked into ${user}'s accounts and transferred <:coin:706659001164628008> ${stealAmount.toLocaleString('en')} into your own account.`,
          `You disguised yourself as a delivery person and stole <:coin:706659001164628008> ${stealAmount.toLocaleString(
            'en'
          )} from ${user}'s company's safe.`,
          `You masterminded a successful con, tricking ${user} into giving up <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}.`,
          `You pulled off a high-stakes heist, successfully stealing <:coin:706659001164628008> ${stealAmount.toLocaleString(
            'en'
          )} from ${user}'s casino.`,
          `You led your team of thieves to success, making off with <:coin:706659001164628008> ${stealAmount.toLocaleString(
            'en'
          )} from ${user}'s mansion.`,
          `You infiltrated ${user}'s organization and made off with a cool <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}`,
          `You pulled off the perfect heist, stealing <:coin:706659001164628008> ${stealAmount.toLocaleString(
            'en'
          )} from ${user}'s high-security vault.`,
          `You disguised yourself as a janitor and stole <:coin:706659001164628008> ${stealAmount.toLocaleString('en')} from ${user}'s office.`,
          `You used your charm and wit to swindle <:coin:706659001164628008> ${stealAmount.toLocaleString('en')} from ${user}.`,
          `You robbed ${user}'s armored car and made off with <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}`,
          `You successfully pulled off a cyber heist, stealing <:coin:706659001164628008> ${stealAmount.toLocaleString(
            'en'
          )} from ${user}'s online accounts.`,
          `You and your team executed a flawless heist, stealing <:coin:706659001164628008> ${stealAmount.toLocaleString(
            'en'
          )} from ${user}'s high-end jewelry store.`,
          `You posed as a wealthy investor and swindled <:coin:706659001164628008> ${stealAmount.toLocaleString('en')} from ${user}.`,
          `You robbed ${user}'s train and made off with <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}`,
          `You successfully hacked ${user}'s accounts and transferred <:coin:706659001164628008> ${stealAmount.toLocaleString(
            'en'
          )} to your own accounts.`,
          `You pulled off a daring heist and made off with <:coin:706659001164628008> ${stealAmount.toLocaleString('en')} from ${user}'s Bank.`,
          `You outsmarted ${user} and stole <:coin:706659001164628016> ${stealAmount.toLocaleString('en')}`
        ];

        const depArg = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Steal**`,
            value: `**◎ Success:** ${succMessage[Math.floor(Math.random() * succMessage.length)]}`
          });
        interaction.reply({ embeds: [depArg] });
      } else {
        maxPerc = (balance.Bank / 100) * 0.1;
        minPerc = (balance.Bank / 100) * 0.05;

        stealAmount = Math.floor(Math.random() * (maxPerc - minPerc + 1) + minPerc); // * (max - min + 1) + min);

        totalCalc = otherB.Total + stealAmount;
        calc = otherB.Bank + stealAmount;
        totalCalc2 = balance.Total - stealAmount;
        calc2 = balance.Bank - stealAmount;

        otherB.Bank = calc;
        otherB.Total = totalCalc;
        await otherB.save();

        const endTime = new Date().getTime() + 240000;

        balance.StealCool = endTime;
        balance.Bank = calc2;
        balance.Total = totalCalc2;
        await balance.save();

        const failMessage = [
          // 13
          `You tried to mug ${user} but they over-powered you${
            stealAmount > 1 ? ` and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : '.'
          }`,
          `You held ${user} at knife point but they knew Karate${
            stealAmount > 1 ? ` and stole your lunch money <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : '.'
          }`,
          `You challenged ${user} to a 1v1 and lost${stealAmount > 1 ? ` <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.` : '.'}`,
          `You hired someone to mug ${user}${
            stealAmount > 1
              ? ` but they mugged you instead and took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`
              : ` ${user} fought him off.`
          }`,
          `You tried to stab ${user}, but they said 'no u'${
            stealAmount > 1
              ? ` and you stabbed yourself. You lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`
              : ' and walked away.'
          }`,
          `You tried to steal from ${user} but they caught you${
            stealAmount > 1
              ? ` and they took <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from you.`
              : ', they simply said \'pathetic\' and walked away.'
          }`,
          `You asked ${user} for financial advice and lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
          `${user} had a gun and you did not... They stole <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\` from you.`,
          `You tried to mug ${user} but they were too drunk to fight back. They stole <:coin:706659001164628008> \`${stealAmount.toLocaleString(
            'en'
          )}\`.`,
          `You tried to mug ${user} but they shot you. You lost <:coin:706659001164628008> \`${stealAmount.toLocaleString('en')}\`.`,
          `${user} was drunk and you tried to mug them. You stabbed yourself and lost <:coin:706659001164628008> \`${stealAmount.toLocaleString(
            'en'
          )}\`.`,
          `You tried to mug ${user} but they were too drunk to fight back. You tried to stab them, but they said 'no u' and you stabbed yourself. You lost <:coin:706659001164628008> \`${stealAmount.toLocaleString(
            'en'
          )}\`.`,
          `${user} was a ninja and you tried to steal from them. They threw you out the window and stole <:coin:706659001164628008> \`${stealAmount.toLocaleString(
            'en'
          )}\`.`
        ];

        const depArg = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Steal**`,
            value: `**◎ Fail:** ${failMessage[Math.floor(Math.random() * failMessage.length)]}`
          });
        interaction.reply({ embeds: [depArg] });
      }
    } else {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Steal**`,
          value: `**◎ Error:** Please wait \`${ms(balance.StealCool - new Date().getTime(), { long: true })}\`, before using this command again!`
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    }
  }
};

export default SlashCommandF;
