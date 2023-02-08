import type { StorageReference } from 'firebase/storage'

export type FirebaseConfigType = {
    storageBucket: string
    apiKey: string
    messagingSenderId: string
    appId: string
    projectId: string
    databaseURL: string
    authDomain: string
}

export type AuthViewTypes = {
    email?: string
    password?: string
    nick?: string
    path?: string
    query?: string
}

export type Article = {
    id: string
    title: string
    userId: string
    images: StorageReference
}
