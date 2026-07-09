export type FirebaseUpdatePatch = Record<string, unknown>;

type FirebasePatchWriter = (patch: FirebaseUpdatePatch) => Promise<void>;

let firebasePatchWriter: Nullable<FirebasePatchWriter> = null;
let firebaseWriteSuppressionDepth = 0;

export function setFirebasePatchWriter(writer: FirebasePatchWriter): void {
    // Data-module actions should not import the root store just to write remote patches.
    firebasePatchWriter = writer;
}

export function runWithoutFirebaseWrites<T>(callback: () => T): T {
    firebaseWriteSuppressionDepth += 1;
    try {
        return callback();
    } finally {
        firebaseWriteSuppressionDepth -= 1;
    }
}

export function writeFirebaseDataModulePatch(patch: FirebaseUpdatePatch): void {
    // Imports and Firebase listener updates mutate Pinia, but they must not create another remote write.
    if (firebasePatchWriter == null || firebaseWriteSuppressionDepth > 0 || Object.keys(patch).length === 0) {
        return;
    }

    void firebasePatchWriter(patch).catch((error: unknown) => {
        console.log(error);
    });
}
