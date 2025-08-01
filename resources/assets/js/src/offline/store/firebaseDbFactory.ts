import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, type Database } from "firebase/database";

export interface FirebaseConfig {
  apiKey: string
  authDomain?: string
  databaseURL?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
}

// Create a wrapper that provides the old v8-style API for compatibility
export interface FirebaseDatabase {
  ref: (path: string) => {
    set: (value: any) => Promise<void>
    once: (eventType: string) => Promise<{ val: () => any }>
  }
}

export default function firebaseDbFactory(firebaseConfig: FirebaseConfig): FirebaseDatabase {
    if (firebaseConfig.apiKey === "") {
        throw new Error("firebase config is wrong, please check it: " + JSON.stringify(firebaseConfig));
    }
    if (!getApps().length) {
        initializeApp(firebaseConfig);
    }
    
    const database = getDatabase();
    
    // Return a wrapper that provides the old v8-style API
    return {
        ref: (path: string) => ({
            set: async (value: any) => {
                const dbRef = ref(database, path);
                return set(dbRef, value);
            },
            once: async (eventType: string) => {
                const dbRef = ref(database, path);
                const snapshot = await get(dbRef);
                return {
                    val: () => snapshot.val()
                };
            }
        })
    };
}