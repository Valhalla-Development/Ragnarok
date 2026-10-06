export function splitMessages(content: string, length = 1900): string[] {
    // Reserve enough room for pagination even when a response needs many chunks.
    if (!Number.isFinite(length) || length < 2) {
        throw new RangeError('Message chunk length must be finite and at least 2.');
    }
    const chunkLimit = Math.min(1900, Math.floor(length));
    if (content.length <= chunkLimit) {
        return [content];
    }

    const chunks: string[] = [];
    let remainingContent = content.trim();

    while (remainingContent.length > 0) {
        let chunkEnd = Math.min(chunkLimit, remainingContent.length);
        if (remainingContent.length > chunkLimit) {
            const space = remainingContent.lastIndexOf(' ', chunkLimit);
            if (space > 0) {
                chunkEnd = space;
            }
            // Keep a surrogate pair together when a long token needs a hard split.
            const previous = remainingContent.charCodeAt(chunkEnd - 1);
            const next = remainingContent.charCodeAt(chunkEnd);
            if (
                chunkEnd > 1 &&
                previous >= 0xd8_00 &&
                previous <= 0xdb_ff &&
                next >= 0xdc_00 &&
                next <= 0xdf_ff
            ) {
                chunkEnd -= 1;
            }
        }

        chunks.push(remainingContent.slice(0, chunkEnd).trim());
        remainingContent = remainingContent.slice(chunkEnd).trim();
    }

    const totalChunks = chunks.length;
    return chunks.map((chunk, index) => `${chunk}\n\`${index + 1}\`/\`${totalChunks}\``);
}
