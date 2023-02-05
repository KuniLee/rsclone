import { initializeApp } from 'firebase/app'
import { getFirestore, serverTimestamp, setDoc, doc } from 'firebase/firestore'
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    updateProfile,
    signOut,
} from 'firebase/auth'
import type { FirebaseApp } from 'firebase/app'
import type { User, Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export { serverTimestamp, setDoc, doc }
import EventEmitter from 'events'

export type { User, Auth, Firestore }

export type FirebaseEvents = 'CHANGE_AUTH'
export type FireBaseAPIInstance = InstanceType<typeof FireBaseAPI>

export class FireBaseAPI extends EventEmitter {
    public app: FirebaseApp
    public db: Firestore
    public auth: Auth

    constructor() {
        super()
        const config = {
            apiKey: process.env.FIREBASE_API_KEY || '',
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
            databaseURL: process.env.FIREBASE_DATABASE_URL || '',
            projectId: process.env.FIREBASE_PROJECT_ID || '',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
            appId: process.env.FIREBASE_API_ID || '',
        }
        this.app = initializeApp(config)
        this.db = getFirestore(this.app)
        this.auth = getAuth()
        onAuthStateChanged(this.auth, (user) => {
            if (user) this.emit<User>('CHANGE_AUTH', user)
        })
    }

    async signUp(email: string, password: string, nick: string) {
        const auth = getAuth()
        const result = await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => userCredential.user)
            .catch((error) => {
                const errorCode = error.code
                const errorMessage = error.message
                console.log(errorCode, errorMessage)
                return false
            })
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
                displayName: `${nick}`,
                photoURL: '',
            })
                .then(() => {
                    console.log('name added')
                })
                .catch((er) => {
                    console.log(er)
                })
        }
        return result
    }

    async signIn(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password)
            .then((userCredential) => {
                console.log(userCredential)
                return userCredential.user
            })
            .catch((error) => {
                const errorCode = error.code
                const errorMessage = error.message
                return null
            })
    }

    async signOut() {
        const auth = getAuth()
        signOut(auth)
            .then(() => {
                return true
            })
            .catch((error) => {
                // An error happened.
            })
    }

    async checkEmailInDatabase(email: string) {
        return await fetchSignInMethodsForEmail(this.auth, email)
            .then((result) => {
                return result
            })
            .catch((err) => {
                return err
            })
    }

    emit<T>(event: FirebaseEvents, arg?: T) {
        return super.emit(event, arg)
    }

    on<T>(event: FirebaseEvents, callback: (arg: T) => void) {
        return super.on(event, callback)
    }
}
