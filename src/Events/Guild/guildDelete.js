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
import Guilds from '../../Mongo/Schemas/Guilds.js';

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

    await Guilds.deleteOne({ GuildId: guild.id });

    // adsprot table
    await AdsProtection.deleteMany({ GuildId: guild.id });

    // autorole table
    await AutoRole.deleteMany({ GuildId: guild.id });

    // ban table
    await TempBan.deleteMany({ GuildId: guild.id });

    // birthdayConfig table
    await BirthdayConfig.deleteMany({ GuildId: guild.id });

    // dadbot table
    await Dad.deleteMany({ GuildId: guild.id });

    // hastebin table
    await Hastebin.deleteMany({ GuildId: guild.id });

    // logging table
    await Logging.deleteMany({ GuildId: guild.id });

    // rolemenu table
    await RoleMenu.deleteMany({ GuildId: guild.id });

    // setwelcome table
    await Welcome.deleteMany({ GuildId: guild.id });

    // ticketConfig table
    await TicketConfig.deleteMany({ GuildId: guild.id });

    // tickets table
    await Tickets.deleteMany({ GuildId: guild.id });

    // starboard table
    await StarBoard.deleteMany({ GuildId: guild.id });
  }
};

export default EventF;
