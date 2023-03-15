import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

const data = new SlashCommandBuilder()
  .setName('shop')
  .setDescription('Purchase/sell Items')
  .addStringOption((option) => option.setName('option').setDescription('Select a user').setRequired(true).setAutocomplete(true))
  .addStringOption((option) => option.setName('item').setDescription('Item to buy/sell/upgrade'));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Purchase/sell Items',
      category: 'Economy',
      options: data
    });
  }

  async autoComplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = ['buy', 'sell', 'upgrade'];
    const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  }

  async run(interaction) {
    const argsChoice = interaction.options.getString('option');
    const argsItem = interaction.options.getString('item');

    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    let foundItemList = JSON.parse(balance.Items);
    let foundBoostList = JSON.parse(balance.Boosts);
    let foundPlotList = JSON.parse(balance.FarmPlot);
    let foundHarvestList = JSON.parse(balance.HarvestedCrops);

    const fishingPrice = this.client.ecoPrices.fishingRod;
    const farmingPrice = this.client.ecoPrices.farmingTools;
    const cornSeedPrice = this.client.ecoPrices.cornSeed;
    const wheatSeedPrice = this.client.ecoPrices.wheatSeed;
    const potatoeSeedPrice = this.client.ecoPrices.potatoSeed;
    const tomatoeSeedprice = this.client.ecoPrices.tomatoSeed;
    const initalSeedBag = this.client.ecoPrices.seedBagFirst;
    const seedBagMax = this.client.ecoPrices.seedBagLimit;
    const initialFishBag = this.client.ecoPrices.fishBagFirst;
    const fishBagMax = this.client.ecoPrices.fishBagLimit;
    const initalFarmBag = this.client.ecoPrices.farmBagFirst;
    const farmBagMax = this.client.ecoPrices.farmBagLimit;
    const initialFarmPlot = this.client.ecoPrices.farmPlotFirst;
    const farmPlotMax = this.client.ecoPrices.farmPlotLimit;

    const { seedBagPrice } = this.client.ecoPrices;
    const { farmBagPrice } = this.client.ecoPrices;
    const { fishBagPrice } = this.client.ecoPrices;
    const { farmPlotPrice } = this.client.ecoPrices;

    if (!foundItemList) {
      foundItemList = {};
    }

    if (!foundBoostList) {
      foundBoostList = {};
    }

    if (!foundPlotList) {
      foundPlotList = [];
    }

    if (!foundHarvestList) {
      foundHarvestList = [];
    }

    let troutPrice;
    let salmonPrice;
    let swordFishPrice;
    let pufferFishPrice;
    let treasurePrice;

    let goldBarPrice;
    let cornPrice = 0;
    let wheatPrice = 0;
    let potatoesPrice = 0;
    let tomatoesPrice = 0;
    let goldNuggetPrice;
    let barleyPrice;
    let spinachPrice;
    let strawberriesPrice;
    let lettucePrice;

    if (foundItemList.Trout !== undefined) troutPrice = this.client.ecoPrices.trout * Number(foundItemList.Trout);
    if (foundItemList.KingSalmon !== undefined) salmonPrice = this.client.ecoPrices.kingSalmon * Number(foundItemList.KingSalmon);
    if (foundItemList.SwordFish !== undefined) swordFishPrice = this.client.ecoPrices.swordfish * Number(foundItemList.SwordFish);
    if (foundItemList.PufferFish !== undefined) pufferFishPrice = this.client.ecoPrices.pufferfish * Number(foundItemList.PufferFish);
    if (foundItemList.Treasure !== undefined) treasurePrice = this.client.ecoPrices.treasure * Number(foundItemList.Treasure);

    if (foundItemList.GoldBar !== undefined) goldBarPrice = this.client.ecoPrices.goldBar * Number(foundItemList.GoldBar);
    if (foundHarvestList) {
      foundHarvestList.forEach((obj) => {
        if (obj.cropType === 'corn') cornPrice += Math.floor(this.client.ecoPrices.corn * (1 - obj.decay.toFixed(4) / 100));
        if (obj.cropType === 'wheat') wheatPrice += Math.floor(this.client.ecoPrices.wheat * (1 - obj.decay.toFixed(4) / 100));
        if (obj.cropType === 'potato') potatoesPrice += Math.floor(this.client.ecoPrices.potatoes * (1 - obj.decay.toFixed(4) / 100));
        if (obj.cropType === 'tomato') tomatoesPrice += Math.floor(this.client.ecoPrices.tomatoes * (1 - obj.decay.toFixed(4) / 100));
      });
    }
    if (foundItemList.GoldNugget !== undefined) goldNuggetPrice = this.client.ecoPrices.goldNugget * Number(foundItemList.GoldNugget);
    if (foundItemList.Barley !== undefined) barleyPrice = this.client.ecoPrices.barley * Number(foundItemList.Barley);
    if (foundItemList.Spinach !== undefined) spinachPrice = this.client.ecoPrices.spinach * Number(foundItemList.Spinach);
    if (foundItemList.Sstrawberries !== undefined) strawberriesPrice = this.client.ecoPrices.strawberries * Number(foundItemList.Sstrawberries);
    if (foundItemList.Lettuce !== undefined) lettucePrice = this.client.ecoPrices.lettuce * Number(foundItemList.Lettuce);

    let currentTotalSeeds = 0;

    if (foundItemList.CornSeeds) {
      currentTotalSeeds += Number(foundItemList.CornSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (foundItemList.WheatSeeds) {
      currentTotalSeeds += Number(foundItemList.WheatSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (foundItemList.PotatoSeeds) {
      currentTotalSeeds += Number(foundItemList.PotatoSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }
    if (foundItemList.TomatoSeeds) {
      currentTotalSeeds += Number(foundItemList.TomatoSeeds);
    } else {
      currentTotalSeeds += Number(0);
    }

    let currentTotalFish = 0;

    if (foundItemList.Trout) {
      currentTotalFish += Number(foundItemList.Trout);
    } else {
      currentTotalFish += Number(0);
    }
    if (foundItemList.KingSalmon) {
      currentTotalFish += Number(foundItemList.KingSalmon);
    } else {
      currentTotalFish += Number(0);
    }
    if (foundItemList.SwordFish) {
      currentTotalFish += Number(foundItemList.SwordFish);
    } else {
      currentTotalFish += Number(0);
    }
    if (foundItemList.PufferFish) {
      currentTotalFish += Number(foundItemList.PufferFish);
    } else {
      currentTotalFish += Number(0);
    }

    let currentTotalFarm = 0;

    if (foundHarvestList) {
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'corn').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'wheat').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'potato').length);
      currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'tomato').length);
    }

    let currentTotalPlot = 0;

    if (foundBoostList.FarmPlot) {
      currentTotalPlot += Number(foundPlotList.length);
    } else {
      currentTotalPlot += Number(0);
    }

    if (argsChoice === 'upgrade') {
      if (!argsItem) {
        const arr = [];
        if (foundBoostList.seedBag) {
          if (Number(foundBoostList.seedBag) < Number(seedBagMax)) {
            const upgradeSeedBag = foundBoostList.seedBag * seedBagPrice;
            arr.push(
              `\u3000 \`/shop upgrade seedbag\` - <:coin:706659001164628008> \`${upgradeSeedBag.toLocaleString(
                'en'
              )}\` Upgrade by 15, current capacity: \`${Number(currentTotalSeeds).toLocaleString('en')}\`/\`${Number(
                foundBoostList.seedBag
              ).toLocaleString('en')}\``
            );
          }
        }

        if (foundBoostList.fishBag) {
          if (Number(foundBoostList.fishBag) < Number(fishBagMax)) {
            const upgradeFishBag = foundBoostList.fishBag * fishBagPrice;
            arr.push(
              `\u3000 \`/shop upgrade fishbag\` - <:coin:706659001164628008> \`${upgradeFishBag.toLocaleString(
                'en'
              )}\` Upgrade by 15, current capacity: \`${Number(currentTotalFish).toLocaleString('en')}\`/\`${Number(
                foundBoostList.fishBag
              ).toLocaleString('en')}\``
            );
          }
        }

        if (foundBoostList.farmBag) {
          if (Number(foundBoostList.farmBag) < Number(farmBagMax)) {
            const upgradeFarmBag = foundBoostList.farmBag * farmBagPrice;
            arr.push(
              `\u3000 \`/shop upgrade farmbag\` - <:coin:706659001164628008> \`${upgradeFarmBag.toLocaleString(
                'en'
              )}\` Upgrade by 15, current capacity: \`${Number(currentTotalFarm).toLocaleString('en')}\`/\`${Number(
                foundBoostList.farmBag
              ).toLocaleString('en')}\``
            );
          }
        }

        if (foundBoostList.FarmPlot) {
          if (Number(foundBoostList.FarmPlot) < Number(farmPlotMax)) {
            const upgradeFarmPlot = foundBoostList.FarmPlot * farmPlotPrice;
            arr.push(
              `\u3000 \`/shop upgrade plot\` - <:coin:706659001164628008> \`${upgradeFarmPlot.toLocaleString(
                'en'
              )}\` Upgrade by 15, current capacity: \`${Number(currentTotalPlot).toLocaleString('en')}\`/\`${Number(
                foundBoostList.FarmPlot
              ).toLocaleString('en')}\``
            );
          }
        }

        if (!arr.length) arr.push('\u3000 `None`');

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Upgrade**`,
            value: `**◎ Available Upgrades**
						${arr.join('\n')}`
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (argsItem === 'seedbag') {
        if (!foundBoostList.seedBag) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Seed Bag**`,
              value: '**◎ Error:** You do not own a seed bag! You will be awarded one once you purchase farming tools.'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (Number(foundBoostList.seedBag) >= Number(seedBagMax)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Seed Bag**`,
              value: '**◎ Error:** You have already upgraded your seed bag to the maximum level!'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < foundBoostList.seedBag * seedBagPrice * 3) {
          const notEnough = foundBoostList.seedBag * seedBagPrice * 3 - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Seed Bag**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - foundBoostList.seedBag * seedBagPrice * 3;
        balance.Total = Number(balance.Total) - foundBoostList.seedBag * seedBagPrice * 3;

        const calc = Number(foundBoostList.seedBag) + Number(15);
        foundBoostList.seedBag = calc.toString();

        balance.Boosts = JSON.stringify(foundBoostList);
        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://SeedBag.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Seed Bag**`,
            value: `**◎ Success:** You have upgraded your seed bag for <:coin:706659001164628008> \`${
              foundBoostList.seedBag * seedBagPrice * 3
            }\`, your new limit is \`${Number(foundBoostList.seedBag)}\`!`
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/SeedBag.png'] });
        return;
      }

      if (argsItem === 'fishbag') {
        if (!foundBoostList.fishBag) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Fish Bag**`,
              value: '**◎ Error:** You do not own a fish bag! You will be awarded one once you purchase a fishing rod.'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (Number(foundBoostList.fishBag) >= Number(fishBagMax)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Fish Bag**`,
              value: '**◎ Error:** You have already upgraded your fish bag to the maximum level!'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < foundBoostList.fishBag * fishBagPrice * 3) {
          const notEnough = foundBoostList.fishBag * fishBagPrice * 3 - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Fish Bag**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - foundBoostList.fishBag * fishBagPrice * 3;
        balance.Total = Number(balance.Total) - foundBoostList.fishBag * fishBagPrice * 3;

        const calc = Number(foundBoostList.fishBag) + Number(15);
        foundBoostList.fishBag = calc.toString();

        balance.Boosts = JSON.stringify(foundBoostList);
        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://FishBag.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Fish Bag**`,
            value: `**◎ Success:** You have upgraded your fish bag <:coin:706659001164628008> \`${
              foundBoostList.fishBag * fishBagPrice * 3
            }\`, your new limit is \`${Number(foundBoostList.fishBag)}\`!`
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/FishBag.png'] });
        return;
      }

      if (argsItem === 'farmbag') {
        if (!foundBoostList.farmBag) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Bag**`,
              value: '**◎ Error:** You do not own a farm bag! You will be awarded one once you purchase farming tools.'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (Number(foundBoostList.farmBag) >= Number(farmBagMax)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Bag**`,
              value: '**◎ Error:** You have already upgraded your farm bag to the maximum level!'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < foundBoostList.farmBag * farmBagPrice * 3) {
          const notEnough = foundBoostList.farmBag * farmBagPrice * 3 - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Bag**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - foundBoostList.farmBag * farmBagPrice * 3;
        balance.Total = Number(balance.Total) - foundBoostList.farmBag * farmBagPrice * 3;

        const calc = Number(foundBoostList.farmBag) + Number(15);
        foundBoostList.farmBag = calc.toString();

        balance.Boosts = JSON.stringify(foundBoostList);
        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://FarmBag.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Farm Bag**`,
            value: `**◎ Success:** You have upgraded your farm bag <:coin:706659001164628008> \`${
              foundBoostList.farmBag * farmBagPrice * 3
            }\`, your new limit is \`${Number(foundBoostList.farmBag)}\`!`
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/FarmBag.png'] });
        return;
      }

      if (argsItem === 'plot') {
        if (!foundBoostList.FarmPlot) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Plot**`,
              value: '**◎ Error:** You do not own a farm plot! You will be awarded one once you purchase farming tools.'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (Number(foundBoostList.FarmPlot) >= Number(farmPlotMax)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Plot**`,
              value: '**◎ Error:** You have already upgraded your farm plot to the maximum level!'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < foundBoostList.FarmPlot * farmPlotPrice * 3) {
          const notEnough = foundBoostList.FarmPlot * farmPlotPrice * 3 - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farm Plot**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - foundBoostList.FarmPlot * farmPlotPrice * 3;
        balance.Total = Number(balance.Total) - foundBoostList.FarmPlot * farmPlotPrice * 3;

        const calc = Number(foundBoostList.FarmPlot) + Number(15);
        foundBoostList.FarmPlot = calc.toString();

        balance.Boosts = JSON.stringify(foundBoostList);
        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://FarmPlot.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Farm Plot**`,
            value: `**◎ Success:** You have upgraded your farm plot <:coin:706659001164628008> \`${
              foundBoostList.FarmPlot * farmPlotPrice * 3
            }\`, your new limit is \`${Number(foundBoostList.FarmPlot)}\`!`
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/FarmPlot.png'] });
        return;
      }
    }

    if (argsChoice === 'buy') {
      if (!argsItem) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Buy**`,
            value: `**◎ Farming Seeds: (Amount optional)**
						\u3000 \`/shop buy corn\` - 10 Seeds per pack - ${
              !foundItemList.CornSeeds
                ? `<:coin:706659001164628008> \`${cornSeedPrice.toLocaleString('en')}\``
                : `<:coin:706659001164628008> \`${cornSeedPrice.toLocaleString('en')}\` - \`Owned ${foundItemList.CornSeeds.toLocaleString('en')}\``
            }
						\u3000 \`/shop buy wheat\` - 10 Seeds per pack - ${
              !foundItemList.WheatSeeds
                ? `<:coin:706659001164628008> \`${wheatSeedPrice.toLocaleString('en')}\``
                : `<:coin:706659001164628008> \`${wheatSeedPrice.toLocaleString('en')}\`- \`Owned ${foundItemList.WheatSeeds.toLocaleString('en')}\``
            }
						\u3000 \`/shop buy potato\` - 10 Seeds per pack - ${
              !foundItemList.PotatoSeeds
                ? `<:coin:706659001164628008> \`${potatoeSeedPrice.toLocaleString('en')}\``
                : `<:coin:706659001164628008> \`${potatoeSeedPrice.toLocaleString('en')}\`- \`Owned ${foundItemList.PotatoSeeds.toLocaleString(
                    'en'
                  )}\``
            }
						\u3000 \`/shop buy tomato\` - 10 Seeds per pack - ${
              !foundItemList.TomatoSeeds
                ? `<:coin:706659001164628008> \`${tomatoeSeedprice.toLocaleString('en')}\``
                : `<:coin:706659001164628008> \`${tomatoeSeedprice.toLocaleString('en')}\`- \`Owned ${foundItemList.TomatoSeeds.toLocaleString(
                    'en'
                  )}\``
            }
						\u200b
						**◎ Permanent Items:**
						\u3000 ${
              !foundItemList.FishingRod
                ? `\`/shop buy rod\` - <:coin:706659001164628008> \`${fishingPrice.toLocaleString('en')}\``
                : 'Fishing Rod - `Owned`'
            }
						\u3000 Fish Bag - ${
              !foundBoostList.fishBag
                ? '`Not Owned` - Buy fishing rod to aquire'
                : `\`Owned\` - Current capacity: \`${Number(currentTotalFish)}\`/\`${foundBoostList.fishBag}\``
            }
						\u3000 ${
              !foundItemList.FarmingTools
                ? `\`/shop buy tools\` - <:coin:706659001164628008> \`${farmingPrice.toLocaleString('en')}\``
                : 'Farming Tools - `Owned`'
            }
						\u3000 Seed Bag - ${
              !foundBoostList.seedBag
                ? '`Not Owned` - Buy farming tools to aquire'
                : `\`Owned\` - Current capacity: \`${Number(currentTotalSeeds)}\`/\`${foundBoostList.seedBag}\``
            }
						\u3000 Farm Bag - ${
              !foundBoostList.farmBag
                ? '`Not Owned` - Buy farming tools to aquire'
                : `\`Owned\` - Current capacity: \`${Number(currentTotalFarm)}\`/\`${foundBoostList.farmBag}\``
            }
						\u3000 Farm Plot - ${
              !foundBoostList.FarmPlot
                ? '`Not Owned` - Buy farming tools to aquire'
                : `\`Owned\` - Current capacity: \`${Number(currentTotalPlot)}\`/\`${foundBoostList.FarmPlot}\``
            }`
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (argsItem === 'corn' || argsItem === 'wheat' || argsItem === 'potato' || argsItem === 'tomato') {
        if (!foundItemList.FarmingTools) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Seeds**`,
              value: '**◎ Error:** You must own farming tools before you can buy seeds!\nYou can buy them with `/shop buy tools`'
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }
      }

      if (argsItem === 'corn') {
        let cornTot = 0;
        cornTot += Number(cornSeedPrice) * Number(1);

        if (balance.Bank < cornTot) {
          const notEnough = Number(cornTot) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Corn Seeds**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - Number(cornTot);
        balance.Total = Number(balance.Total) - Number(cornTot);
        await balance.save();

        let calc;
        if (foundItemList.CornSeeds) {
          calc = Number(foundItemList.CornSeeds) + Number(1) * 10;
        } else {
          calc = Number(1) * 10;
        }

        if (Number(currentTotalSeeds) + Number(1) * 10 > Number(foundBoostList.seedBag)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Backpack Limit**`,
              value: `**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${foundBoostList.seedBag}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        foundItemList.CornSeeds = Number(calc).toString();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://CornSeeds.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Corn Seeds**`,
            value: `**◎ Success:** You have bought a pack of Corn Seeds.\nYou now have \`${calc}\` total Corn seeds.\n\nYour current backpack capacity is at \`${
              Number(currentTotalSeeds) + Number(1) * 10
            }\`/\`${foundBoostList.seedBag}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/CornSeeds.png'] });

        balance.Items = JSON.stringify(foundItemList);
        await balance.save();
        return;
      }

      if (argsItem === 'wheat') {
        let wheatTot = 0;
        wheatTot += Number(wheatSeedPrice) * Number(1);

        if (balance.Bank < wheatTot) {
          const notEnough = Number(wheatTot) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Wheat Seeds**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - Number(wheatTot);
        balance.Total = Number(balance.Total) - Number(wheatTot);
        await balance.save();

        let calc;
        if (foundItemList.WheatSeeds) {
          calc = Number(foundItemList.WheatSeeds) + Number(1) * 10;
        } else {
          calc = Number(1) * 10;
        }

        if (Number(currentTotalSeeds) + Number(1) * 10 > Number(foundBoostList.seedBag)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Backpack Limit**`,
              value: `**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${foundBoostList.seedBag}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        foundItemList.WheatSeeds = Number(calc).toString();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://WheatSeeds.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Wheat Seeds**`,
            value: `**◎ Success:** You have bought a pack of Wheat Seeds.\nYou now have \`${calc}\` total Wheat seeds.\n\nYour current backpack capacity is at \`${
              Number(currentTotalSeeds) + Number(1) * 10
            }\`/\`${foundBoostList.seedBag}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/WheatSeeds.png'] });

        balance.Items = JSON.stringify(foundItemList);
        await balance.save();
        return;
      }

      if (argsItem === 'potato') {
        let potatoeTot = 0;
        potatoeTot += Number(potatoeSeedPrice) * Number(1);

        if (balance.Bank < potatoeTot) {
          const notEnough = Number(potatoeTot) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Potato Seeds**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - Number(potatoeTot);
        balance.Total = Number(balance.Total) - Number(potatoeTot);
        await balance.save();

        let calc;
        if (foundItemList.PotatoSeeds) {
          calc = Number(foundItemList.PotatoSeeds) + Number(1) * 10;
        } else {
          calc = Number(1) * 10;
        }

        if (Number(currentTotalSeeds) + Number(1) * 10 > Number(foundBoostList.seedBag)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Backpack Limit**`,
              value: `**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${foundBoostList.seedBag}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        foundItemList.PotatoSeeds = Number(calc).toString();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://Potatoe.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Potato Seeds**`,
            value: `**◎ Success:** You have bought a pack of Potato Seeds.\nYou now have \`${calc}\` total Potato seeds.\n\nYour current backpack capacity is at \`${
              Number(currentTotalSeeds) + Number(1) * 10
            }\`/\`${foundBoostList.seedBag}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/Potatoe.png'] });

        balance.Items = JSON.stringify(foundItemList);
        await balance.save();
        return;
      }

      if (argsItem === 'tomato') {
        let tomatoeTot = 0;
        tomatoeTot += Number(tomatoeSeedprice) * Number(1);

        if (balance.Bank < tomatoeTot) {
          const notEnough = Number(tomatoeTot) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Tomato Seeds**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - Number(tomatoeTot);
        balance.Total = Number(balance.Total) - Number(tomatoeTot);
        await balance.save();

        let calc;
        if (foundItemList.TomatoSeeds) {
          calc = Number(foundItemList.TomatoSeeds) + Number(1) * 10;
        } else {
          calc = Number(1) * 10;
        }

        if (Number(currentTotalSeeds) + Number(1) * 10 > Number(foundBoostList.seedBag)) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Backpack Limit**`,
              value: `**◎ Error:** You do not have enough space in your seed backpack! You backpack is currently at \`${currentTotalSeeds}\`/\`${foundBoostList.seedBag}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        foundItemList.TomatoSeeds = Number(calc).toString();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://Tomatoes.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Tomato Seeds**`,
            value: `**◎ Success:** You have bought a pack of Tomato Seeds.\nYou now have \`${calc}\` total Tomato seeds.\n\nYour current backpack capacity is at \`${
              Number(currentTotalSeeds) + Number(1) * 10
            }\`/\`${foundBoostList.seedBag}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/Tomatoes.png'] });

        balance.Items = JSON.stringify(foundItemList);
        await balance.save();
        return;
      }

      if (argsItem === 'rod') {
        if (foundItemList.FishingRod) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Fishing Rod**`, value: '**◎ Error:** You already own a fishing rod!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < fishingPrice) {
          const notEnough = Number(fishingPrice) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Fishing Rod**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        balance.Bank = Number(balance.Bank) - Number(fishingPrice);
        balance.Total = Number(balance.Total) - Number(fishingPrice);
        await balance.save();

        foundItemList.FishingRod = Number(1).toString();
        foundBoostList.fishBag = Number(initalSeedBag).toString();

        balance.Items = JSON.stringify(foundItemList);
        balance.Boosts = JSON.stringify(foundBoostList);
        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://FishingRod.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Fishing Rod**`,
            value: `**◎ Success:** You have bought a fishing rod!\nYou have also been awarded a starter Fish bag, it's capacity is \`${initialFishBag}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/FishingRod.png'] });
        return;
      }

      if (argsItem === 'tools') {
        if (foundItemList.FarmingTools) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Farming Tools**`, value: '**◎ Error:** You already own Farming Tools!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.Bank < farmingPrice) {
          const notEnough = Number(farmingPrice) - Number(balance.Bank);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Shop - Farming Tools**`,
              value: `**◎ Error:** You do not have enough <:coin:706659001164628008> in your Bank!\nYou need another <:coin:706659001164628008> \`${notEnough.toLocaleString(
                'en'
              )}\``
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (balance.FarmCool) {
          balance.FarmCool = null;
          await balance.save();
        }

        let fullPrice = 0;

        if (foundItemList.Barley) fullPrice += Number(foundItemList.Barley) * this.client.ecoPrices.barley;
        if (foundItemList.Spinach) fullPrice += Number(foundItemList.Spinach) * this.client.ecoPrices.spinach;
        if (foundItemList.Sstrawberries) fullPrice += Number(foundItemList.Sstrawberries) * this.client.ecoPrices.strawberries;
        if (foundItemList.Lettuce) fullPrice += Number(foundItemList.Lettuce) * this.client.ecoPrices.lettuce;

        balance.Bank = Number(balance.Bank) - Number(farmingPrice) + fullPrice;
        balance.Total = Number(balance.Total) - Number(farmingPrice) + fullPrice;
        await balance.save();

        foundItemList.FarmingTools = Number(1).toString();
        foundBoostList.farmBag = Number(initalFarmBag).toString();
        foundBoostList.seedBag = Number(initalSeedBag).toString();
        foundBoostList.FarmPlot = Number(initialFarmPlot).toString();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setThumbnail('attachment://FarmingTool.png')
          .addFields({
            name: `**${this.client.user.username} - Shop - Farming Tools**`,
            value: `**◎ Success:** You have bought Farming Tools${
              foundItemList.Barley || foundItemList.Spinach || foundItemList.Sstrawberries || foundItemList.Lettuce
                ? `.\nYou had some old crops, I have sold them for you and credited <:coin:706659001164628008> \`${fullPrice.toLocaleString(
                    'en'
                  )}\` to your account.`
                : '!'
            }\n\nYou have also been awarded a starter Farm bag, Plot and Seed bag\nFarm capacity: \`${initalFarmBag}\` Seed capacity: \`${initalSeedBag}\` Plot Capacity: \`${initialFarmPlot}\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed], files: ['./Storage/Images/Economy/FarmingTool.png'] });

        if (foundItemList.Barley) delete foundItemList.Barley;
        if (foundItemList.Spinach) delete foundItemList.Spinach;
        if (foundItemList.Sstrawberries) delete foundItemList.Sstrawberries;
        if (foundItemList.Lettuce) delete foundItemList.Lettuce;

        balance.Items = JSON.stringify(foundItemList);
        balance.Boosts = JSON.stringify(foundBoostList);
        await balance.save();
        return;
      }
    }

    if (argsChoice === 'sell') {
      if (!argsItem) {
        let fields;

        if (!foundItemList.FarmingTools) {
          fields = [
            `\u3000 Barley: Own ${
              foundItemList.Barley === undefined
                ? '`0`'
                : `\`${foundItemList.Barley}\` - <:coin:706659001164628008> \`${barleyPrice.toLocaleString('en')}\``
            }`,
            `\u3000 Spinach: Own ${
              foundItemList.Spinach === undefined
                ? '`0`'
                : `\`${foundItemList.Spinach}\` - <:coin:706659001164628008> \`${spinachPrice.toLocaleString('en')}\``
            }`,
            `\u3000 Strawberries: Own ${
              foundItemList.Sstrawberries === undefined
                ? '`0`'
                : `\`${foundItemList.Sstrawberries} \`- <:coin:706659001164628008> \`${strawberriesPrice.toLocaleString('en')}\``
            }`,
            `\u3000 Lettuce: Own ${
              foundItemList.Lettuce === undefined
                ? '`0`'
                : `\`${foundItemList.Lettuce}\` - <:coin:706659001164628008> \`${lettucePrice.toLocaleString('en')}\``
            }`
          ];
        } else {
          fields = [
            `\u3000 Corn: Own ${
              !foundHarvestList.filter((key) => key.cropType === 'corn').length
                ? '`0`'
                : `\`${foundHarvestList.filter((key) => key.cropType === 'corn').length}\` - <:coin:706659001164628008> \`${cornPrice.toLocaleString(
                    'en'
                  )}\``
            }`,
            `\u3000 Wheat: Own ${
              !foundHarvestList.filter((key) => key.cropType === 'wheat').length
                ? '`0`'
                : `\`${
                    foundHarvestList.filter((key) => key.cropType === 'wheat').length
                  }\` - <:coin:706659001164628008> \`${wheatPrice.toLocaleString('en')}\``
            }`,
            `\u3000 Potatoes: Own ${
              !foundHarvestList.filter((key) => key.cropType === 'potato').length
                ? '`0`'
                : `\`${
                    foundHarvestList.filter((key) => key.cropType === 'potato').length
                  }\` - <:coin:706659001164628008> \`${potatoesPrice.toLocaleString('en')}\``
            }`,
            `\u3000 Tomatoes: Own ${
              !foundHarvestList.filter((key) => key.cropType === 'tomato').length
                ? '`0`'
                : `\`${
                    foundHarvestList.filter((key) => key.cropType === 'tomato').length
                  }\` - <:coin:706659001164628008> \`${tomatoesPrice.toLocaleString('en')}\``
            }`
          ];

          if (foundItemList.Barley || foundItemList.Spinach || foundItemList.Sstrawberries || foundItemList.Lettuce) {
            const lowCrops = [
              `\u3000 Barley: Own ${
                foundItemList.Barley === undefined
                  ? '`0`'
                  : `\`${foundItemList.Barley}\` - <:coin:706659001164628008> \`${barleyPrice.toLocaleString('en')}\``
              }`,
              `\u3000 Spinach: Own ${
                foundItemList.Spinach === undefined
                  ? '`0`'
                  : `\`${foundItemList.Spinach}\` - <:coin:706659001164628008> \`${spinachPrice.toLocaleString('en')}\``
              }`,
              `\u3000 Strawberries: Own ${
                foundItemList.Sstrawberries === undefined
                  ? '`0`'
                  : `\`${foundItemList.Sstrawberries} \`- <:coin:706659001164628008> \`${strawberriesPrice.toLocaleString('en')}\``
              }`,
              `\u3000 Lettuce: Own ${
                foundItemList.Lettuce === undefined
                  ? '`0`'
                  : `\`${foundItemList.Lettuce}\` - <:coin:706659001164628008> \`${lettucePrice.toLocaleString('en')}\``
              }`
            ];
            fields.push(lowCrops.join('\n'));
          }
        }

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Items**`,
            value: `**◎ Fish:**
						\u3000 Trout: Own ${
              foundItemList.Trout === undefined
                ? '`0`'
                : `\`${foundItemList.Trout}\` - <:coin:706659001164628008> \`${troutPrice.toLocaleString('en')}\``
            }
						\u3000 King Salmon: Own ${
              foundItemList.KingSalmon === undefined
                ? '`0`'
                : `\`${foundItemList.KingSalmon}\` - <:coin:706659001164628008> \`${salmonPrice.toLocaleString('en')}\``
            }
						\u3000 Swordfish: Own ${
              foundItemList.SwordFish === undefined
                ? '`0`'
                : `\`${foundItemList.SwordFish} \`- <:coin:706659001164628008> \`${swordFishPrice.toLocaleString('en')}\``
            }
						\u3000 Pufferfish: Own ${
              foundItemList.PufferFish === undefined
                ? '`0`'
                : `\`${foundItemList.PufferFish}\` - <:coin:706659001164628008> \`${pufferFishPrice.toLocaleString('en')}\``
            }
						\u200b
						**◎ Crops:**
						${fields.join('\n')}
						\u200b
						**◎ Treasure:**
						\u3000 Treasure Chest: Own ${
              foundItemList.Treasure === undefined
                ? '`0`'
                : `${foundItemList.Treasure} - <:coin:706659001164628008> \`${treasurePrice.toLocaleString('en')}\``
            }
						\u3000 Gold Bar: Own ${
              foundItemList.GoldBar === undefined
                ? '`0`'
                : `\`${foundItemList.GoldBar}\` - <:coin:706659001164628008> \`${goldBarPrice.toLocaleString('en')}\``
            }
						\u3000 Gold Nugget: Own ${
              foundItemList.GoldNugget === undefined
                ? '`0`'
                : `\`${foundItemList.GoldNugget}\` - <:coin:706659001164628008> \`${goldNuggetPrice.toLocaleString('en')}\``
            }
						\u200b
						**◎ Available Commands:**
						\u3000 \`/shop sell all\`
						\u3000 \`/shop sell fish\`
						\u3000 \`/shop sell farm\`
						\u3000 \`/shop sell treasure\``
          });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (argsItem === 'all') {
        if (
          !foundItemList.Lettuce &&
          !foundItemList.Sstrawberries &&
          !foundItemList.Spinach &&
          !foundItemList.Barley &&
          !foundHarvestList.filter((key) => key.cropType === 'tomato').length &&
          !foundHarvestList.filter((key) => key.cropType === 'potato').length &&
          !foundHarvestList.filter((key) => key.cropType === 'wheat').length &&
          !foundHarvestList.filter((key) => key.cropType === 'corn').length &&
          !foundItemList.Trout &&
          !foundItemList.KingSalmon &&
          !foundItemList.SwordFish &&
          !foundItemList.PufferFish &&
          !foundItemList.Treasure &&
          !foundItemList.GoldBar &&
          !foundItemList.GoldNugget
        ) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Sell All**`, value: '**◎ Error:** You do not have anything to sell!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        let fullPrice = 0;
        let itemCount = 0;

        if (foundItemList.Lettuce) fullPrice += Number(foundItemList.Lettuce) * this.client.ecoPrices.lettuce;
        if (foundItemList.Sstrawberries) fullPrice += Number(foundItemList.Sstrawberries) * this.client.ecoPrices.strawberries;
        if (foundItemList.Spinach) fullPrice += Number(foundItemList.Spinach) * this.client.ecoPrices.spinach;
        if (foundItemList.Barley) fullPrice += Number(foundItemList.Barley) * this.client.ecoPrices.barley;

        foundHarvestList.forEach((obj) => {
          if (obj.cropType === 'corn') fullPrice += Math.floor(this.client.ecoPrices.corn * (1 - obj.decay.toFixed(4) / 100));
          if (obj.cropType === 'wheat') fullPrice += Math.floor(this.client.ecoPrices.wheat * (1 - obj.decay.toFixed(4) / 100));
          if (obj.cropType === 'potato') fullPrice += Math.floor(this.client.ecoPrices.potatoes * (1 - obj.decay.toFixed(4) / 100));
          if (obj.cropType === 'tomato') fullPrice += Math.floor(this.client.ecoPrices.tomatoes * (1 - obj.decay.toFixed(4) / 100));
        });

        if (foundItemList.Trout) fullPrice += Number(foundItemList.Trout) * this.client.ecoPrices.trout;
        if (foundItemList.KingSalmon) fullPrice += Number(foundItemList.KingSalmon) * this.client.ecoPrices.kingSalmon;
        if (foundItemList.SwordFish) fullPrice += Number(foundItemList.SwordFish) * this.client.ecoPrices.swordfish;
        if (foundItemList.PufferFish) fullPrice += Number(foundItemList.PufferFish) * this.client.ecoPrices.pufferfish;
        if (foundItemList.Treasure) fullPrice += Number(foundItemList.Treasure) * this.client.ecoPrices.treasure;
        if (foundItemList.GoldBar) fullPrice += Number(foundItemList.GoldBar) * this.client.ecoPrices.goldBar;
        if (foundItemList.GoldNugget) fullPrice += Number(foundItemList.GoldNugget) * this.client.ecoPrices.goldNugget;

        if (foundItemList.Treasure) itemCount += Number(foundItemList.Treasure);
        if (foundItemList.Trout) itemCount += Number(foundItemList.Trout);
        if (foundItemList.KingSalmon) itemCount += Number(foundItemList.KingSalmon);
        if (foundItemList.SwordFish) itemCount += Number(foundItemList.SwordFish);
        if (foundItemList.PufferFish) itemCount += Number(foundItemList.PufferFish);
        if (foundItemList.Lettuce) itemCount += Number(foundItemList.Lettuce);
        if (foundItemList.Sstrawberries) itemCount += Number(foundItemList.Sstrawberries);
        if (foundItemList.Spinach) itemCount += Number(foundItemList.Spinach);
        if (foundItemList.Barley) itemCount += Number(foundItemList.Barley);

        if (foundHarvestList) {
          itemCount += Number(foundHarvestList.filter((key) => key.cropType === 'corn').length);
          itemCount += Number(foundHarvestList.filter((key) => key.cropType === 'wheat').length);
          itemCount += Number(foundHarvestList.filter((key) => key.cropType === 'potato').length);
          itemCount += Number(foundHarvestList.filter((key) => key.cropType === 'tomato').length);
        }

        if (foundItemList.GoldBar) itemCount += Number(foundItemList.GoldBar);
        if (foundItemList.GoldNugget) itemCount += Number(foundItemList.GoldNugget);

        const totalAdd = balance.Total + fullPrice;

        balance.Bank += fullPrice;
        balance.Total = totalAdd;
        await balance.save();

        if (foundItemList.Treasure) delete foundItemList.Treasure;
        if (foundItemList.Trout) delete foundItemList.Trout;
        if (foundItemList.KingSalmon) delete foundItemList.KingSalmon;
        if (foundItemList.SwordFish) delete foundItemList.SwordFish;
        if (foundItemList.PufferFish) delete foundItemList.PufferFish;
        if (foundItemList.GoldBar) delete foundItemList.GoldBar;
        if (foundItemList.GoldNugget) delete foundItemList.GoldNugget;
        if (foundItemList.Barley) delete foundItemList.Barley;
        if (foundItemList.Spinach) delete foundItemList.Spinach;
        if (foundItemList.Sstrawberries) delete foundItemList.Sstrawberries;
        if (foundItemList.Lettuce) delete foundItemList.Lettuce;

        balance.Items = JSON.stringify(foundItemList);
        balance.HarvestedCrops = null;
        balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Sell All**`,
            value: `**◎ Success:** You have sold \`${itemCount}\` Items. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString(
              'en'
            )}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
          });
        interaction.reply({ embeds: [embed] });
        return;
      }

      if (argsItem === 'fish') {
        if (
          foundItemList.Trout === undefined &&
          foundItemList.KingSalmon === undefined &&
          foundItemList.SwordFish === undefined &&
          foundItemList.PufferFish === undefined &&
          foundItemList.Treasure === undefined
        ) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Sell Fish**`, value: '**◎ Error:** You do not have any fish!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        let fullPrice = 0;
        let fishCount = 0;

        if (foundItemList.Trout) fullPrice += Number(foundItemList.Trout) * this.client.ecoPrices.trout;
        if (foundItemList.KingSalmon) fullPrice += Number(foundItemList.KingSalmon) * this.client.ecoPrices.kingSalmon;
        if (foundItemList.SwordFish) fullPrice += Number(foundItemList.SwordFish) * this.client.ecoPrices.swordfish;
        if (foundItemList.PufferFish) fullPrice += Number(foundItemList.PufferFish) * this.client.ecoPrices.pufferfish;

        if (foundItemList.Trout) fishCount += Number(foundItemList.Trout);
        if (foundItemList.KingSalmon) fishCount += Number(foundItemList.KingSalmon);
        if (foundItemList.SwordFish) fishCount += Number(foundItemList.SwordFish);
        if (foundItemList.PufferFish) fishCount += Number(foundItemList.PufferFish);

        const totalAdd = balance.Total + fullPrice;

        balance.Bank += fullPrice;
        balance.Total = totalAdd;
        await balance.save();

        if (foundItemList.Trout) delete foundItemList.Trout;
        if (foundItemList.KingSalmon) delete foundItemList.KingSalmon;
        if (foundItemList.SwordFish) delete foundItemList.SwordFish;
        if (foundItemList.PufferFish) delete foundItemList.PufferFish;

        balance.Items = JSON.stringify(foundItemList);
        balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Sell Fish**`,
            value: `**◎ Success:** You have sold \`${fishCount}\` fish. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString(
              'en'
            )}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
          });
        interaction.reply({ embeds: [embed] });
        return;
      }

      if (argsItem === 'treasure') {
        if (foundItemList.Treasure === undefined) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Sell Treasure**`, value: '**◎ Error:** You do not have any treasure!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        let fullPrice = 0;
        let treasureCount = 0;

        if (foundItemList.Treasure) fullPrice += Number(foundItemList.Treasure) * this.client.ecoPrices.treasure;
        if (foundItemList.GoldBar) fullPrice += Number(foundItemList.Treasure) * this.client.ecoPrices.goldBar;
        if (foundItemList.GoldNugget) fullPrice += Number(foundItemList.GoldNugget) * this.client.ecoPrices.goldNugget;

        if (foundItemList.Treasure) treasureCount += Number(foundItemList.Treasure);
        if (foundItemList.GoldBar) treasureCount += Number(foundItemList.GoldBar);
        if (foundItemList.GoldNugget) treasureCount += Number(foundItemList.GoldNugget);

        const totalAdd = balance.Total + fullPrice;

        balance.Bank += fullPrice;
        balance.Total = totalAdd;
        await balance.save();

        if (foundItemList.Treasure) delete foundItemList.Treasure;
        if (foundItemList.GoldBar) delete foundItemList.GoldBar;
        if (foundItemList.GoldNugget) delete foundItemList.GoldNugget;

        balance.Items = JSON.stringify(foundItemList);
        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Sell Treasure**`,
            value: `**◎ Success:** You have sold \`${treasureCount}\` treasure. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString(
              'en'
            )}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
          });
        interaction.reply({ embeds: [embed] });
        return;
      }

      if (argsItem === 'farm' || argsItem === 'crops') {
        if (
          !foundItemList.Lettuce &&
          !foundItemList.Sstrawberries &&
          !foundItemList.Spinach &&
          !foundItemList.Barley &&
          !foundHarvestList.filter((key) => key.cropType === 'tomato').length &&
          !foundHarvestList.filter((key) => key.cropType === 'potato').length &&
          !foundHarvestList.filter((key) => key.cropType === 'wheat').length &&
          !foundHarvestList.filter((key) => key.cropType === 'corn').length
        ) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Shop - Sell Farm**`, value: '**◎ Error:** You do not have any farming produce!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        let fullPrice = 0;
        let itemCount = 0;

        if (foundItemList.Lettuce) fullPrice += Number(foundItemList.Lettuce) * this.client.ecoPrices.lettuce;
        if (foundItemList.Sstrawberries) fullPrice += Number(foundItemList.Sstrawberries) * this.client.ecoPrices.strawberries;
        if (foundItemList.Spinach) fullPrice += Number(foundItemList.Spinach) * this.client.ecoPrices.spinach;
        if (foundItemList.Barley) fullPrice += Number(foundItemList.Barley) * this.client.ecoPrices.barley;

        foundHarvestList.forEach((obj) => {
          if (obj.cropType === 'corn') fullPrice += Math.floor(this.client.ecoPrices.corn * (1 - obj.decay.toFixed(4) / 100));
          if (obj.cropType === 'wheat') fullPrice += Math.floor(this.client.ecoPrices.wheat * (1 - obj.decay.toFixed(4) / 100));
          if (obj.cropType === 'potato') fullPrice += Math.floor(this.client.ecoPrices.potatoes * (1 - obj.decay.toFixed(4) / 100));
          if (obj.cropType === 'tomato') fullPrice += Math.floor(this.client.ecoPrices.tomatoes * (1 - obj.decay.toFixed(4) / 100));
        });

        if (foundItemList.Lettuce) itemCount += Number(foundItemList.Lettuce);
        if (foundItemList.Sstrawberries) itemCount += Number(foundItemList.Sstrawberries);
        if (foundItemList.Spinach) itemCount += Number(foundItemList.Spinach);
        if (foundItemList.Barley) itemCount += Number(foundItemList.Barley);

        if (foundHarvestList) {
          itemCount += Number(foundHarvestList.filter((key) => key.cropType === 'corn').length);
          itemCount += Number(foundHarvestList.filter((key) => key.cropType === 'wheat').length);
          itemCount += Number(foundHarvestList.filter((key) => key.cropType === 'potato').length);
          itemCount += Number(foundHarvestList.filter((key) => key.cropType === 'tomato').length);
        }

        const totalAdd = balance.Total + fullPrice;

        balance.Bank += fullPrice;
        balance.Total = totalAdd;
        await balance.save();

        if (foundItemList.Barley) delete foundItemList.Barley;
        if (foundItemList.Spinach) delete foundItemList.Spinach;
        if (foundItemList.Sstrawberries) delete foundItemList.Sstrawberries;
        if (foundItemList.Lettuce) delete foundItemList.Lettuce;

        balance.Items = JSON.stringify(foundItemList);
        balance.HarvestedCrops = null;
        await balance.save();

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Shop - Sell Farm**`,
            value: `**◎ Success:** You have sold \`${itemCount}\` farm products. You have received <:coin:706659001164628008> \`${fullPrice.toLocaleString(
              'en'
            )}\`\nYour new total is: <:coin:706659001164628008> \`${totalAdd.toLocaleString('en')}\``
          });
        interaction.reply({ embeds: [embed] });
      }
    }
  }
};

export default SlashCommandF;
