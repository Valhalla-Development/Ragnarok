import Balance from '../../mongo/Balance.js';

class TransferUnavailableError extends Error {}

/** Transfer bank funds together so a failed credit cannot leave a partial debit. */
export async function transferBankFunds(
    senderId: string,
    recipientId: string,
    amount: number
): Promise<boolean> {
    if (
        senderId === recipientId ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > Number.MAX_SAFE_INTEGER
    ) {
        return false;
    }

    try {
        await Balance.db.transaction(async (session) => {
            const debit = await Balance.updateOne(
                { Bank: { $gte: amount }, IdJoined: senderId },
                { $inc: { Bank: -amount, Total: -amount } },
                { session }
            );
            if (debit.matchedCount !== 1) {
                throw new TransferUnavailableError();
            }

            const credit = await Balance.updateOne(
                { IdJoined: recipientId },
                { $inc: { Bank: amount, Total: amount } },
                { session }
            );
            if (credit.matchedCount !== 1) {
                throw new TransferUnavailableError();
            }
        });
        return true;
    } catch (error) {
        if (error instanceof TransferUnavailableError) {
            return false;
        }
        throw error;
    }
}
