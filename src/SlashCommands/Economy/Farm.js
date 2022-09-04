import { EmbedBuilder } from 'discord.js';
import ms from 'ms';
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Go Farming',
      category: 'Economy'
    });
  }

  async run(interaction) {
    const balance = this.client.getBalance.get(`${interaction.user.id}-${interaction.guild.id}`);

    let foundItemList;

    if (!balance.items) {
      foundItemList = {};
    } else {
      foundItemList = JSON.parse(balance.items);
    }

    let name;
    let price;

    if (balance.farmcool !== null) {
      if (Date.now() > balance.farmcool) {
        balance.farmcool = null;
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Farm**`,
            value: `**◎ Error:** Please wait another \`${ms(balance.farmcool - new Date().getTime(), { long: true })}\` before using this command.`
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }
    }

    const freeLimit = this.client.ecoPrices.freeFarmLimit;
    let currentTotalFarm = 0;

    if (foundItemList.barley) {
      currentTotalFarm += Number(foundItemList.barley);
    } else {
      currentTotalFarm += Number(0);
    }
    if (foundItemList.spinach) {
      currentTotalFarm += Number(foundItemList.spinach);
    } else {
      currentTotalFarm += Number(0);
    }
    if (foundItemList.strawberries) {
      currentTotalFarm += Number(foundItemList.strawberries);
    } else {
      currentTotalFarm += Number(0);
    }
    if (foundItemList.lettuce) {
      currentTotalFarm += Number(foundItemList.lettuce);
    } else {
      currentTotalFarm += Number(0);
    }

    if (!foundItemList.farmingTools) {
      if (currentTotalFarm >= Number(freeLimit)) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Farm**`,
            value: '**◎ Error:** Your farm bag is full! You can sell your produce with `/shop sell`'
          })
          .setFooter({ text: 'Consider purchasing farming tools to increase your limit.' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }
    }

    let amt;
    const farmChance = Math.random();
    if (farmChance < 0.0018) {
      // 0.18%
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));

      const goldChance = Math.random();
      embed.setFooter({ text: 'Planting crops yields a larger return! check it out with: /plant' });

      if (goldChance < 0.8) {
        // 80% of this happening
        embed.setThumbnail('attachment://GoldNugget.png');

        name = 'Gold Nugget';

        price = this.client.ecoPrices.goldNugget;
        if (foundItemList.goldNugget) {
          amt = Number(foundItemList.goldNugget) + Number(1);
        } else {
          amt = Number(1);
        }
        foundItemList.goldNugget = amt.toString();

        const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

        balance.farmcool = Math.round(endTime);
      }

      this.client.setBalance.run(balance);

      await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
        items: JSON.stringify(foundItemList),
        id: `${interaction.user.id}-${interaction.guild.id}`
      });

      embed.addFields({
        name: `**${this.client.user.username} - Farm**`,
        value: `**◎ Success:** You found a ${name}! You are extremely lucky, there is only a \`0.18%\` of finding this! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString(
          'en'
        )}\`\nYou now have \`${amt}\`.`
      });

      interaction.reply({ embeds: [embed], files: ['./Storage/Images/Economy/GoldNugget.png'] });
    } else if (farmChance >= 0.0018 && farmChance < 0.0318) {
      // 3%
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));

      embed.setFooter({ text: 'Planting crops yields a larger return! check it out with: /plant' });
      embed.setThumbnail('attachment://Barley.png');

      name = 'Barley';

      price = this.client.ecoPrices.barley;
      if (foundItemList.barley) {
        amt = Number(foundItemList.barley) + Number(1);
      } else {
        amt = Number(1);
      }
      foundItemList.barley = amt.toString();

      const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

      balance.farmcool = Math.round(endTime);

      this.client.setBalance.run(balance);

      await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
        items: JSON.stringify(foundItemList),
        id: `${interaction.user.id}-${interaction.guild.id}`
      });

      embed.addFields({
        name: `**${this.client.user.username} - Farm**`,
        value: `**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString(
          'en'
        )}\`\nYou now have \`${amt}\`.`
      });
      interaction.reply({ embeds: [embed], files: ['./Storage/Images/Economy/Barley.png'] });
    } else if (farmChance >= 0.0318 && farmChance < 0.0918) {
      // 6%
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));

      embed.setThumbnail('attachment://Spinach.png');

      embed.setFooter({ text: 'Planting crops yields a larger return! check it out with: /plant' });

      name = 'Spinach';

      price = this.client.ecoPrices.spinach;
      if (foundItemList.spinach) {
        amt = Number(foundItemList.spinach) + Number(1);
      } else {
        amt = Number(1);
      }
      foundItemList.spinach = amt.toString();

      const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

      balance.farmcool = Math.round(endTime);

      this.client.setBalance.run(balance);

      await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
        items: JSON.stringify(foundItemList),
        id: `${interaction.user.id}-${interaction.guild.id}`
      });

      embed.addFields({
        name: `**${this.client.user.username} - Farm**`,
        value: `**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString(
          'en'
        )}\`\nYou now have \`${amt}\`.`
      });
      interaction.reply({ embeds: [embed], files: ['./Storage/Images/Economy/Spinach.png'] });
    } else if (farmChance >= 0.0918 && farmChance < 0.3718) {
      // 28%
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));

      embed.setThumbnail('attachment://Strawberry.png');

      embed.setFooter({ text: 'Planting crops yields a larger return! check it out with: /plant' });

      name = 'Strawberries';

      price = this.client.ecoPrices.strawberries;
      if (foundItemList.strawberries) {
        amt = Number(foundItemList.strawberries) + Number(1);
      } else {
        amt = Number(1);
      }
      foundItemList.strawberries = amt.toString();

      const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

      balance.farmcool = Math.round(endTime);

      this.client.setBalance.run(balance);

      await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
        items: JSON.stringify(foundItemList),
        id: `${interaction.user.id}-${interaction.guild.id}`
      });

      embed.addFields({
        name: `**${this.client.user.username} - Farm**`,
        value: `**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString(
          'en'
        )}\`\nYou now have \`${amt}\`.`
      });
      interaction.reply({ embeds: [embed], files: ['./Storage/Images/Economy/Strawberry.png'] });
    } else if (farmChance >= 0.3718 && farmChance < 0.8718) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));

      embed.setThumbnail('attachment://Lettuce.png');

      embed.setFooter({ text: 'Planting crops yields a larger return! check it out with: /plant' });

      name = 'Lettuce';

      price = this.client.ecoPrices.lettuce;
      if (foundItemList.lettuce) {
        amt = Number(foundItemList.lettuce) + Number(1);
      } else {
        amt = Number(1);
      }
      foundItemList.lettuce = amt.toString();

      const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

      balance.farmcool = Math.round(endTime);

      this.client.setBalance.run(balance);

      await db.prepare('UPDATE balance SET items = (@items) WHERE id = (@id);').run({
        items: JSON.stringify(foundItemList),
        id: `${interaction.user.id}-${interaction.guild.id}`
      });

      embed.addFields({
        name: `**${this.client.user.username} - Farm**`,
        value: `**◎ Success:** You farmed ${name}! It is valued at: <:coin:706659001164628008> \`${price.toLocaleString(
          'en'
        )}\`\nYou now have \`${amt}\`.`
      });
      interaction.reply({ embeds: [embed], files: ['./Storage/Images/Economy/Lettuce.png'] });
    } else {
      // 12.82%
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));

      embed.setFooter({ text: 'Purchase farming tools to never fail farming! - /shop buy tools' });

      const endTime = new Date().getTime() + this.client.ecoPrices.farmFailTime;

      balance.farmcool = Math.round(endTime);

      this.client.setBalance.run(balance);

      embed.addFields({ name: `**${this.client.user.username} - Farm**`, value: '**◎ Fail:** You farmed nothing!' });
      interaction.reply({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
