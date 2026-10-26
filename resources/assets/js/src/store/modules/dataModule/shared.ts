function isIntegerId(id: string): boolean {
    return /^(0|[1-9]\d*)$/.test(id);
}

export function newRecordId(existingIds: Iterable<string>): string {
    let largestExistingId = 0;
    for (const id of existingIds) {
        if (isIntegerId(id)) {
            largestExistingId = Math.max(largestExistingId, Number(id));
        }
    }

    return String(largestExistingId + 1);
}

// Relationship fields are Firebase-friendly maps, not arrays, so individual memberships can be patched.
export function membershipIds<Id extends string>(memberships: Record<Id, true>): Id[] {
    return Object.keys(memberships) as Id[];
}

export function hasMembership<Id extends string>(memberships: Record<Id, true>, id: Id): boolean {
    return memberships[id] === true;
}
