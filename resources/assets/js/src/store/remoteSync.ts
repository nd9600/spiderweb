export type FirebaseUpdatePatch = Record<string, unknown>;

type FirebasePatchWriter = (patch: FirebaseUpdatePatch) => Promise<void>;

let firebasePatchWriter: Nullable<FirebasePatchWriter> = null;
let firebaseWriteSuppressionDepth = 0;

export function setFirebasePatchWriter(writer: FirebasePatchWriter): void {
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
    if (firebasePatchWriter == null || firebaseWriteSuppressionDepth > 0 || Object.keys(patch).length === 0) {
        return;
    }

    void firebasePatchWriter(patch).catch((error: unknown) => {
        console.log(error);
    });
}
