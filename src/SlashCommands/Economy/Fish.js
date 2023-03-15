import { EmbedBuilder } from 'discord.js';
import ms from 'ms';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Go Fishing',
      category: 'Economy'
    });
  }

  async run(interaction) {
    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    if (!balance.Items.FishingRod) {
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

    if (Date.now() > balance.FishCool) {
      balance.FishCool = null;

      let fishPrice;
      let amt;
      const fishChance = Math.random();
      if (fishChance < 0.0018) {
        // 0.18%
        fishPrice = this.client.ecoPrices.treasure;

        const endTime = new Date().getTime() + this.client.ecoPrices.fishWinTime;

        balance.FishCool = Math.round(endTime);

        if (balance.Items.Treasure) {
          amt = Number(balance.Items.Treasure) + Number(1);
        } else {
          amt = Number(1);
        }
        balance.Items.Treasure = amt.toString();

        balance.Items = JSON.stringify(balance.Items);
        await balance.save();

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

        balance.FishCool = Math.round(endTime);

        if (balance.Items.PufferFish) {
          amt = Number(balance.Items.PufferFish) + Number(1);
        } else {
          amt = Number(1);
        }
        balance.Items.PufferFish = amt.toString();

        balance.Items = JSON.stringify(balance.Items);
        await balance.save();

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

        balance.FishCool = Math.round(endTime);

        if (balance.Items.SwordFish) {
          amt = Number(balance.Items.SwordFish) + Number(1);
        } else {
          amt = Number(1);
        }
        balance.Items.SwordFish = amt.toString();

        balance.Items = JSON.stringify(balance.Items);
        await balance.save();

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

        balance.FishCool = Math.round(endTime);

        if (balance.Items.KingSalmon) {
          amt = Number(balance.Items.KingSalmon) + Number(1);
        } else {
          amt = Number(1);
        }
        balance.Items.KingSalmon = amt.toString();

        balance.Items = JSON.stringify(balance.Items);
        await balance.save();

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

        balance.FishCool = Math.round(endTime);

        if (balance.Items.Trout) {
          amt = Number(balance.Items.Trout) + Number(1);
        } else {
          amt = Number(1);
        }
        balance.Items.Trout = amt.toString();

        balance.Items = JSON.stringify(balance.Items);
        await balance.save();

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

        balance.FishCool = Math.round(endTime);

        await balance.save();

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
          value: `**◎ Error:** Please wait another \`${ms(balance.FishCool - new Date().getTime(), { long: true })}\` before using this command.`
        });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    }
  }
};

export default SlashCommandF;
