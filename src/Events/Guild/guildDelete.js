import { ActivityType } from 'discord.js';
import AdsProtection from '../../Mongo/Schemas/AdsProtection.js';
import AutoRole from '../../Mongo/Schemas/AutoRole.js';
import BirthdayConfig from '../../Mongo/Schemas/BirthdayConfig.js';
import Dad from '../../Mongo/Schemas/Dad.js';
import Hastebin from '../../Mongo/Schemas/Hastebin.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import RoleMenu from '../../Mongo/Schemas/RoleMenu.js';
import TempBan from '../../Mongo/Schemas/TempBan.js';
import TicketConfig from '../../Mongo/Schemas/TicketConfig.js';
import Welcome from '../../Mongo/Schemas/Welcome.js';
import Tickets from '../../Mongo/Schemas/Tickets.js';
import Event from '../../Structures/Event.js';
import StarBoard from '../../Mongo/Schemas/StarBoard.js';

export const EventF = class extends Event {
  async run(guild) {
    // when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    this.client.user.setActivity(
      `/help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString('en')} Users`,
      {
        type: ActivityType.Watching
      }
    );

    // adsprot table
    await AdsProtection.deleteMany({ guildId: guild.id });

    // autorole table
    await AutoRole.deleteMany({ guildId: guild.id });

    // ban table
    await TempBan.deleteMany({ guildId: guild.id });

    // birthdayConfig table
    await BirthdayConfig.deleteMany({ guildId: guild.id });

    // dadbot table
    await Dad.deleteMany({ guildId: guild.id });

    // hastebin table
    await Hastebin.deleteMany({ guildId: guild.id });

    // logging table
    await Logging.deleteMany({ guildId: guild.id });

    // rolemenu table
    await RoleMenu.deleteMany({ guildId: guild.id });

    // setwelcome table
    await Welcome.deleteMany({ guildId: guild.id });

    // ticketConfig table
    await TicketConfig.deleteMany({ guildId: guild.id });

    // tickets table
    await Tickets.deleteMany({ guildId: guild.id });

    // starboard table
    await StarBoard.deleteMany({ guildId: guild.id });
  }
};

export default EventF;
