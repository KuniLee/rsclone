import { initializeApp, FirebaseApp } from 'firebase/app'
import {
    getFirestore,
    Firestore,
    collection,
    addDoc,
    getDoc,
    getDocs,
    doc,
    setDoc,
    DocumentData,
} from 'firebase/firestore'
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    updateProfile,
    signOut,
} from 'firebase/auth'
import { FirebaseConfigType } from 'types/types'

export type FireBaseAPIInstance = InstanceType<typeof FireBaseAPI>

export class FireBaseAPI {
    private firebaseConfig: FirebaseConfigType
    public app: FirebaseApp
    public db: Firestore

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
        this.db = getFirestore(this.app)
    }

    async getAllDocsInCollection(path: string) {
        const querySnapshot = await getDocs(collection(this.db, path))
        querySnapshot.forEach((doc) => {
            console.log(doc.id, ' => ', doc.data())
        })
    }

    async getDocument(path: string, ...pathSegments: Array<string>) {
        const docRef = doc(this.db, path, ...pathSegments)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            console.log('Document data:', docSnap.data())
        } else {
            // doc.data() will be undefined in this case
            console.log('No such document!')
        }
    }

    async addCollection(path: string) {
        try {
            const docRef = await addDoc(collection(this.db, path), {
                first: 'Ada',
                last: 'Lovelace',
                born: 1815,
            })
            console.log('Document written with ID: ', docRef.id)
        } catch (e) {
            console.error('Error adding document: ', e)
        }
    }

    async setDocument(path: string, data: DocumentData, pathSegments: Array<string>) {
        await setDoc(doc(this.db, path, ...pathSegments), data)
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

    async checkAuthState() {
        const auth = getAuth()
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid
                console.log(user)
            } else {
                console.log('Unknown user')
            }
        })
    }

    async checkEmailInDatabase(email: string) {
        const auth = getAuth()
        const result = await fetchSignInMethodsForEmail(auth, email)
            .then((result) => {
                return result
            })
            .catch((err) => {
                return err
            })
        return result
    }
}
