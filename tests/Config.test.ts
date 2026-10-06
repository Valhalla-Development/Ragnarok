import { expect, test } from 'bun:test';

async function loadConfig(uri?: string) {
    const path = new URL('../src/config/Config.ts', import.meta.url).pathname;
    const child = Bun.spawn([process.execPath, '--no-env-file', '-e', `await import(${JSON.stringify(path)})`], {
        cwd: '/tmp',
        env: { BOT_TOKEN: 'test-token', ...(uri ? { MONGO_URI: uri } : {}) },
        stdout: 'pipe',
        stderr: 'pipe',
    });
    return { code: await child.exited, error: await new Response(child.stderr).text() };
}

test('missing MongoDB URI fails before connecting to services', async () => {
    const result = await loadConfig();
    expect(result.code).not.toBe(0);
    expect(result.error).toContain('Missing or invalid environment variables: MONGO_URI');
});

test('invalid MongoDB URI fails clearly', async () => {
    const result = await loadConfig('https://example.invalid');
    expect(result.code).not.toBe(0);
    expect(result.error).toContain('Missing or invalid environment variables: MONGO_URI');
});

test('supported MongoDB URI schemes validate without connecting', async () => {
    for (const uri of ['mongodb://127.0.0.1/test', 'mongodb+srv://example.invalid/test']) {
        expect((await loadConfig(uri)).code).toBe(0);
    }
});
