export interface FirebaseConfig {
  apiKey: string
  authDomain?: string
  databaseURL?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
}

export interface FirebaseDatabase {
  ref: (path: string) => {
    set: (value: any) => Promise<void>
    once: (eventType: string) => Promise<{ val: () => string }>
  }
}

declare const firebaseDbFactory: (firebaseConfig: FirebaseConfig) => FirebaseDatabase

export default firebaseDbFactory