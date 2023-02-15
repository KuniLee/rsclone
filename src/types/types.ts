import { Timestamp } from 'firebase/firestore'
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
    createdAt: Timestamp
    id: string
    title: string
    userId: string
    images: StorageReference
    preview: Preview
    user?: UserData
}

export type Preview = {
    image: string
    nextBtnText: string
    previewBlocks: Array<{ type: 'text'; value: string }>
}

export type UserData = {
    uid: string
    createdAt: {
        toDate: () => Date
        seconds: number
        nanoseconds: number
    }
    email: string
    displayName: string
    properties: Partial<UserProps>
}

export type UserProps = {
    fullName: string
    avatar: string | null
    about: string
}

export type BlocksType = {
    options?: {
        size?: string
        lang?: string
    }
    type: 'heading' | 'code' | 'delimiter' | 'text'
    mod?: string
    value: string
}

export type ParsedArticle = {
    blocks: Array<BlocksType>
}

export type ParsedPreviewArticle = {
    image: string
    nextBtnText: string
    previewBlocks: Array<BlocksType>
}

export type NewArticleData = {
    blocks: Array<BlocksType>
    title: string
    keywords: Array<string>
    lang: string
    preview: ParsedPreviewArticle
    userId: string
    isTranslate?: boolean
    translateAuthor?: string
    translateLink?: string
}
