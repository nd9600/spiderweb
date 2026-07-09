export function newRecordId(): string {
    return crypto.randomUUID();
}

// Relationship fields are Firebase-friendly maps, not arrays, so individual memberships can be patched.
export function membershipIds<Id extends string>(memberships: Record<Id, true>): Id[] {
    return Object.keys(memberships) as Id[];
}

export function hasMembership<Id extends string>(memberships: Record<Id, true>, id: Id): boolean {
    return memberships[id] === true;
}

export function addMembership<Id extends string>(memberships: Record<Id, true>, id: Id): void {
    memberships[id] = true;
}

export function removeMembership<Id extends string>(memberships: Record<Id, true>, id: Id): void {
    delete memberships[id];
}
