import { EmbedBuilder } from 'discord.js';
import ms from 'ms';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Go Farming',
      category: 'Economy'
    });
  }

  async run(interaction) {
    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    const foundItemList = balance.Items

    let name;
    let price;

    if (balance.FarmCool !== null) {
      if (Date.now() > balance.FarmCool) {
        balance.FarmCool = null;
      } else {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Farm**`,
            value: `**◎ Error:** Please wait another \`${ms(balance.FarmCool - new Date().getTime(), { long: true })}\` before using this command.`
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }
    }

    const freeLimit = this.client.ecoPrices.freeFarmLimit;
    let currentTotalFarm = 0;

    if (foundItemList.Barley) {
      currentTotalFarm += Number(foundItemList.Barley);
    } else {
      currentTotalFarm += Number(0);
    }
    if (foundItemList.Spinach) {
      currentTotalFarm += Number(foundItemList.Spinach);
    } else {
      currentTotalFarm += Number(0);
    }
    if (foundItemList.Sstrawberries) {
      currentTotalFarm += Number(foundItemList.Sstrawberries);
    } else {
      currentTotalFarm += Number(0);
    }
    if (foundItemList.Lettuce) {
      currentTotalFarm += Number(foundItemList.Lettuce);
    } else {
      currentTotalFarm += Number(0);
    }

    if (!foundItemList.FarmingTools) {
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
        if (foundItemList.GoldNugget) {
          amt = Number(foundItemList.GoldNugget) + Number(1);
        } else {
          amt = Number(1);
        }
        foundItemList.GoldNugget = amt.toString();

        const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

        balance.FarmCool = Math.round(endTime);
      }

      balance.Items = JSON.stringify(foundItemList);
      await balance.save();

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
      if (foundItemList.Barley) {
        amt = Number(foundItemList.Barley) + Number(1);
      } else {
        amt = Number(1);
      }
      foundItemList.Barley = amt.toString();

      const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

      balance.FarmCool = Math.round(endTime);

      balance.Items = JSON.stringify(foundItemList);
      await balance.save();

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
      if (foundItemList.Spinach) {
        amt = Number(foundItemList.Spinach) + Number(1);
      } else {
        amt = Number(1);
      }
      foundItemList.Spinach = amt.toString();

      const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

      balance.FarmCool = Math.round(endTime);

      balance.Items = JSON.stringify(foundItemList);
      await balance.save();

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
      if (foundItemList.Sstrawberries) {
        amt = Number(foundItemList.Sstrawberries) + Number(1);
      } else {
        amt = Number(1);
      }
      foundItemList.Sstrawberries = amt.toString();

      const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

      balance.FarmCool = Math.round(endTime);

      balance.Items = JSON.stringify(foundItemList);
      await balance.save();

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
      if (foundItemList.Lettuce) {
        amt = Number(foundItemList.Lettuce) + Number(1);
      } else {
        amt = Number(1);
      }
      foundItemList.Lettuce = amt.toString();

      const endTime = new Date().getTime() + this.client.ecoPrices.farmWinTime;

      balance.FarmCool = Math.round(endTime);

      balance.Items = JSON.stringify(foundItemList);
      await balance.save();

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

      balance.FarmCool = Math.round(endTime);

      await balance.save();

      embed.addFields({ name: `**${this.client.user.username} - Farm**`, value: '**◎ Fail:** You farmed nothing!' });
      interaction.reply({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
