export function nextStringId(records: Record<string, unknown>): string {
    const existingIds = Object.keys(records).map((id) => parseInt(id, 10));
    const highestId = existingIds.length === 0
        ? 0
        : Math.max(...existingIds);
    return String(highestId + 1);
}
