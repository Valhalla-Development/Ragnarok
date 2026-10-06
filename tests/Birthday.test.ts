import { afterEach, expect, mock, spyOn, test } from 'bun:test';
import { ChannelType, DiscordAPIError } from 'discord.js';
import moment from 'moment';
import BirthdayConfig from '../src/mongo/BirthdayConfig.js';
import Birthdays from '../src/mongo/Birthdays.js';
import { runBirthdayAnnouncements } from '../src/utils/Birthday.js';
import { log } from '../src/utils/Console.js';

afterEach(() => mock.restore());

function setup(error?: Error, claimed = true) {
    spyOn(log, 'info').mockImplementation(() => {});
    spyOn(log, 'error').mockImplementation(() => {});
    spyOn(Birthdays, 'find').mockResolvedValue([{ _id: 'birthday', UserId: 'user', Date: moment().format('MM/DD') }]);
    spyOn(BirthdayConfig, 'find').mockResolvedValue([{ GuildId: 'guild', ChannelId: 'channel' }]);
    const claim = spyOn(Birthdays, 'findOneAndUpdate').mockResolvedValue(claimed ? {} : null);
    const release = spyOn(Birthdays, 'updateOne').mockResolvedValue({ matchedCount: 1 });
    const send = error ? mock(async () => { throw error; }) : mock(async () => {});
    const channel = { id: 'channel', type: ChannelType.GuildText, send };
    const guild = { channels: { fetch: async () => channel }, members: { fetch: async () => ({ id: 'user' }) } };
    const client = { guilds: { cache: new Map([['guild', guild]]) } };
    return { client, claim, release, send };
}

test('successful sends retain their atomic claim', async () => {
    const { client, release, send, claim } = setup();
    expect(await runBirthdayAnnouncements(client)).toEqual({ claimed: 1, sent: 1 });
    expect(send).toHaveBeenCalledTimes(1);
    expect(release).not.toHaveBeenCalled();
    expect(claim.mock.calls[0][0].$or).toEqual([
        { 'AnnouncementAttempts.guild.Date': { $ne: moment().format('YYYY-MM-DD') } },
        { 'AnnouncementAttempts.guild.Count': { $lt: 3 } },
    ]);
});

test('rejected sends release only the matching claim for a later retry', async () => {
    const error = new DiscordAPIError({ message: 'Missing Permissions', code: 50013 }, 50013, 403, 'POST', 'https://example.invalid', {});
    const { client, release } = setup(error);
    expect(await runBirthdayAnnouncements(client)).toEqual({ claimed: 1, sent: 0 });
    expect(release.mock.calls[0][0]).toEqual({ _id: 'birthday', 'LastRun.guild': expect.any(Number) });
    expect(release.mock.calls[0][1]).toEqual({ $unset: { 'LastRun.guild': 1 } });
});

test('ambiguous transport and server failures retain claims to avoid duplicate sends', async () => {
    for (const error of [new Error('timeout'), new DiscordAPIError({ message: 'server error', code: 0 }, 0, 500, 'POST', 'https://example.invalid', {})]) {
        const { client, release } = setup(error);
        expect(await runBirthdayAnnouncements(client)).toEqual({ claimed: 1, sent: 0 });
        expect(release).not.toHaveBeenCalled();
        mock.restore();
    }
});

test('already claimed or exhausted announcements are not sent', async () => {
    const { client, release, send } = setup(undefined, false);
    expect(await runBirthdayAnnouncements(client)).toEqual({ claimed: 0, sent: 0 });
    expect(send).not.toHaveBeenCalled();
    expect(release).not.toHaveBeenCalled();
});
