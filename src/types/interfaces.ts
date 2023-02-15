import { ParsedQuery } from 'query-string'
import EventEmitter from 'events'

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
