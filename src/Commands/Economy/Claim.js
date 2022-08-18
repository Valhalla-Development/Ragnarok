import { EmbedBuilder } from 'discord.js';
import ms from 'ms';
import SQLite from 'better-sqlite3';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['rewards', 'claimable', 'reward', 'collect', 'c'],
      description: 'Displays available rewards',
      category: 'Economy'
    });
  }

  async run(message, args) {
    const balance = await this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

    const date = new Date();

    if (balance.claimNewUser) {
      if (Date.now() > balance.claimNewUser) {
        balance.claimNewUser = null;
      } else {
        const endTime = balance.claimNewUser;
        const nowInSecond = Math.round(endTime / 1000);

        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Claim**`,
            value: `**◎ Error:** Your Economy proifle is too new! Please wait another <t:${nowInSecond}:R> before using this command.`
          });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
    }

    if (balance.hourly) {
      if (Date.now() > balance.hourly) {
        balance.hourly = null;
      }
    }

    if (balance.daily) {
      if (Date.now() > balance.daily) {
        balance.daily = null;
      }
    }

    if (balance.weekly) {
      if (Date.now() > balance.weekly) {
        balance.weekly = null;
      }
    }

    if (balance.monthly) {
      if (Date.now() > balance.monthly) {
        balance.monthly = null;
      }
    }

    if (!args.length) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Claim**`,
        value: `**◎ Hourly:** \`${Date.now() > balance.hourly ? 'Available!' : ms(balance.hourly - date.getTime(), { long: true })}\`
				**◎ Daily:** \`${Date.now() > balance.daily ? 'Available!' : ms(balance.daily - date.getTime(), { long: true })}\`
				**◎ Weekly:** \`${Date.now() > balance.weekly ? 'Available!' : ms(balance.weekly - date.getTime(), { long: true })}\`
				**◎ Monthly:** \`${Date.now() > balance.monthly ? 'Available!' : ms(balance.monthly - date.getTime(), { long: true })}\``
      });
      message.channel.send({ embeds: [embed] });
      return;
    }

    if (args[0] === 'all') {
      if (Date.now() < balance.hourly && Date.now() < balance.daily && Date.now() < balance.weekly && Date.now() < balance.monthly) {
        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Claim - All**`, value: '**◎ Error:** You have nothing to claim!' });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }

      let fullPrice = 0;

      if (!balance.hourly)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.hourlyClaimMax - this.client.ecoPrices.hourlyClaimMin + 1) +
          this.client.ecoPrices.hourlyClaimMin;
      if (!balance.daily)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.dailyClaimMax - this.client.ecoPrices.dailyClaimMin + 1) +
          this.client.ecoPrices.dailyClaimMin;
      if (!balance.weekly)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.weeklyClaimMax - this.client.ecoPrices.weeklyClaimMin + 1) +
          this.client.ecoPrices.weeklyClaimMin;
      if (!balance.monthly)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.monthlyClaimMax - this.client.ecoPrices.monthlyClaimMin + 1) +
          this.client.ecoPrices.monthlyClaimMin;

      const endTime = new Date().getTime();

      balance.hourly = !balance.hourly ? endTime + 3600000 : balance.hourly;
      balance.daily = !balance.daily ? endTime + 86400000 : balance.daily;
      balance.weekly = !balance.weekly ? endTime + 604800000 : balance.weekly;
      balance.monthly = !balance.monthly ? endTime + 2629800000 : balance.monthly;
      balance.bank += fullPrice;
      balance.total += fullPrice;

      this.client.setBalance.run(balance);

      const newTot = balance.total + fullPrice;

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Claim - All**`,
          value: `**◎ Success:** You have claimed all available claims! <:coin:706659001164628008> \`${fullPrice.toLocaleString(
            'en'
          )}\` has been credited to your bank.\n Your new total is <:coin:706659001164628008> \`${newTot.toLocaleString('en')}\``
        });
      message.channel.send({ embeds: [embed] });
      return;
    }

    if (args[0] === 'hourly') {
      if (Date.now() > balance.hourly) {
        await db.prepare('UPDATE balance SET hourly = (@hourly) WHERE id = (@id);').run({
          hourly: null,
          id: `${message.author.id}-${message.guild.id}`
        });

        const hourlyAmount =
          Math.floor(Math.random() * this.client.ecoPrices.hourlyClaimMax - this.client.ecoPrices.hourlyClaimMin + 1) +
          this.client.ecoPrices.hourlyClaimMin;

        const endTime = new Date().getTime() + 3600000;

        const totaCalc2 = balance.total + hourlyAmount;

        balance.hourly = endTime;
        balance.cash += hourlyAmount;
        balance.total = totaCalc2;
        this.client.setBalance.run(balance);

        const depArg = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Hourly**`,
            value: `**◎ Success:** You have received your hourly sum of: <:coin:706659001164628008> \`${hourlyAmount.toLocaleString('en')}\`.`
          });
        message.channel.send({ embeds: [depArg] });
        return;
      }

      if (balance.hourly !== null) {
        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Hourly**`,
            value: `**◎ Error:** Please wait another \`${ms(balance.hourly - date.getTime(), { long: true })}\` before using this command.`
          });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
    }

    if (args[0] === 'daily') {
      if (Date.now() > balance.daily) {
        await db.prepare('UPDATE balance SET daily = (@daily) WHERE id = (@id);').run({
          daily: null,
          id: `${message.author.id}-${message.guild.id}`
        });

        const dailyAmount =
          Math.floor(Math.random() * this.client.ecoPrices.dailyClaimMax - this.client.ecoPrices.dailyClaimMin + 1) +
          this.client.ecoPrices.dailyClaimMin;

        const endTime = new Date().getTime() + 86400000;

        const totaCalc2 = balance.total + dailyAmount;

        balance.daily = endTime;
        balance.cash += dailyAmount;
        balance.total = totaCalc2;
        this.client.setBalance.run(balance);

        const depArg = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Daily**`,
            value: `**◎ Success:** You have received your daily sum of: <:coin:706659001164628008> \`${dailyAmount.toLocaleString('en')}\`.`
          });
        message.channel.send({ embeds: [depArg] });
        return;
      }

      if (balance.daily !== null) {
        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Daily**`,
            value: `**◎ Error:** Please wait another \`${ms(balance.daily - date.getTime(), { long: true })}\` before using this command.`
          });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
    }

    if (args[0] === 'weekly') {
      if (Date.now() > balance.weekly) {
        await db.prepare('UPDATE balance SET weekly = (@weekly) WHERE id = (@id);').run({
          weekly: null,
          id: `${message.author.id}-${message.guild.id}`
        });

        const weeklyAmount =
          Math.floor(Math.random() * this.client.ecoPrices.weeklyClaimMax - this.client.ecoPrices.weeklyClaimMin + 1) +
          this.client.ecoPrices.weeklyClaimMin;

        const endTime = new Date().getTime() + 604800000;

        const totaCalc2 = balance.total + weeklyAmount;

        balance.weekly = endTime;
        balance.cash += weeklyAmount;
        balance.total = totaCalc2;
        this.client.setBalance.run(balance);

        const depArg = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Weeky**`,
            value: `**◎ Success:** You have received your weekly sum of: <:coin:706659001164628008> \`${weeklyAmount.toLocaleString('en')}\`.`
          });
        message.channel.send({ embeds: [depArg] });
        return;
      }

      if (balance.weekly !== null) {
        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Weekly**`,
            value: `**◎ Error:** Please wait another \`${
              Date.now() > balance.weekly ? 'Available!' : ms(balance.weekly - date.getTime(), { long: true })
            }\` before using this command.`
          });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
    }

    if (args[0] === 'monthly') {
      if (Date.now() > balance.monthly) {
        await db.prepare('UPDATE balance SET monthly = (@monthly) WHERE id = (@id);').run({
          monthly: null,
          id: `${message.author.id}-${message.guild.id}`
        });

        const monthlyAmount =
          Math.floor(Math.random() * this.client.ecoPrices.monthlyClaimMax - this.client.ecoPrices.monthlyClaimMin + 1) +
          this.client.ecoPrices.monthlyClaimMin;

        const endTime = new Date().getTime() + 2629800000;

        const totaCalc2 = balance.total + monthlyAmount;

        balance.monthly = endTime;
        balance.cash += monthlyAmount;
        balance.total = totaCalc2;
        this.client.setBalance.run(balance);

        const depArg = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Monthly**`,
            value: `**◎ Success:** You have received your monthly sum of: <:coin:706659001164628008> \`${monthlyAmount.toLocaleString('en')}\`.`
          });
        message.channel.send({ embeds: [depArg] });
        return;
      }

      if (balance.monthly !== null) {
        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Monthly**`,
            value: `**◎ Error:** Please wait another \`${
              Date.now() > balance.monthly ? 'Available!' : ms(balance.monthly - date.getTime(), { long: true })
            }\` before using this command.`
          });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      }
    }
  }
};

export default CommandF;
