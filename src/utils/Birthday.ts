import { ChannelType, type Client } from 'discord.js';
import moment from 'moment';
import BirthdayConfig from '../mongo/BirthdayConfig.js';
import Birthdays from '../mongo/Birthdays.js';
import { log } from './Console.js';

/**
 * Announce today's birthdays for every configured guild this process has.
 * Uses an atomic LastRun claim so concurrent ticks cannot double-ping.
 */
export async function runBirthdayAnnouncements(client: Client): Promise<{
    claimed: number;
    sent: number;
}> {
    const today = moment().format('MM/DD');
    const nowUnix = moment().unix();
    const cutoff = nowUnix - 86_400;
    const [birthdays, birthdayConfigs] = await Promise.all([
        Birthdays.find(),
        BirthdayConfig.find(),
    ]);

    let claimed = 0;
    let sent = 0;

    await Promise.all(
        birthdayConfigs.map(async (config) => {
            const guildId = config.GuildId;
            const channelId = config.ChannelId;
            if (!(guildId && channelId)) {
                return;
            }

            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                return;
            }

            const channel = await guild.channels.fetch(channelId).catch(() => null);
            if (!channel || channel.type !== ChannelType.GuildText) {
                return;
            }

            await Promise.all(
                birthdays.map(async (birthday) => {
                    if (!(birthday.UserId && birthday.Date)) {
                        return;
                    }

                    const birthdayDay = moment(birthday.Date, ['MM/DD/YYYY', 'MM/DD']).format(
                        'MM/DD'
                    );
                    if (birthdayDay !== today) {
                        return;
                    }

                    const user = await guild.members.fetch(birthday.UserId).catch(() => null);
                    if (!user) {
                        return;
                    }

                    const claimedDoc = await Birthdays.findOneAndUpdate(
                        {
                            _id: birthday._id,
                            $nor: [
                                { [`LastRun.${guildId}`]: { $gt: cutoff } },
                                {
                                    LastRun: {
                                        $elemMatch: { [guildId]: { $gt: cutoff } },
                                    },
                                },
                            ],
                        },
                        [
                            {
                                $set: {
                                    LastRun: {
                                        $mergeObjects: [
                                            {
                                                $cond: [
                                                    {
                                                        $eq: [{ $type: '$LastRun' }, 'object'],
                                                    },
                                                    { $ifNull: ['$LastRun', {}] },
                                                    {},
                                                ],
                                            },
                                            { [guildId]: nowUnix },
                                        ],
                                    },
                                },
                            },
                        ],
                        { updatePipeline: true }
                    );
                    if (!claimedDoc) {
                        return;
                    }
                    claimed += 1;

                    try {
                        await channel.send(`It's ${user}'s birthday! Say Happy Birthday! 🍰`);
                        sent += 1;
                    } catch (error) {
                        log.error(`Failed to send birthday message for ${user.id}`, error);
                    }
                })
            );
        })
    );

    return { claimed, sent };
}
