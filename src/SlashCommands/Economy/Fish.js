import { EmbedBuilder } from 'discord.js';
import ms from 'ms';
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Go Fishing',
      category: 'Economy'
    });
  }

  async run(interaction) {
    const balance = this.client.getBalance.get(`${interaction.user.id}-${interaction.guild.id}`);

    if (!balance.items) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Fish**`,
          value: '**◎ Error:** You do not have a fishing rod! You must buy one from the shop.'
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const foundItemList = JSON.parse(balance.items);

    if (!foundItemList.fishingRod) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Fish**`,
          value: '**◎ Error:** You do not have a fishing rod! You must buy one from the shop.'
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (Date.now() > balance.fishcool) {
      balance.fishcool = null;

      let fishPrice;
      let amt;
      const fishChance = Math.random();
      if (fishChance < 0.0018) {
        // 0.18%
        fishPrice = this.client.ecoPrices.treasure;

        const endTime = new Date().getTime() + this.client.ecoPrices.fishWinTime;

        balance.fishcool = Math.round(endTime);

        this.client.setBalance.run(balance);

        if (foundItemList.treasure) {
          amt = Number(foundItemList.treasure) + Number(1);
        } else {
          amt = Number(1);
        }
        foundItemList.treasure = amt.toString();

        await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
          items: JSON.stringify(foundItemList),
          id: `${interaction.user.id}-${interaction.guild.id}`
        });

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://Treasure.png')
          .addFields({
            name: `**${this.client.user.username} - Fish**`,
            value: `**◎ Success:** You found hidden treasure! You are extremely lucky, there is only a \`0.18%\` of finding this! It is valued at: <:coin:706659001164628008> \`${fishPrice.toLocaleString(
              'en'
            )}\`\nYou now have \`${amt}\`.`
          });
        interaction.reply({ embeds: [embed], files: ['./Storage/Images/Economy/Treasure.png'] });
      } else if (fishChance >= 0.0018 && fishChance < 0.0318) {
        // 3%
        fishPrice = this.client.ecoPrices.pufferfish;

        const endTime = new Date().getTime() + this.client.ecoPrices.fishWinTime;

        balance.fishcool = Math.round(endTime);

        this.client.setBalance.run(balance);

        if (foundItemList.pufferfish) {
          amt = Number(foundItemList.pufferfish) + Number(1);
        } else {
          amt = Number(1);
        }
        foundItemList.pufferfish = amt.toString();

        await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
          items: JSON.stringify(foundItemList),
          id: `${interaction.user.id}-${interaction.guild.id}`
        });

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://Pufferfish.png')
          .addFields({
            name: `**${this.client.user.username} - Fish**`,
            value: `**◎ Success:** You caught a Pufferfish! It is valued at: <:coin:706659001164628008> \`${fishPrice.toLocaleString(
              'en'
            )}\`\nYou now have \`${amt}\`.`
          });
        interaction.reply({ embeds: [embed], files: ['./Storage/Images/Economy/Pufferfish.png'] });
      } else if (fishChance >= 0.0318 && fishChance < 0.0918) {
        // 6%
        fishPrice = this.client.ecoPrices.swordfish;

        const endTime = new Date().getTime() + this.client.ecoPrices.fishWinTime;

        balance.fishcool = Math.round(endTime);

        this.client.setBalance.run(balance);

        if (foundItemList.swordfish) {
          amt = Number(foundItemList.swordfish) + Number(1);
        } else {
          amt = Number(1);
        }
        foundItemList.swordfish = amt.toString();

        await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
          items: JSON.stringify(foundItemList),
          id: `${interaction.user.id}-${interaction.guild.id}`
        });

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://Swordfish.png')
          .addFields({
            name: `**${this.client.user.username} - Fish**`,
            value: `**◎ Success:** You caught a Swordfish! It is valued at: <:coin:706659001164628008> \`${fishPrice.toLocaleString(
              'en'
            )}\`\nYou now have \`${amt}\`.`
          });
        interaction.reply({ embeds: [embed], files: ['./Storage/Images/Economy/Swordfish.png'] });
      } else if (fishChance >= 0.0918 && fishChance < 0.3718) {
        // 28%
        fishPrice = this.client.ecoPrices.kingSalmon;

        const endTime = new Date().getTime() + this.client.ecoPrices.fishWinTime;

        balance.fishcool = Math.round(endTime);

        this.client.setBalance.run(balance);

        if (foundItemList.kingSalmon) {
          amt = Number(foundItemList.kingSalmon) + Number(1);
        } else {
          amt = Number(1);
        }
        foundItemList.kingSalmon = amt.toString();

        await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
          items: JSON.stringify(foundItemList),
          id: `${interaction.user.id}-${interaction.guild.id}`
        });

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://KingSalmon.png')
          .addFields({
            name: `**${this.client.user.username} - Fish**`,
            value: `**◎ Success:** You caught a King Salmon! It is valued at: <:coin:706659001164628008> \`${fishPrice.toLocaleString(
              'en'
            )}\`\nYou now have \`${amt}\`.`
          });
        interaction.reply({ embeds: [embed], files: ['./Storage/Images/Economy/KingSalmon.png'] });
      } else if (fishChance >= 0.3718 && fishChance < 0.8718) {
        // 50%
        fishPrice = this.client.ecoPrices.trout;

        const endTime = new Date().getTime() + this.client.ecoPrices.fishWinTime;

        balance.fishcool = Math.round(endTime);

        this.client.setBalance.run(balance);

        if (foundItemList.trout) {
          amt = Number(foundItemList.trout) + Number(1);
        } else {
          amt = Number(1);
        }
        foundItemList.trout = amt.toString();

        await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
          items: JSON.stringify(foundItemList),
          id: `${interaction.user.id}-${interaction.guild.id}`
        });

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://Trout.png')
          .addFields({
            name: `**${this.client.user.username} - Fish**`,
            value: `**◎ Success:** You caught a Trout! It is valued at: <:coin:706659001164628008> \`${fishPrice.toLocaleString(
              'en'
            )}\`\nYou now have \`${amt}\`.`
          });
        interaction.reply({ embeds: [embed], files: ['./Storage/Images/Economy/Trout.png'] });
      } else {
        // 12.82&
        const endTime = new Date().getTime() + this.client.ecoPrices.fishFailtime;

        balance.fishcool = Math.round(endTime);

        this.client.setBalance.run(balance);

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Fish**`, value: '**◎ Fail:** Your catch escaped the line!' });
        interaction.reply({ embeds: [embed] });
      }
    } else {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Fish**`,
          value: `**◎ Error:** Please wait another \`${ms(balance.fishcool - new Date().getTime(), { long: true })}\` before using this command.`
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    }
  }
};

export default SlashCommandF;
