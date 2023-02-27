import { DocumentReference, Timestamp } from 'firebase/firestore'

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

export type Preview = {
    image: string
    nextBtnText: string
    imagePosition: [string, string]
    previewBlocks: Array<{ type: 'text'; value: string }>
}

export type UserData = {
    uid: string
    createdAt: Timestamp
    email: string
    displayName: string
    properties: Partial<UserProps>
    comments?: Array<string>
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
    type: string
    mod?: string
    imageSrc?: string
    value: string | Array<BlocksType>
}

export type ParsedData = {
    blocks: Array<BlocksType>
    time?: number
}

export type ParsedPreviewArticle = {
    image: string
    nextBtnText: string
    imagePosition?: Array<string>
    previewBlocks: Array<BlocksType>
}

export type NewArticleData = {
    blocks: Array<BlocksType>
    title: string
    flows: Array<string>
    keywords: Array<string>
    lang: string
    preview: ParsedPreviewArticle
    difficult: string
    userId: string
    isTranslate?: boolean
    translateAuthor?: string
    translateLink?: string
    createdAt?: {
        seconds: number
        nanoseconds: number
    }
}

export type CommentInfo = {
    blocks: Array<BlocksType>
    createdAt: Timestamp
    user: DocumentReference | UserData
}
