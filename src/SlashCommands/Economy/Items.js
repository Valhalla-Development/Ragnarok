import { EmbedBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'View your inventory',
      category: 'Economy'
    });
  }

  async run(interaction) {
    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    if (!balance.Items) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Items**`, value: '**◎ Error:** You do not have any Items.' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    let foundHarvestList;

    if (balance.HarvestedCrops.length) {
      foundHarvestList = JSON.parse(balance.HarvestedCrops);
    } else {
      foundHarvestList = [];
    }

    const fishingPrice = this.client.ecoPrices.fishingRod;
    const farmingPrice = this.client.ecoPrices.farmingTools;

    const troutPrice = this.client.ecoPrices.trout * Number(balance.Items.Trout);
    const salmonPrice = this.client.ecoPrices.kingSalmon * Number(balance.Items.KingSalmon);
    const swordFishPrice = this.client.ecoPrices.swordfish * Number(balance.Items.SwordFish);
    const pufferFishPrice = this.client.ecoPrices.pufferfish * Number(balance.Items.PufferFish);
    const treasurePrice = this.client.ecoPrices.treasure * Number(balance.Items.Treasure);

    const goldBarPrice=this.client.ecoPrices.goldBar * Number(balance.Items.GoldBar);
    let cornPrice = 0;
    let wheatPrice = 0;
    let potatoesPrice = 0;
    let tomatoesPrice = 0;
    const goldNuggetPrice = this.client.ecoPrices.goldNugget * Number(balance.Items.GoldNugget);
    const barleyPrice = this.client.ecoPrices.barley * Number(balance.Items.Barley);
    const spinachPrice = this.client.ecoPrices.spinach * Number(balance.Items.Spinach);
    const strawberriesPrice = this.client.ecoPrices.strawberries * Number(balance.Items.Strawberries);
    const lettucePrice = this.client.ecoPrices.lettuce * Number(balance.Items.Lettuce);

    foundHarvestList?.forEach((obj) => {
      if (obj.CropType === 'corn') cornPrice += Math.floor(this.client.ecoPrices.corn * (1 - obj.Decay.toFixed(4) / 100));
      if (obj.CropType === 'wheat') wheatPrice += Math.floor(this.client.ecoPrices.wheat * (1 - obj.Decay.toFixed(4) / 100));
      if (obj.CropType === 'potato') potatoesPrice += Math.floor(this.client.ecoPrices.potatoes * (1 - obj.Decay.toFixed(4) / 100));
      if (obj.CropType === 'tomato') tomatoesPrice += Math.floor(this.client.ecoPrices.tomatoes * (1 - obj.Decay.toFixed(4) / 100));
    });
    
    let fullPrice = 0;
    if (balance.Items.Trout) fullPrice += Number(balance.Items.Trout) * this.client.ecoPrices.trout;
    if (balance.Items.KingSalmon) fullPrice += Number(balance.Items.KingSalmon) * this.client.ecoPrices.kingSalmon;
    if (balance.Items.SwordFish) fullPrice += Number(balance.Items.SwordFish) * this.client.ecoPrices.swordfish;
    if (balance.Items.PufferFish) fullPrice += Number(balance.Items.PufferFish) * this.client.ecoPrices.pufferfish;
    if (balance.Items.Treasure) fullPrice += Number(balance.Items.Treasure) * this.client.ecoPrices.treasure;

    if (balance.Items.GoldBar) fullPrice += Number(balance.Items.GoldBar) * this.client.ecoPrices.goldBar;
    if (foundHarvestList) {
      fullPrice += Number(foundHarvestList.filter((key) => key.CropType === 'corn').length) * this.client.ecoPrices.corn;
      fullPrice += Number(foundHarvestList.filter((key) => key.CropType === 'wheat').length) * this.client.ecoPrices.wheat;
      fullPrice += Number(foundHarvestList.filter((key) => key.CropType === 'potato').length) * this.client.ecoPrices.potatoes;
      fullPrice += Number(foundHarvestList.filter((key) => key.CropType === 'tomato').length) * this.client.ecoPrices.tomatoes;
    }
    if (balance.Items.GoldNugget) fullPrice += Number(balance.Items.GoldNugget) * this.client.ecoPrices.goldNugget;
    if (balance.Items.Barley) fullPrice += Number(balance.Items.Barley) * this.client.ecoPrices.barley;
    if (balance.Items.Spinach) fullPrice += Number(balance.Items.Spinach) * this.client.ecoPrices.spinach;
    if (balance.Items.Strawberries) fullPrice += Number(balance.Items.Strawberries) * this.client.ecoPrices.strawberries;
    if (balance.Items.Lettuce) fullPrice += Number(balance.Items.Lettuce) * this.client.ecoPrices.lettuce;

    let currentTotalSeeds = 0;

    if (balance.Items.CornSeeds) {
      currentTotalSeeds += Number(balance.Items.CornSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (balance.Items.WheatSeeds) {
      currentTotalSeeds += Number(balance.Items.WheatSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (balance.Items.PotatoSeeds) {
      currentTotalSeeds += Number(balance.Items.PotatoSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (balance.Items.TomatoSeeds) {
      currentTotalSeeds += Number(balance.Items.TomatoSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }

    let currentTotalFish = 0;

    if (balance.Items.Trout) {
      currentTotalFish += Number(balance.Items.Trout);
    } else {
      currentTotalFish += Number(0);
    }
    if (balance.Items.KingSalmon) {
      currentTotalFish += Number(balance.Items.KingSalmon);
    } else {
      currentTotalFish += Number(0);
    }
    if (balance.Items.SwordFish) {
      currentTotalFish += Number(balance.Items.SwordFish);
    } else {
      currentTotalFish += Number(0);
    }
    if (balance.Items.PufferFish) {
      currentTotalFish += Number(balance.Items.PufferFish);
    } else {
      currentTotalFish += Number(0);
    }

    let currentTotalFarm = 0;

    if (foundHarvestList) {
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.CropType === 'corn').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.CropType === 'wheat').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.CropType === 'potato').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.CropType === 'tomato').length);
    }

    /*
      * The following should go in the embed but it makes it too long, when you read this during the rewrite
      * Possibly pagination or only show items you own:

             `\u3000 Barley: Own ${
           balance.Items.Barley === undefined
               ? '`0`'
               : `\`${balance.Items.Barley}\` - <:coin:706659001164628008> \`${barleyPrice.toLocaleString('en')}\``
       }`,
       `\u3000 Spinach: Own ${
           balance.Items.Spinach === undefined
               ? '`0`'
               : `\`${balance.Items.Spinach}\` - <:coin:706659001164628008> \`${spinachPrice.toLocaleString('en')}\``
       }`,
       `\u3000 Strawberries: Own ${
           balance.Items.Strawberries === undefined
               ? '`0`'
               : `\`${balance.Items.Strawberries} \`- <:coin:706659001164628008> \`${strawberriesPrice.toLocaleString('en')}\``
       }`,
       `\u3000 Lettuce: Own ${
           balance.Items.Lettuce === undefined
               ? '`0`'
               : `\`${balance.Items.Lettuce}\` - <:coin:706659001164628008> \`${lettucePrice.toLocaleString('en')}\``
       }`,
    */
    const fields = [
        '**◎ Crops:** (The value of your crops will go down over time, sell them!)',
         `\u3000 Corn: Own ${
          !foundHarvestList.filter((key) => key.CropType === 'corn').length
            ? '`0`'
            : `\`${foundHarvestList.filter((key) => key.CropType === 'corn').length}\` - <:coin:706659001164628008> \`${cornPrice.toLocaleString(
                'en'
              )}\``
        }`,
        `\u3000 Wheat: Own ${
          !foundHarvestList.filter((key) => key.CropType === 'wheat').length
            ? '`0`'
            : `\`${foundHarvestList.filter((key) => key.CropType === 'wheat').length}\` - <:coin:706659001164628008> \`${wheatPrice.toLocaleString(
                'en'
              )}\``
        }`,
        `\u3000 Potatoes: Own ${
          !foundHarvestList.filter((key) => key.CropType === 'potato').length
            ? '`0`'
            : `\`${
                foundHarvestList.filter((key) => key.CropType === 'potato').length
              }\` - <:coin:706659001164628008> \`${potatoesPrice.toLocaleString('en')}\``
        }`,
        `\u3000 Tomatoes: Own ${
          !foundHarvestList.filter((key) => key.CropType === 'tomato').length
            ? '`0`'
            : `\`${
                foundHarvestList.filter((key) => key.CropType === 'tomato').length
              }\` - <:coin:706659001164628008> \`${tomatoesPrice.toLocaleString('en')}\``
        }`,
       '\u200b',
        '**◎ Seeds:**',
        `\u3000 Corn: Own ${balance.Items.CornSeeds === undefined ? '`0`' : `\`${balance.Items.CornSeeds}\``}`,
        `\u3000 Wheat: Own ${balance.Items.WheatSeeds === undefined ? '`0`' : `\`${balance.Items.WheatSeeds}\``}`,
        `\u3000 Potatoes: Own ${balance.Items.PotatoSeeds === undefined ? '`0`' : `\`${balance.Items.PotatoSeeds}\``}`,
        `\u3000 Tomatoes: Own ${balance.Items.TomatoSeeds === undefined ? '`0`' : `\`${balance.Items.TomatoSeeds}\``}`
      ];

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Items**`,
        value: `**◎ Fish:**
				\u3000 Trout: Own ${
          balance.Items.Trout === undefined ? '`0`' : `\`${balance.Items.Trout}\` - <:coin:706659001164628008> \`${troutPrice.toLocaleString('en')}\``
        }
				\u3000 King Salmon: Own ${
          balance.Items.KingSalmon === undefined
            ? '`0`'
            : `\`${balance.Items.KingSalmon}\` - <:coin:706659001164628008> \`${salmonPrice.toLocaleString('en')}\``
        }
				\u3000 Swordfish: Own ${
          balance.Items.SwordFish === undefined
            ? '`0`'
            : `\`${balance.Items.SwordFish} \`- <:coin:706659001164628008> \`${swordFishPrice.toLocaleString('en')}\``
        }
				\u3000 Pufferfish: Own ${
          balance.Items.PufferFish === undefined
            ? '`0`'
            : `\`${balance.Items.PufferFish}\` - <:coin:706659001164628008> \`${pufferFishPrice.toLocaleString('en')}\``
        }
				\u200b
				${fields.join('\n')}
				\u200b
				**◎ Treasure:**
				\u3000 Treasure Chest: Own ${
          balance.Items.Treasure === undefined
            ? '`0`'
            : `\`${balance.Items.Treasure}\` - <:coin:706659001164628008> \`${treasurePrice.toLocaleString('en')}\``
        }
				\u3000 Gold Bar: Own ${
          balance.Items.GoldBar === undefined
            ? '`0`'
            : `\`${balance.Items.GoldBar}\` - <:coin:706659001164628008> \`${goldBarPrice.toLocaleString('en')}\``
        }
				\u3000 Gold Nugget: Own ${
          balance.Items.GoldNugget === undefined
            ? '`0`'
            : `\`${balance.Items.GoldNugget}\` - <:coin:706659001164628008> \`${goldNuggetPrice.toLocaleString('en')}\``
        }
				\u200b
				**◎ Permanent Items:**
				\u3000 ${
          !balance.Items.FishingRod
            ? `\`/shop buy rod\` - <:coin:706659001164628008> \`${fishingPrice.toLocaleString('en')}\``
            : 'Fishing Rod - `Owned`'
        }
				\u3000 Fish Bag - ${
          !balance.Boosts.FishBag
            ? '`Not Owned` - Buy fishing rod to aquire'
            : `\`Owned\` - Current capacity: \`${Number(currentTotalFish)}\`/\`${balance.Boosts.FishBag}\``
        }
				\u3000 ${
          !balance.Items.FarmingTools
            ? `\`/shop buy tools\` - <:coin:706659001164628008> \`${farmingPrice.toLocaleString('en')}\``
            : 'Farming Tools - `Owned`'
        }
				\u3000 Seed Bag - ${
          !balance.Boosts.SeedBag
            ? '`Not Owned` - Buy farming tools to aquire'
            : `\`Owned\` - Current capacity: \`${Number(currentTotalSeeds)}\`/\`${balance.Boosts.SeedBag}\``
        }
				\u3000 Farm Bag - ${
          !balance.Boosts.FarmBag
            ? '`Not Owned` - Buy farming tools to aquire'
            : `\`Owned\` - Current capacity: \`${Number(currentTotalFarm)}\`/\`${balance.Boosts.FarmBag}\``
        }`
      });
    if (fullPrice > 0) {
      embed.setFooter({ text: `Total Value: ${fullPrice.toLocaleString('en')}` });
    }
    interaction.reply({ embeds: [embed] });
  }
};

export default SlashCommandF;
