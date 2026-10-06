import { expect, spyOn, test } from 'bun:test';
import { createRequire } from 'node:module';
import axios from 'axios';

const require = createRequire(import.meta.url);
const fetcher = require('reddit-image-fetcher');
const fetcherRequire = createRequire(require.resolve('reddit-image-fetcher'));

test('Reddit image fetcher resolves the maintained Axios version', () => {
    expect(fetcherRequire('axios/package.json').version).toBe(axios.VERSION);
    expect(axios.VERSION).toBe('1.20.0');
});

test('Reddit image fetcher formats responses with current Axios', async () => {
    const get = spyOn(fetcherRequire('axios'), 'get').mockResolvedValue({ data: { data: { children: [{ data: {
        id: 'test', title: 'test meme', url: 'https://example.invalid/meme.png', ups: 42, over_18: false,
    } }] } } });
    try {
        const memes = await fetcher.fetch({ subreddit: ['memes'], total: 1, type: 'custom' });
        expect(memes).toHaveLength(1);
        expect(memes[0]).toMatchObject({ title: 'test meme', upvotes: 42, image: 'https://example.invalid/meme.png' });
    } finally {
        get.mockRestore();
    }
});

test('Reddit HTTP helper works with Axios against a local server', async () => {
    const server = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: () => Response.json({ ok: true }) });
    try {
        const { getRequest } = fetcherRequire('./utils');
        expect((await getRequest(`http://127.0.0.1:${server.port}/`)).data).toEqual({ ok: true });
    } finally {
        server.stop(true);
    }
});

