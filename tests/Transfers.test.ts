import { afterEach, expect, mock, spyOn, test } from 'bun:test';
import Balance from '../src/mongo/Balance.js';
import { transferBankFunds } from '../src/utils/economy/Transfers.js';

afterEach(() => mock.restore());

function mockTransaction() {
    const session = { transaction: 'test' };
    const transaction = spyOn(Balance.db, 'transaction').mockImplementation(async (callback) => callback(session));
    return { session, transaction };
}

test('transfer uses a conditional debit and credits within the same transaction', async () => {
    const { session } = mockTransaction();
    const update = spyOn(Balance, 'updateOne').mockResolvedValue({ matchedCount: 1 });
    expect(await transferBankFunds('sender-guild', 'recipient-guild', 100)).toBe(true);
    expect(update.mock.calls).toEqual([
        [{ Bank: { $gte: 100 }, IdJoined: 'sender-guild' }, { $inc: { Bank: -100, Total: -100 } }, { session }],
        [{ IdJoined: 'recipient-guild' }, { $inc: { Bank: 100, Total: 100 } }, { session }],
    ]);
});

test('insufficient funds abort before crediting the recipient', async () => {
    mockTransaction();
    const update = spyOn(Balance, 'updateOne').mockResolvedValue({ matchedCount: 0 });
    expect(await transferBankFunds('sender-guild', 'recipient-guild', 100)).toBe(false);
    expect(update).toHaveBeenCalledTimes(1);
});

test('missing recipient rejects the transaction callback to roll back the debit', async () => {
    const transaction = spyOn(Balance.db, 'transaction').mockImplementation(async (callback) => {
        await expect(callback({ transaction: 'test' })).rejects.toThrow();
        throw new Error('transaction aborted');
    });
    spyOn(Balance, 'updateOne').mockResolvedValueOnce({ matchedCount: 1 }).mockResolvedValueOnce({ matchedCount: 0 });
    await expect(transferBankFunds('sender-guild', 'recipient-guild', 100)).rejects.toThrow('transaction aborted');
    expect(transaction).toHaveBeenCalledTimes(1);
});

test('database failures propagate rather than reporting a successful transfer', async () => {
    mockTransaction();
    spyOn(Balance, 'updateOne').mockResolvedValueOnce({ matchedCount: 1 }).mockRejectedValueOnce(new Error('write failed'));
    await expect(transferBankFunds('sender-guild', 'recipient-guild', 100)).rejects.toThrow('write failed');
});

test('invalid transfers never open a transaction', async () => {
    const { transaction } = mockTransaction();
    for (const amount of [0, -1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        expect(await transferBankFunds('sender', 'recipient', amount)).toBe(false);
    }
    expect(await transferBankFunds('same', 'same', 100)).toBe(false);
    expect(transaction).not.toHaveBeenCalled();
});
