import { ParsedQuery } from 'query-string'
import EventEmitter from 'events'
import { Timestamp } from 'firebase/firestore'
import { Flows } from 'types/enums'
import { StorageReference } from 'firebase/storage'
import { NewArticleData, Preview, UserData } from 'types/types'

export type URLParams = {
    path: string[]
    search: ParsedQuery
}

export interface rootModel extends EventEmitter {
    path: Array<string>
    search: ParsedQuery
    lang: 'ru' | 'en'
}

export interface DropdownMenuElements {
    header: HTMLElement
    dropdownMenu: HTMLElement
    popupSettings: HTMLElement
    overlay: HTMLElement
    dropdownMenuWrapper?: Element
    navLinksEl: NodeListOf<Element>
}

export interface HeaderElements {
    header: HTMLElement
    dropdownMenu: HTMLElement
    popupSettings: HTMLElement
    sidebarUserMenu: HTMLElement
}

export interface SidebarUserMenuElements {
    header: HTMLElement
    sidebarUserMenu: HTMLElement
    overlay: HTMLElement
    popupSettings: HTMLElement
    navLinksEl: NodeListOf<Element>
}

export interface Article extends NewArticleData {
    createdAt: Timestamp
    id: string
    flows: Array<Flows>
    title: string
    userId: string
    images: StorageReference
    preview: Preview
    user?: UserData
}
