import EventEmitter from 'events'
import { ParsedQuery } from 'query-string'

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
}
