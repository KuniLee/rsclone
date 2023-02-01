import { initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import * as process from 'process'
import { FirebaseConfigType } from 'types/types'

export type AuthLoaderInstance = InstanceType<typeof AuthLoader>

export class AuthLoader {
    private firebaseConfig: FirebaseConfigType
    private app: unknown
    constructor() {
        this.firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY || '',
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
            databaseURL: process.env.FIREBASE_DATABASE_URL || '',
            projectId: process.env.FIREBASE_PROJECT_ID || '',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
            appId: process.env.FIREBASE_API_ID || '',
        }
        this.app = initializeApp(this.firebaseConfig)
    }

    signUp(email: string, password: string) {
        const auth = getAuth()
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user
            })
            .catch((error) => {
                const errorCode = error.code
                const errorMessage = error.message
            })
    }

    async signIn(email: string, password: string) {
        const auth = getAuth()
        const result = signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential)
                return userCredential.user
            })
            .catch((error) => {
                const errorCode = error.code
                const errorMessage = error.message
                return null
            })
        return result
    }

    checkAuthState() {
        const auth = getAuth()
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid
            } else {
                console.log('Unknown user')
            }
        })
    }
}
