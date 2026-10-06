import { expect, test } from 'bun:test';
import { splitMessages } from '../src/utils/ai/Messages.js';

test('short responses are unchanged', () => {
    expect(splitMessages('hello world')).toEqual(['hello world']);
});

test('long tokens and final tokens stay inside the Discord limit', () => {
    for (const input of ['x'.repeat(2001), 'hello ' + 'x'.repeat(10000), 'x'.repeat(10000) + ' end']) {
        const chunks = splitMessages(input);
        expect(chunks.every((chunk) => chunk.length <= 2000)).toBe(true);
        expect(chunks.map((chunk) => chunk.replace(/\n`\d+`\/`\d+`$/, '')).join('').replaceAll(' ', '')).toBe(input.replaceAll(' ', ''));
    }
});

test('caller limits cannot produce oversized Discord messages', () => {
    expect(splitMessages('x'.repeat(10000), 5000).every((chunk) => chunk.length <= 2000)).toBe(true);
});

test('hard splitting keeps emoji surrogate pairs together', () => {
    const chunks = splitMessages('a' + '😀'.repeat(2000));
    expect(chunks.every((chunk) => chunk.isWellFormed())).toBe(true);
});

test('invalid length fails clearly', () => {
    expect(() => splitMessages('hello', NaN)).toThrow(RangeError);
});
